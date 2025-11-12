# 🏠 Getting Started with Micasa

Welcome to Micasa! This guide will help you get up and running quickly.

## 🎯 What is Micasa?

Micasa is a modern household management application designed for couples to collaboratively manage their home life. Features include:

- 🛒 **Shopping Lists** - Shared shopping with real-time updates
- 📋 **Household Chores** - Task management and assignments
- 📅 **Appointments** - Shared calendar for events
- ✅ **To-Do Lists** - Create and manage tasks
- 🔔 **Reminders** - Never forget important tasks

All features sync in real-time between partners using WebSocket!

## 🚀 Quick Start (5 Minutes)

### 1. Prerequisites

Make sure you have:
- Node.js v16 or higher ([Download](https://nodejs.org/))
- A code editor (VS Code recommended)
- MongoDB (we'll set this up in step 3)

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa

# Install all dependencies
npm run install:all
```

### 3. Set Up MongoDB

**Option A: MongoDB Atlas (Recommended - Free)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Create database user
4. Add IP: 0.0.0.0/0 (for development)
5. Get connection string: `mongodb+srv://...`

**Option B: Use Quick Start Script**

```bash
# Linux/Mac
./quick-start.sh

# Windows
quick-start.bat
```

This script will:
- ✅ Install dependencies
- ✅ Create .env file
- ✅ Generate secure JWT secret
- ✅ Build the application
- ⚠️ Prompt you to set up MongoDB

### 4. Configure Environment

```bash
# Copy example environment file
cp server/.env.example server/.env
```

Edit `server/.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/micasa
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 5. Run the Application

```bash
# Development mode (recommended for testing)
npm run dev
```

Open browser to: **http://localhost:3000**

## 📖 What's Next?

### First Time User

1. **Create Account**
   - Click "Sign up"
   - Enter your details
   - Create account

2. **Explore Features**
   - Add shopping items
   - Create chores
   - Schedule appointments

3. **Link Partner** (Optional)
   - Have your partner create account
   - Click "Link Partner"
   - Enter partner's username
   - Start sharing!

### Developer/Tester

Want to test in VS Code or prepare for production?

1. **Test in VS Code**
   → See [VSCODE_TESTING.md](./VSCODE_TESTING.md)

2. **Prepare for Production**
   → See [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)

3. **Deploy to Production**
   → See [DEPLOYMENT.md](./DEPLOYMENT.md)

4. **Pre-Launch Checklist**
   → See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

## 📚 Documentation Overview

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **README.md** | Overview and tech stack | First |
| **GETTING_STARTED.md** | Quick setup (this file) | First |
| **INSTALLATION.md** | Detailed installation | If stuck during setup |
| **FEATURES.md** | Feature documentation | Learn what the app can do |
| **VSCODE_TESTING.md** | Test in VS Code | Before deployment |
| **PRODUCTION_SETUP.md** | Production preparation | Before going live |
| **DEPLOYMENT.md** | Deploy to platforms | Ready to launch |
| **PRODUCTION_CHECKLIST.md** | Pre-launch checklist | Before public launch |

## 🎓 Learning Path

### For End Users

```
1. GETTING_STARTED.md (you are here)
2. Run: npm run dev
3. Create account and explore
4. Read: FEATURES.md
5. Start managing your household!
```

### For Developers

```
1. GETTING_STARTED.md (you are here)
2. INSTALLATION.md (detailed setup)
3. Run tests in VS Code (VSCODE_TESTING.md)
4. Understand features (FEATURES.md)
5. Prepare production (PRODUCTION_SETUP.md)
6. Deploy (DEPLOYMENT.md)
7. Launch checklist (PRODUCTION_CHECKLIST.md)
```

## 🛠️ Common Setup Scenarios

### Scenario 1: "Just Want to Try It"

```bash
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
./quick-start.sh  # or quick-start.bat on Windows
# Set up MongoDB Atlas (follow prompts)
npm run dev
# Open http://localhost:3000
```

### Scenario 2: "Want to Deploy to Production"

```bash
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
npm run install:all
# Set up MongoDB Atlas
# Configure server/.env with production settings
npm run build
# Follow DEPLOYMENT.md for your platform
```

### Scenario 3: "Want to Test in VS Code"

```bash
# Open VS Code
# File → Open Folder → Select Micasa
# Open Terminal (Ctrl+`)
npm run install:all
# Configure server/.env
npm run dev
# Follow VSCODE_TESTING.md for detailed testing
```

## ⚡ Quick Reference

### Essential Commands

```bash
# Install everything
npm run install:all

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

### Common URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### Essential Files

- `server/.env` - Environment configuration
- `package.json` - Root scripts
- `server/src/index.js` - Backend entry point
- `client/src/App.jsx` - Frontend entry point

## 🐛 Troubleshooting

### "npm run install:all fails"

**Solution:**
```bash
rm -rf node_modules client/node_modules server/node_modules
npm cache clean --force
npm run install:all
```

### "MongoDB connection error"

**Solutions:**
1. Check MONGODB_URI in server/.env
2. Verify MongoDB is running (if local)
3. Check MongoDB Atlas IP whitelist
4. Verify username/password

### "Port 5000 already in use"

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows

# Or change PORT in server/.env
```

### "Module not found"

**Solution:**
```bash
cd server && npm install
cd ../client && npm install
```

### Still Having Issues?

1. Check the specific guide for your use case
2. Review error messages carefully
3. Check GitHub Issues
4. Create a new issue with:
   - Your OS
   - Node version (`node -v`)
   - Error message
   - Steps to reproduce

## 💡 Pro Tips

1. **Use MongoDB Atlas** - Much easier than local MongoDB
2. **Keep terminal open** - See real-time logs
3. **Use two browsers** - Test real-time sync between partners
4. **Check .env file** - Most issues come from incorrect configuration
5. **Read the guides** - They're comprehensive and helpful!

## 🎉 Success Indicators

You'll know everything is working when:

✅ Server starts without errors
✅ Frontend loads at http://localhost:3000
✅ You can register an account
✅ You can add shopping items
✅ You can create chores
✅ Real-time updates work

## 📞 Get Help

- **Documentation:** Check the guides listed above
- **GitHub Issues:** Search or create new issue
- **Health Check:** `curl http://localhost:5000/api/health`

## 🚀 Ready to Launch?

Once you've tested locally and everything works:

1. ✅ Complete [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
2. 📚 Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
3. 🎉 Launch your application!

---

## Next Steps

Based on what you want to do:

### I want to...

**→ Just test the app locally**
- Continue with current setup
- Run `npm run dev`
- Open http://localhost:3000

**→ Test in VS Code professionally**
- Read [VSCODE_TESTING.md](./VSCODE_TESTING.md)
- Set up debugging
- Test all features

**→ Deploy to production**
1. Read [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)
2. Complete [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
3. Follow [DEPLOYMENT.md](./DEPLOYMENT.md)

**→ Understand all features**
- Read [FEATURES.md](./FEATURES.md)
- Try each feature
- Test with a partner

**→ Customize the app**
- Explore codebase
- Check `client/src/` for frontend
- Check `server/src/` for backend
- Modify as needed

---

Welcome to Micasa! We hope you enjoy managing your household together. 🏠❤️

**Questions?** Create an issue on GitHub or check the documentation!
