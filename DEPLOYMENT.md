# Micasa Deployment Guide

This guide will help you deploy Micasa to a production environment.

## Prerequisites

Before deploying, ensure you have:
- Node.js v16 or higher
- MongoDB Atlas account (free tier available) or local MongoDB installation
- A hosting platform (see options below)

## Quick Start - MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier is sufficient)

2. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Add a new database user with username and password
   - Remember these credentials for later

3. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Add IP Address: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to specific IPs

4. **Get Connection String**
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/micasa`)
   - Replace `<password>` with your database user password

## Environment Configuration

### Production Environment Variables

Create `server/.env` with production settings:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/micasa?retryWrites=true&w=majority
JWT_SECRET=<generate-a-secure-secret-key>
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

**Generate a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Options

### Option 1: Deploy to Heroku

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
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set NODE_ENV=production
   heroku config:set CLIENT_URL="https://your-app-name.herokuapp.com"
   ```

5. **Add Heroku Buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 2: Deploy to Render

1. **Create Render Account**
   - Go to [Render.com](https://render.com)
   - Sign up for a free account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** your-app-name
     - **Region:** Choose closest to your users
     - **Branch:** main
     - **Build Command:** `npm run install:all && npm run build`
     - **Start Command:** `npm start`

3. **Set Environment Variables**
   - Add the following environment variables in Render dashboard:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `CLIENT_URL` (will be provided by Render)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app

### Option 3: Deploy to Railway

1. **Create Railway Account**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your Micasa repository

3. **Configure Environment Variables**
   - Go to Variables tab
   - Add:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `NODE_ENV=production`
     - `PORT=5000`

4. **Deploy**
   - Railway automatically deploys on push to main branch

### Option 4: VPS Deployment (DigitalOcean, AWS, etc.)

1. **Set up VPS**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Clone and Setup**
   ```bash
   # Clone repository
   git clone https://github.com/cxb3rf1lth/Micasa.git
   cd Micasa
   
   # Install dependencies
   npm run install:all
   
   # Create .env file
   nano server/.env
   # Add production environment variables
   
   # Build client
   npm run build
   ```

3. **Start with PM2**
   ```bash
   # Start server
   cd server
   pm2 start src/index.js --name micasa
   
   # Save PM2 configuration
   pm2 save
   
   # Set PM2 to start on boot
   pm2 startup
   ```

4. **Configure Nginx (Optional)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Production Checklist

Before going live:

- [ ] Set up MongoDB Atlas or production database
- [ ] Generate and set secure JWT_SECRET
- [ ] Update CLIENT_URL to production domain
- [ ] Set NODE_ENV=production
- [ ] Build the client: `npm run build`
- [ ] Test all features work correctly
- [ ] Set up SSL/HTTPS certificate
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Review security settings

## Testing the Deployment

1. **Health Check**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Create Test Account**
   - Visit your deployed app
   - Register a new user
   - Test all features

3. **Test Real-time Features**
   - Open app in two different browsers
   - Link accounts as partners
   - Test that changes sync in real-time

## Monitoring

### Using PM2 (VPS deployment)

```bash
# View logs
pm2 logs micasa

# Monitor resources
pm2 monit

# Restart app
pm2 restart micasa
```

### Health Endpoint

Monitor your app by checking:
```
GET https://your-domain.com/api/health
```

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`
- Verify MONGODB_URI is correct
- Check username and password
- Ensure IP is whitelisted in MongoDB Atlas

**Error:** `MongooseError: Can't call openUri() on an active connection`
- Restart your server
- Ensure only one instance is running

### Build Errors

**Error:** `ENOSPC: no space left on device`
- Clear node_modules: `rm -rf node_modules client/node_modules server/node_modules`
- Reinstall: `npm run install:all`

### Port Issues

**Error:** `EADDRINUSE: address already in use`
- Change PORT in .env
- Or kill existing process

## Scaling Considerations

For high traffic:

1. **Database Optimization**
   - Add indexes to frequently queried fields
   - Use MongoDB Atlas auto-scaling
   - Consider read replicas

2. **Application Scaling**
   - Use load balancer
   - Deploy multiple instances
   - Configure sticky sessions for Socket.IO

3. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

## Security Best Practices

1. **Environment Variables**
   - Never commit .env files
   - Use environment variable management tools
   - Rotate JWT secrets periodically

2. **Database Security**
   - Restrict MongoDB network access
   - Use strong passwords
   - Enable MongoDB authentication

3. **Application Security**
   - Keep dependencies updated
   - Use HTTPS only
   - Implement rate limiting (already included)
   - Regular security audits

## Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm run install:all

# Rebuild client
npm run build

# Restart server (if using PM2)
pm2 restart micasa
```

### Database Backups

**MongoDB Atlas:**
- Automatic backups included in free tier
- Configure backup schedule in Atlas dashboard

**Self-hosted MongoDB:**
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/micasa" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/micasa" /backup/20240101/micasa
```

## Support

If you encounter issues:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check GitHub issues for similar problems
5. Create a new issue with error details

---

Happy deploying! 🚀
