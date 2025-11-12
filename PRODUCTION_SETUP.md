# Micasa Production Setup Guide

This guide will help you set up Micasa for production deployment, including testing in VS Code.

## Quick Setup Steps

### 1. Clone and Install

```bash
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
npm run install:all
```

### 2. Set Up MongoDB Atlas (Recommended)

Since MongoDB is not included in this repository, you'll need to set up a database:

#### Option A: MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account**
   - Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a new cluster

2. **Configure Access**
   - Database Access → Add new user (username/password)
   - Network Access → Add IP (0.0.0.0/0 for development)

3. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/micasa`

#### Option B: Local MongoDB Installation

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
- Download installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- Run installer and follow setup wizard
- MongoDB will start automatically as a Windows service

### 3. Configure Environment Variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/micasa
# OR for local: mongodb://localhost:27017/micasa

JWT_SECRET=<generate-secure-key>
NODE_ENV=production
CLIENT_URL=http://localhost:3000
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Build the Application

```bash
npm run build
```

This will create an optimized production build in `client/dist/`.

### 5. Test in VS Code

#### Method 1: Using VS Code Terminal Preview

1. **Open VS Code Terminal**
   - View → Terminal (or Ctrl+`)

2. **Start the Backend Server**
   ```bash
   cd server
   npm start
   ```

3. **Open Preview in New Terminal**
   - Click "+" to open new terminal
   ```bash
   cd client
   npm run preview
   ```

4. **Access the Application**
   - Open browser to http://localhost:3000
   - Or use VS Code's "Simple Browser" extension

#### Method 2: Development Mode with Hot Reload

```bash
npm run dev
```

This starts both backend and frontend with hot reload enabled.

#### Method 3: Production Preview

```bash
npm run preview
```

This builds the client and starts both backend and preview server.

### 6. Testing the Application

1. **Open Browser**
   - Navigate to http://localhost:3000

2. **Create Test Account**
   - Click "Sign up"
   - Fill in details:
     - Display Name: Test User
     - Username: testuser
     - Password: testpass123

3. **Test Features**
   - Add shopping items
   - Create chores
   - Schedule appointments
   - Create to-do lists
   - Set reminders

4. **Test Real-time Sync (Optional)**
   - Open app in two different browsers
   - Create a second account
   - Link accounts as partners
   - Make changes in one browser
   - Verify they appear in the other

## VS Code Extensions for Better Experience

Recommended extensions:

1. **Live Preview** or **Live Server**
   - Install from Extensions marketplace
   - Right-click `client/dist/index.html` → Open with Live Server

2. **REST Client**
   - Test API endpoints directly in VS Code
   - Create `.http` files for API testing

3. **MongoDB for VS Code**
   - Connect to your MongoDB database
   - View and manage data directly

## Production Deployment

Once tested locally, deploy to production using one of these platforms:

### Recommended Platforms

1. **Render** (Easiest)
   - Free tier available
   - Automatic deployments
   - Built-in SSL
   - [Follow DEPLOYMENT.md guide](./DEPLOYMENT.md#option-2-deploy-to-render)

2. **Railway**
   - Simple setup
   - GitHub integration
   - Free tier
   - [Follow DEPLOYMENT.md guide](./DEPLOYMENT.md#option-3-deploy-to-railway)

3. **Heroku**
   - Well documented
   - Free tier (limited)
   - [Follow DEPLOYMENT.md guide](./DEPLOYMENT.md#option-1-deploy-to-heroku)

4. **VPS (DigitalOcean, AWS, etc.)**
   - Full control
   - Requires more setup
   - [Follow DEPLOYMENT.md guide](./DEPLOYMENT.md#option-4-vps-deployment)

## Project Structure

```
Micasa/
├── client/                 # React frontend
│   ├── src/               # Source code
│   ├── dist/              # Production build (after npm run build)
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── src/               # Source code
│   ├── .env               # Environment variables (create this)
│   └── package.json
├── package.json           # Root scripts
├── README.md              # Main documentation
├── INSTALLATION.md        # Installation guide
├── DEPLOYMENT.md          # Deployment guide
└── PRODUCTION_SETUP.md    # This file
```

## Environment Variables Reference

### Development (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/micasa
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Production (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/micasa
JWT_SECRET=<64-character-secure-random-string>
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

## Common Commands

### Development

```bash
# Install all dependencies
npm run install:all

# Run in development mode (hot reload)
npm run dev

# Run only backend
npm run dev:server

# Run only frontend
npm run dev:client
```

### Production

```bash
# Build for production
npm run build

# Start production server
npm start

# Preview production build locally
npm run preview
```

### Testing

```bash
# Test API health
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000
```

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongooseError: connect ECONNREFUSED`

**Solutions:**
- Ensure MongoDB is running: `sudo systemctl status mongod` (Linux)
- Check MONGODB_URI in .env file
- For MongoDB Atlas, verify IP whitelist and credentials

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find process using port
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows

# Or change PORT in .env
```

### Build Errors

**Error:** `npm ERR! code ELIFECYCLE`

**Solutions:**
```bash
# Clean install
rm -rf node_modules client/node_modules server/node_modules
rm -rf client/dist
npm run install:all
npm run build
```

### Environment Variables Not Loading

**Error:** Variables undefined or using default values

**Solutions:**
- Ensure .env file exists in `server/` directory
- Check file is named exactly `.env` (not .env.txt)
- Restart the server after changing .env

## Security Checklist

Before deploying to production:

- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Use MongoDB Atlas with authentication
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Review and update network access rules
- [ ] Enable rate limiting (already included)
- [ ] Use environment variables for all secrets
- [ ] Never commit .env files to version control

## Performance Optimization

### Already Implemented

- ✅ Rate limiting on API endpoints
- ✅ Production build optimization (minification, tree-shaking)
- ✅ WebSocket for real-time updates
- ✅ Efficient database queries with Mongoose
- ✅ CORS configuration
- ✅ Error handling middleware

### Optional Enhancements

- Add Redis for session caching
- Implement CDN for static assets
- Use database connection pooling
- Add response compression middleware
- Implement API response caching

## Monitoring and Logs

### Development

- Console logs visible in terminal
- React DevTools for frontend debugging
- MongoDB logs: `tail -f /var/log/mongodb/mongod.log`

### Production

- Use PM2 for process management: `pm2 logs`
- Set up error tracking (Sentry, LogRocket)
- Monitor database performance in MongoDB Atlas
- Use APM tools (New Relic, Datadog)

## Backup Strategy

### MongoDB Atlas

- Automatic backups included (free tier)
- Point-in-time recovery available
- Configure backup schedule in dashboard

### Self-hosted MongoDB

```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/micasa" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/micasa" /backup/20240101/micasa

# Automate with cron (Linux)
crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## Next Steps

1. ✅ Complete this setup guide
2. ✅ Test application locally
3. ✅ Verify all features work
4. → Deploy to staging environment
5. → Test in staging
6. → Deploy to production
7. → Monitor and maintain

## Getting Help

- **Documentation:** Check README.md, INSTALLATION.md, and DEPLOYMENT.md
- **GitHub Issues:** Report bugs or request features
- **API Health Check:** http://localhost:5000/api/health

---

🎉 Your Micasa application is now production-ready!
