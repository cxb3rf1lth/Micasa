# AWS Deployment Guide for Micasa

Complete guide for deploying Micasa on AWS Free Tier.

## Table of Contents
1. [AWS Free Tier Overview](#aws-free-tier-overview)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites](#prerequisites)
4. [Deployment Options](#deployment-options)
5. [Step-by-Step Deployment](#step-by-step-deployment)
6. [Cost Optimization](#cost-optimization)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## AWS Free Tier Overview

AWS Free Tier includes:
- **EC2**: 750 hours/month of t2.micro or t3.micro instances (12 months)
- **RDS**: 750 hours/month of db.t2.micro or db.t3.micro (12 months)
- **Elastic Load Balancer**: 750 hours/month (12 months)
- **S3**: 5GB storage
- **CloudWatch**: 10 custom metrics, 10 alarms
- **ElastiCache**: No free tier (skip Redis initially or use EC2)

---

## Architecture Overview

```
Internet
   ↓
Route 53 (DNS) - Optional, $0.50/month per hosted zone
   ↓
Application Load Balancer - Free tier: 750 hours/month
   ↓
EC2 Instance (t3.micro) - Free tier: 750 hours/month
   ↓
RDS PostgreSQL (db.t3.micro) - Free tier: 750 hours/month
```

**Simplified Architecture for Maximum Free Tier Usage:**
- Single EC2 t3.micro instance
- RDS PostgreSQL db.t3.micro
- No ElastiCache (use in-memory caching)
- No S3 initially (file attachments disabled)

---

## Prerequisites

###1. AWS Account
- Create AWS account if you don't have one
- Enable MFA for security
- Create IAM user with appropriate permissions

### 2. Required Permissions
Your IAM user needs:
- EC2 full access
- RDS full access
- VPC full access
- CloudWatch Logs full access
- (Optional) Route 53 if using custom domain

### 3. Local Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output format (json)

# Install Docker (for building images)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

---

## Deployment Options

### Option 1: EC2 with Docker (Recommended for Free Tier)
**Pros:**
- Stays within free tier
- Full control
- Easy to scale later

**Cons:**
- Manual setup required
- You manage updates

### Option 2: Elastic Beanstalk
**Pros:**
- Managed platform
- Auto-scaling
- Easy deployment

**Cons:**
- Uses more resources
- May exceed free tier

### Option 3: ECS Fargate
**Pros:**
- Serverless containers
- No EC2 management

**Cons:**
- NO FREE TIER
- Costs $0.04/vCPU-hour + $0.004/GB-hour

**We'll use Option 1 (EC2 with Docker) for maximum free tier usage.**

---

## Step-by-Step Deployment

### Step 1: Create RDS PostgreSQL Database

1. **Go to RDS Console**
   - Navigate to AWS Console → RDS

2. **Create Database**
   ```
   Engine: PostgreSQL
   Version: 15.x
   Template: Free tier
   DB Instance: db.t3.micro
   DB Instance Identifier: micasa-db
   Master username: micasa
   Master password: [Generate strong password]
   VPC: Default VPC
   Public access: No
   VPC security group: Create new
   Database name: micasa
   Backup retention: 7 days (free tier)
   ```

3. **Note the Connection Details**
   After creation, note:
   - Endpoint: `micasa-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Username: `micasa`
   - Password: [Your password]

### Step 2: Create EC2 Instance

1. **Launch EC2 Instance**
   ```
   AMI: Amazon Linux 2023 (free tier eligible)
   Instance type: t3.micro
   Key pair: Create new or select existing
   Network settings:
     - VPC: Same as RDS
     - Auto-assign public IP: Enable
     - Security group: Create new
   Storage: 8 GB gp3 (free tier includes 30GB)
   ```

2. **Configure Security Group**

   Inbound rules:
   ```
   Type        Protocol   Port    Source
   SSH         TCP        22      Your IP
   HTTP        TCP        80      0.0.0.0/0
   HTTPS       TCP        443     0.0.0.0/0
   Custom TCP  TCP        5000    0.0.0.0/0 (temporary, use ALB later)
   ```

3. **Allow EC2 to access RDS**
   - Go to RDS security group
   - Add inbound rule: PostgreSQL (5432) from EC2 security group

### Step 3: Install Dependencies on EC2

SSH into your EC2 instance:
```bash
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

Install required software:
```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Log out and back in for group changes to take effect
exit
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

### Step 4: Deploy Application

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/Micasa.git
   cd Micasa
   ```

2. **Create Production Environment File**
   ```bash
   nano server/.env
   ```

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=production

   # Database (RDS PostgreSQL)
   RDS_HOSTNAME=micasa-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
   RDS_PORT=5432
   RDS_USERNAME=micasa
   RDS_PASSWORD=your_strong_password_here
   RDS_DB_NAME=micasa

   # JWT Security
   JWT_SECRET=your_generated_secret_from_install_script
   JWT_EXPIRE=30d

   # Client URL (your domain or EC2 public IP)
   CLIENT_URL=http://your-ec2-public-ip:3000

   # AWS Configuration
   AWS_REGION=us-east-1
   CLOUDWATCH_GROUP_NAME=micasa-app

   # Logging
   LOG_LEVEL=info

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   AUTH_RATE_LIMIT_MAX=5
   ```

3. **Build Docker Image**
   ```bash
   docker build -t micasa:latest .
   ```

4. **Run Application**
   ```bash
   # Run in detached mode
   docker run -d \
     --name micasa-app \
     --restart unless-stopped \
     -p 5000:5000 \
     --env-file server/.env \
     micasa:latest

   # Check logs
   docker logs -f micasa-app
   ```

5. **Verify Application**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Step 5: Set Up Nginx Reverse Proxy (Optional but Recommended)

Install Nginx:
```bash
sudo yum install -y nginx
```

Configure Nginx:
```bash
sudo nano /etc/nginx/conf.d/micasa.conf
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or EC2 public IP

    # Client (static files)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }

    # WebSocket (Socket.IO)
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Start Nginx:
```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 6: Set Up SSL with Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal
sudo certbot renew --dry-run
```

### Step 7: Set Up CloudWatch Logging (Optional)

1. **Create IAM Role for EC2**
   - Go to IAM → Roles → Create Role
   - Select EC2
   - Attach policy: `CloudWatchLogsFullAccess`
   - Name: `MicasaEC2CloudWatchRole`

2. **Attach Role to EC2 Instance**
   - EC2 Console → Select instance → Actions → Security → Modify IAM role
   - Select `MicasaEC2CloudWatchRole`

3. **Install CloudWatch Agent**
   ```bash
   sudo yum install -y amazon-cloudwatch-agent
   ```

4. **Configure CloudWatch Agent**
   ```bash
   sudo nano /opt/aws/amazon-cloudwatch-agent/etc/config.json
   ```

   ```json
   {
     "logs": {
       "logs_collected": {
         "files": {
           "collect_list": [
             {
               "file_path": "/var/log/docker/micasa-app.log",
               "log_group_name": "micasa-app",
               "log_stream_name": "{instance_id}"
             }
           ]
         }
       }
     }
   }
   ```

5. **Start CloudWatch Agent**
   ```bash
   sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
     -a fetch-config \
     -m ec2 \
     -s \
     -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
   ```

---

## Cost Optimization

### Free Tier Usage Tracker

Monitor your free tier usage:
- AWS Console → Billing → Free Tier
- Set up billing alerts

### Staying Within Free Tier

1. **Single Instance**: Use only 1 EC2 instance (750 hours/month covers 1 instance 24/7)
2. **RDS**: Use 1 db.t3.micro instance
3. **Stop When Not Needed**: Stop instances during development/testing
4. **No ElastiCache**: Use in-memory caching instead
5. **Minimal S3 Usage**: Defer file uploads feature
6. **CloudWatch**: Stay within 10 alarms and 10 metrics

### Monthly Cost Estimate (After Free Tier)

After 12 months, expected costs:
- EC2 t3.micro: ~$7.50/month
- RDS db.t3.micro: ~$15/month
- Data transfer: ~$1-5/month
- **Total: ~$25-30/month**

### Cost Reduction Strategies

1. **Use Reserved Instances**: 30-40% discount for 1-year commitment
2. **Use Spot Instances**: Up to 90% discount (for non-production)
3. **Right-size**: Monitor usage and downsize if possible
4. **Use Auto-Scaling**: Scale down during low traffic
5. **Clean Up Unused Resources**: Delete old snapshots, unused volumes

---

## Monitoring and Maintenance

### Health Checks

Monitor application health:
```bash
# On EC2 instance
docker logs -f micasa-app

# Check application health
curl http://localhost:5000/api/health/detailed
```

### Automatic Backups

RDS automatic backups are included in free tier:
- Retention: 7 days
- Backup window: Configured during setup
- Manual snapshots: Create before major changes

### Updates and Maintenance

1. **Update Application**
   ```bash
   cd ~/Micasa
   git pull origin main
   docker build -t micasa:latest .
   docker stop micasa-app
   docker rm micasa-app
   docker run -d --name micasa-app --restart unless-stopped -p 5000:5000 --env-file server/.env micasa:latest
   ```

2. **Database Migrations**
   ```bash
   # Run migrations
   docker exec micasa-app node server/src/scripts/migrate.js
   ```

3. **Security Updates**
   ```bash
   # Update EC2 instance
   sudo yum update -y

   # Update Docker images
   docker pull node:18-alpine
   docker build -t micasa:latest .
   ```

### Monitoring Tools

1. **CloudWatch Metrics** (Free tier: 10 metrics)
   - CPU utilization
   - Network in/out
   - Database connections
   - Memory usage

2. **CloudWatch Alarms** (Free tier: 10 alarms)
   - High CPU usage (>80%)
   - Low disk space (<10%)
   - High database connections
   - Application errors

3. **Application Logs**
   ```bash
   # View application logs
   docker logs -f --tail=100 micasa-app

   # View Nginx logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

---

## Troubleshooting

### Common Issues

1. **Cannot connect to RDS**
   - Check security group allows EC2 to access RDS
   - Verify RDS endpoint and credentials
   - Ensure RDS is in same VPC

2. **Application won't start**
   - Check Docker logs: `docker logs micasa-app`
   - Verify environment variables
   - Check database connectivity

3. **Out of memory**
   - t3.micro has only 1GB RAM
   - Add swap space:
     ```bash
     sudo dd if=/dev/zero of=/swapfile bs=128M count=8
     sudo chmod 600 /swapfile
     sudo mkswap /swapfile
     sudo swapon /swapfile
     ```

4. **SSL certificate issues**
   - Ensure DNS points to EC2 public IP
   - Check Certbot logs: `sudo certbot certificates`
   - Renew manually: `sudo certbot renew`

---

## Backup and Disaster Recovery

### Database Backups

1. **Automated Backups** (Included in free tier)
   - Configured during RDS setup
   - 7-day retention

2. **Manual Snapshots**
   ```bash
   aws rds create-db-snapshot \
     --db-instance-identifier micasa-db \
     --db-snapshot-identifier micasa-db-snapshot-$(date +%Y%m%d)
   ```

3. **Export to S3**
   ```bash
   # Dump database
   docker exec micasa-app pg_dump -h $RDS_HOSTNAME -U micasa micasa > backup.sql

   # Upload to S3
   aws s3 cp backup.sql s3://your-bucket/backups/
   ```

### Application Backups

```bash
# Backup application code
tar -czf micasa-app-backup.tar.gz ~/Micasa

# Backup Docker image
docker save micasa:latest | gzip > micasa-image.tar.gz
```

### Disaster Recovery Plan

1. **EC2 Instance Failure**
   - Launch new EC2 instance
   - Restore application from Git
   - Rebuild Docker image
   - Connect to existing RDS

2. **RDS Failure**
   - Restore from automated backup
   - Or restore from manual snapshot
   - Update application connection string

---

## Scaling Beyond Free Tier

When you outgrow free tier:

1. **Horizontal Scaling**
   - Add Application Load Balancer
   - Launch multiple EC2 instances
   - Use ElastiCache Redis for session storage

2. **Vertical Scaling**
   - Upgrade to t3.small or t3.medium
   - Upgrade RDS to larger instance

3. **Advanced Features**
   - Add CloudFront CDN
   - Use S3 for file storage
   - Implement auto-scaling groups
   - Add read replicas for RDS

---

## Security Best Practices

1. **Enable MFA** on AWS root and IAM accounts
2. **Use IAM roles** instead of access keys when possible
3. **Encrypt data at rest** (RDS encryption, EBS encryption)
4. **Use HTTPS only** (enforce SSL)
5. **Regular security updates** on EC2 instances
6. **Restrict security groups** to minimum required access
7. **Enable CloudTrail** for audit logging (free tier: 1 trail)
8. **Use AWS Systems Manager** Parameter Store for secrets
9. **Regular backups** and test restoration
10. **Monitor logs** for suspicious activity

---

## Support and Resources

- **AWS Free Tier**: https://aws.amazon.com/free/
- **AWS Documentation**: https://docs.aws.amazon.com/
- **Micasa Documentation**: See README.md
- **Issues**: Create issue on GitHub
- **AWS Support**: Basic support included (Community forums)

---

## Conclusion

This guide provides a complete path to deploying Micasa on AWS Free Tier. Following these steps will result in a production-ready deployment that costs $0 for the first 12 months and ~$25-30/month afterwards.

**Next Steps:**
1. Follow Step-by-Step Deployment
2. Set up monitoring and alerts
3. Configure backups
4. Test disaster recovery procedures
5. Monitor costs and optimize

Happy deploying! 🚀
