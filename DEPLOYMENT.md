# Micasa Deployment Guide

This guide will help you deploy Micasa to a production environment.

## Prerequisites

Before deploying, ensure you have:
- Node.js v16 or higher
- A hosting platform (see options below)
- **No external database required** - Uses SQLite (file-based)

## Environment Configuration

### Production Environment Variables

Create `server/.env` with production settings:

```env
PORT=5000
JWT_SECRET=<generate-a-secure-secret-key>
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Database in Production

Micasa uses SQLite, a file-based database that requires no external setup:

- **Automatic Creation**: Database file is created automatically on first run
- **Location**: `server/data/micasa.db`
- **Persistence**: Ensure the `server/data` directory persists across deployments
- **Backups**: Simple - just backup the database file regularly

### Important for Deployment Platforms

Most cloud platforms use ephemeral filesystems. You need to:
1. Use a persistent volume/disk for the `server/data` directory
2. Set up regular backups of the database file
3. Consider using a mounted volume or object storage

## Deployment Options

### Option 1: Deploy to VPS (Recommended for SQLite)

**Best for**: Full control, persistent storage, SQLite databases

1. **Provision a VPS**
   - DigitalOcean, Linode, AWS EC2, or similar
   - Minimum 1GB RAM, 20GB storage

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and Setup**
   ```bash
   cd /var/www
   git clone https://github.com/cxb3rf1lth/Micasa.git
   cd Micasa
   
   # Run installation script
   ./install.sh
   
   # Or manual setup
   npm run install:all
   cp server/.env.example server/.env
   # Edit server/.env with your settings
   npm run build
   ```

4. **Setup Process Manager (PM2)**
   ```bash
   sudo npm install -g pm2
   cd /var/www/Micasa/server
   pm2 start src/index.js --name micasa
   pm2 startup
   pm2 save
   ```

5. **Setup Nginx Reverse Proxy**
   ```bash
   sudo apt-get install nginx
   ```

   Create `/etc/nginx/sites-available/micasa`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Serve static files
       location / {
           root /var/www/Micasa/client/dist;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       # WebSocket support
       location /socket.io {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

   Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/micasa /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

7. **Setup Automatic Backups**
   ```bash
   # Create backup script
   cat > /home/micasa/backup.sh << 'BACKUP'
   #!/bin/bash
   BACKUP_DIR="/home/micasa/backups"
   DB_FILE="/var/www/Micasa/server/data/micasa.db"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   mkdir -p $BACKUP_DIR
   cp $DB_FILE $BACKUP_DIR/micasa_$DATE.db
   
   # Keep only last 30 days of backups
   find $BACKUP_DIR -name "micasa_*.db" -mtime +30 -delete
   BACKUP
   
   chmod +x /home/micasa/backup.sh
   
   # Add to crontab (daily at 2 AM)
   (crontab -l 2>/dev/null; echo "0 2 * * * /home/micasa/backup.sh") | crontab -
   ```

### Option 2: Deploy to Heroku

⚠️ **Note**: Heroku uses ephemeral filesystem. You'll need to use an add-on for persistent storage or migrate to PostgreSQL.

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL="https://your-app-name.herokuapp.com"
   ```

5. **Add Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

⚠️ **Important**: On Heroku, the SQLite database will reset with each deployment. Consider:
- Using Heroku Postgres instead
- Using a persistent storage add-on
- Deploying to a VPS instead

### Option 3: Deploy to Render

Similar to Heroku, Render has ephemeral storage.

1. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up for a free account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - Name: `micasa`
   - Build Command: `npm run install:all && npm run build`
   - Start Command: `cd server && npm start`
   - Add environment variables (JWT_SECRET, NODE_ENV, CLIENT_URL)

4. **Add Persistent Disk**
   - In service settings, add a disk
   - Mount path: `/opt/render/project/server/data`
   - This ensures database persists

### Option 4: Deploy to Railway

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Micasa repository

3. **Configure**
   - Railway will auto-detect Node.js
   - Add environment variables in Settings
   - Add persistent volume for `server/data`

## Database Backup Strategies

### Manual Backup
```bash
# Create backup
cp server/data/micasa.db server/data/micasa-backup-$(date +%Y%m%d).db

# Restore from backup
cp server/data/micasa-backup-20240101.db server/data/micasa.db
```

### Automated Backup Script
```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="$HOME/micasa-backups"
DB_PATH="/path/to/Micasa/server/data/micasa.db"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/micasa_$DATE.db

# Keep only last 30 backups
ls -t $BACKUP_DIR/micasa_*.db | tail -n +31 | xargs rm -f
```

Add to crontab:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

## Post-Deployment Checklist

- [ ] Application is accessible via domain/URL
- [ ] HTTPS is enabled and working
- [ ] Environment variables are set correctly
- [ ] Database directory has proper permissions
- [ ] Database file is being created successfully
- [ ] User registration works
- [ ] Login works
- [ ] Data persists across server restarts
- [ ] Backup strategy is in place
- [ ] Monitoring is set up (optional but recommended)

## Monitoring and Maintenance

### Check Application Status
```bash
# If using PM2
pm2 status
pm2 logs micasa

# Check database size
du -h server/data/micasa.db

# Check disk space
df -h
```

### Update Application
```bash
cd /var/www/Micasa
git pull
npm run install:all
npm run build
pm2 restart micasa
```

### Database Maintenance

SQLite is low-maintenance, but you can optimize it:
```bash
# Vacuum database (reclaim space)
sqlite3 server/data/micasa.db "VACUUM;"

# Check integrity
sqlite3 server/data/micasa.db "PRAGMA integrity_check;"
```

## Security Considerations

1. **File Permissions**
   ```bash
   chmod 700 server/data
   chmod 600 server/data/micasa.db
   ```

2. **Firewall**
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

3. **Regular Updates**
   - Keep Node.js updated
   - Update dependencies regularly: `npm audit fix`

4. **Backup Encryption** (optional)
   ```bash
   # Encrypt backup
   gpg --symmetric --cipher-algo AES256 micasa-backup.db
   ```

## Troubleshooting

### Database Lock Errors
- SQLite uses file locking
- Ensure only one process accesses the database
- Check file permissions

### Disk Space Issues
```bash
# Check disk usage
df -h

# Check database size
du -h server/data/

# Clean old backups
find backups/ -name "*.db" -mtime +30 -delete
```

### Performance Issues
- SQLite is fast for small to medium datasets
- For heavy concurrent usage (>10 simultaneous users), consider PostgreSQL
- Add indexes if queries are slow (already optimized in schema)

## Migration from MongoDB

If you're migrating from a MongoDB version:

1. Export data from MongoDB
2. Transform to SQLite format
3. Import into new SQLite database

Contact support or create an issue for migration assistance.

---

Need help? Create an issue on GitHub or check the documentation!
