# PostgreSQL Migration Guide

This guide explains how to migrate Micasa from SQLite (local development) to PostgreSQL (AWS RDS production).

## Overview

Micasa uses:
- **SQLite** for local development (simple, file-based database)
- **PostgreSQL** for AWS production (robust, scalable RDS database)

## Prerequisites

- AWS RDS PostgreSQL instance (db.t3.micro for free tier)
- PostgreSQL client (`psql`) installed locally
- Access to your RDS endpoint and credentials

## Step 1: Create RDS PostgreSQL Database

Follow the AWS_DEPLOYMENT.md guide to create your RDS instance.

Key settings:
- Engine: PostgreSQL 15.x
- Instance: db.t3.micro (free tier)
- Database name: `micasa`
- Master username: `micasa`
- Master password: [Your strong password]

## Step 2: Connect to PostgreSQL

From your EC2 instance or local machine with RDS access:

```bash
# Connect to your RDS instance
psql -h your-rds-endpoint.us-east-1.rds.amazonaws.com \
     -U micasa \
     -d micasa \
     -p 5432
```

Enter your master password when prompted.

## Step 3: Run Schema Migration

Apply the PostgreSQL schema:

```bash
# From your project directory
psql -h your-rds-endpoint.us-east-1.rds.amazonaws.com \
     -U micasa \
     -d micasa \
     -f server/src/config/postgres-schema.sql
```

## Step 4: Verify Schema

Check that all tables were created:

```sql
-- List all tables
\dt

-- Check users table structure
\d users

-- Check indexes
\di

-- Exit psql
\q
```

You should see 14 tables:
- users
- shopping_notes
- chores
- appointments
- appointment_attendees
- reminders
- todo_lists
- todo_items
- todo_list_shared_with
- whiteboard_notes
- vision_board_items
- messages
- webhooks

## Step 5: Update Environment Variables

Update your `server/.env` file (or EC2 environment variables):

```env
# Enable PostgreSQL by setting RDS variables
RDS_HOSTNAME=your-rds-endpoint.us-east-1.rds.amazonaws.com
RDS_PORT=5432
RDS_USERNAME=micasa
RDS_PASSWORD=your_strong_password
RDS_DB_NAME=micasa

# Keep SQLite path for fallback
DATABASE_PATH=./data/micasa.db
```

## Step 6: Restart Application

```bash
# If using Docker
docker restart micasa-app

# If running directly
npm run server
```

## Data Migration (Optional)

If you have existing SQLite data to migrate to PostgreSQL:

### Method 1: Manual Export/Import

```bash
# Export data from SQLite
sqlite3 server/data/micasa.db .dump > micasa-data.sql

# Edit the dump file to convert SQLite syntax to PostgreSQL
# This requires manual editing:
# - Remove SQLite-specific commands
# - Convert INTEGER timestamps to TIMESTAMP
# - Fix AUTOINCREMENT to SERIAL
# - Update boolean values (0/1 to false/true)

# Import to PostgreSQL
psql -h your-rds-endpoint.us-east-1.rds.amazonaws.com \
     -U micasa \
     -d micasa \
     -f micasa-data.sql
```

### Method 2: Application-Level Migration (Recommended)

Create a migration script that:
1. Reads all data from SQLite
2. Transforms the data
3. Writes to PostgreSQL

```javascript
// server/src/scripts/migrate-to-postgres.js
const sqlite3 = require('better-sqlite3');
const { Pool } = require('pg');

const sqliteDb = new sqlite3('./data/micasa.db');
const pgPool = new Pool({
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME
});

// Migrate users
const users = sqliteDb.prepare('SELECT * FROM users').all();
for (const user of users) {
  await pgPool.query(
    'INSERT INTO users (username, password, display_name, ...) VALUES ($1, $2, $3, ...)',
    [user.username, user.password, user.displayName, ...]
  );
}

// Repeat for all tables...
```

## Differences Between SQLite and PostgreSQL

### Data Types
| SQLite | PostgreSQL |
|--------|-----------|
| INTEGER | INTEGER or SERIAL |
| TEXT | VARCHAR(n) or TEXT |
| REAL | REAL or DOUBLE PRECISION |
| BLOB | BYTEA |

### Timestamps
- **SQLite**: Stores as INTEGER (Unix timestamp in milliseconds)
- **PostgreSQL**: Uses native TIMESTAMP type

### Booleans
- **SQLite**: Stores as INTEGER (0 = false, 1 = true)
- **PostgreSQL**: Native BOOLEAN type (true/false)

### Auto-increment
- **SQLite**: `INTEGER PRIMARY KEY AUTOINCREMENT`
- **PostgreSQL**: `SERIAL PRIMARY KEY`

### JSON Data
- **SQLite**: Stored as TEXT
- **PostgreSQL**: Native JSONB type (used for webhooks events, recurrence patterns)

## Troubleshooting

### Connection Refused
- Check RDS security group allows your EC2 instance
- Verify RDS is in the same VPC
- Check RDS is publicly accessible (if connecting from outside AWS)

### Authentication Failed
- Verify username and password
- Check RDS master user credentials in AWS Console

### Schema Creation Errors
- Ensure database is empty or drop existing tables
- Check PostgreSQL version (requires 15+)
- Verify user has CREATE privileges

### Application Errors After Migration
- Check environment variables are set correctly
- Verify RDS endpoint is reachable from EC2
- Check application logs: `docker logs micasa-app`

## Performance Tuning

### Connection Pooling
PostgreSQL uses connection pooling. Update constants if needed:

```javascript
// server/src/constants/index.js
DATABASE: {
  PG_POOL_MAX: 20,              // Max connections
  PG_IDLE_TIMEOUT_MS: 30000,    // 30 seconds
  PG_CONNECTION_TIMEOUT_MS: 2000 // 2 seconds
}
```

### Indexes
All important indexes are created by the schema. Monitor query performance:

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE users;
ANALYZE shopping_notes;
-- ... for all tables
```

## Backup and Recovery

### Automated Backups
RDS provides automated backups (included in free tier):
- Retention: 7 days
- Backup window: Set during RDS creation

### Manual Backup
```bash
# Create backup
pg_dump -h your-rds-endpoint.us-east-1.rds.amazonaws.com \
        -U micasa \
        -d micasa \
        -f micasa-backup-$(date +%Y%m%d).sql

# Restore from backup
psql -h your-rds-endpoint.us-east-1.rds.amazonaws.com \
     -U micasa \
     -d micasa \
     -f micasa-backup-20231201.sql
```

### Snapshot
Create RDS snapshot from AWS Console for point-in-time recovery.

## Cost Considerations

### Free Tier
- 750 hours/month of db.t3.micro (covers 1 instance 24/7)
- 20 GB storage
- 20 GB backup storage

### After Free Tier
- db.t3.micro: ~$15/month
- Storage: $0.115/GB/month
- Backups: $0.095/GB/month (beyond 100% of database storage)

## Future Enhancements

To fully support PostgreSQL in the application code:

1. **Create Database Adapter Pattern**
   - Abstract database operations
   - Support both SQLite and PostgreSQL
   - Switch based on environment

2. **Update All Queries**
   - Replace SQLite-specific syntax
   - Use parameterized queries for both databases
   - Handle timestamp conversions

3. **Add Migration Scripts**
   - Automated data migration
   - Rollback capabilities
   - Zero-downtime migration

4. **Testing**
   - Test all features on PostgreSQL
   - Integration tests for both databases
   - Performance benchmarks

## Support

For issues or questions:
- Check AWS_DEPLOYMENT.md for AWS-specific guidance
- Review PostgreSQL logs in CloudWatch
- Create GitHub issue with error details

---

**Note**: The current implementation still uses SQLite by default. Full PostgreSQL support requires updating all database queries in models and controllers. This guide provides the foundation for AWS RDS deployment. Consider this for production deployments requiring scalability and reliability.
