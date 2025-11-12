# 🚀 Micasa Launch Guide

Complete guide to set up and launch the Micasa household management application.

## 📋 Prerequisites

Before running Micasa, ensure you have:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org))
- **npm** 9.0 or higher (comes with Node.js)
- **Git** (optional, for cloning)

Verify installations:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

---

## ⚡ Quick Start (Recommended)

### Option 1: Automated Setup Script

**For Linux/Mac/Unix:**
```bash
chmod +x setup-and-launch.sh
./setup-and-launch.sh
```

**For Windows:**
```cmd
setup-and-launch.bat
```

This single script will:
- ✅ Check prerequisites
- ✅ Install all dependencies
- ✅ Create environment configuration
- ✅ Initialize the database
- ✅ Launch both frontend and backend
- ✅ Open the application automatically

---

## 🔧 Manual Setup (Step by Step)

### Step 1: Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
PORT=5000
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EOF

# Create data directory
mkdir -p data
```

### Step 2: Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install
```

### Step 3: Launch Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

---

## 🌐 Access the Application

Once launched, access Micasa at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 👤 First Time Setup

1. Navigate to http://localhost:3000
2. Click **Register** to create your account
3. Fill in your details:
   - Username (unique)
   - Password (min 6 characters for current version, 8+ for security branch)
   - Display Name
4. Click **Register**
5. You'll be automatically logged in!

### Link with Partner (Optional)

1. Have your partner create their account
2. Go to **Settings** page
3. Enter their username in "Link Partner"
4. Both accounts will now share household data

---

## 📦 Available Scripts

### Backend (server/)

| Command | Description |
|---------|-------------|
| `npm start` | Start the backend server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm test` | Run tests (when implemented) |

### Frontend (client/)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🔒 Security Branch (Recommended for Production)

For production deployment, merge the security fixes branch first:

```bash
# Checkout security branch
git checkout claude/security-fixes-011CV4n6EdbrUDzTf48fpVW5

# Run setup
./setup-and-launch.sh
```

This includes:
- ✅ Socket.IO authentication
- ✅ CORS security
- ✅ Helmet security headers
- ✅ Strong password policy (8+ chars)
- ✅ XSS protection
- ✅ Request size limits

---

## 🛠️ Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

**Frontend (Port 3000):**
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Errors

If you encounter database errors:
```bash
# Remove existing database
rm server/data/micasa.db

# Restart the backend (database will be recreated)
cd server
npm start
```

### Module Not Found

If you see "Module not found" errors:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd server && rm -rf node_modules package-lock.json && npm install
cd ../client && rm -rf node_modules package-lock.json && npm install
```

### CORS Errors

If you see CORS errors in the browser:
1. Ensure backend is running on port 5000
2. Ensure frontend is running on port 3000
3. Check `.env` file has `CLIENT_URL=http://localhost:3000`

---

## 📱 Features Available

After launching, you'll have access to:

### Core Features
- 📝 **Shopping Lists** - Shared grocery lists with categories
- 🧹 **Chores** - Task management with assignments
- 📅 **Appointments** - Shared calendar events
- ✅ **To-Do Lists** - Checklist management
- 🔔 **Reminders** - Custom reminders with recurrence

### Creative Features
- 🎨 **Whiteboard** - Sticky notes and ideas
- 🎯 **Vision Board** - Goals and dreams tracking
- 💬 **Messaging** - In-app chat with partner
- 🔗 **Webhooks** - External integrations

### Settings
- 👥 **Partner Linking** - Connect with household partner
- 🎭 **Role Management** - Set household roles
- ⚙️ **Preferences** - Customize your experience

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5000 |
| `JWT_SECRET` | JWT signing secret (auto-generated) | - |
| `NODE_ENV` | Environment mode | development |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:3000 |

### Frontend (optional)

Create `client/.env.local` for custom config:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🏗️ Production Deployment

For production deployment:

1. **Build Frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Set Environment:**
   ```bash
   # Update server/.env
   NODE_ENV=production
   CLIENT_URL=https://yourdomain.com
   ```

3. **Serve Static Files:**
   The backend automatically serves the built frontend in production mode.

4. **Start with PM2:**
   ```bash
   npm install -g pm2
   cd server
   pm2 start src/index.js --name micasa
   ```

---

## 📊 Tech Stack

- **Backend**: Node.js, Express, SQLite, Socket.IO
- **Frontend**: React 18, Vite, Framer Motion
- **Database**: SQLite (better-sqlite3)
- **Real-time**: Socket.IO
- **Auth**: JWT tokens
- **Styling**: Custom CSS with deep purple theme

---

## 📄 License

This project is private. All rights reserved.

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs in the terminal
3. Check browser console for frontend errors
4. Ensure all prerequisites are installed
5. Try the manual setup steps

---

## 🎉 Success!

You should now see:
- Backend running on http://localhost:5000
- Frontend running on http://localhost:3000
- Beautiful purple-themed UI
- Real-time updates working
- All features accessible

**Enjoy managing your household with Micasa!** 🏠✨
