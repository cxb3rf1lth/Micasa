# Micasa - One-Command Setup Guide

## 🚀 Single-Line Installation & Launch

Copy and paste this command to clone, install, configure, and run the application:

```bash
git clone -b claude/code-review-and-fixes-011CV5qNvGdtV1BbuTURv1Re https://github.com/cxb3rf1lth/Micasa.git && cd Micasa && npm run install:all && JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))") && echo "PORT=5000\nJWT_SECRET=$JWT_SECRET\nNODE_ENV=development\nCLIENT_URL=http://localhost:3000" > server/.env && npm run dev
```

That's it! The application will:
1. Clone the repository (updated with security fixes)
2. Install all dependencies (root, server, and client)
3. Generate a secure JWT secret
4. Create the `.env` configuration file
5. Start both frontend and backend in development mode

---

## 📋 What Happens

- **Frontend:** Runs on http://localhost:3000
- **Backend:** Runs on http://localhost:5000
- **Database:** SQLite file created at `server/data/micasa.db`

---

## 🔐 Security Improvements Applied

This branch includes critical security fixes:

✅ **Socket.IO authentication** - JWT verification required
✅ **Message authorization** - Proper access control
✅ **Security headers** - Helmet middleware (XSS, clickjacking protection)
✅ **Password validation** - Minimum 8 chars, letter+number required
✅ **Input sanitization** - XSS prevention utility
✅ **Request limits** - 10MB payload size limit
✅ **Secure JWT secret** - 128-character random key

See [CODE_REVIEW_FIXES.md](CODE_REVIEW_FIXES.md) for complete details.

---

## 🛠️ Manual Setup (Alternative)

If you prefer step-by-step setup:

### 1. Clone Repository
```bash
git clone -b claude/code-review-and-fixes-011CV5qNvGdtV1BbuTURv1Re https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Environment
```bash
cd server
cp .env.example .env
# Edit .env and replace JWT_SECRET with a secure random key
# Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
cd ..
```

### 4. Run Development Server
```bash
npm run dev
```

---

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

The server will serve the built client from `client/dist/`.

---

## 🎯 First Steps After Launch

1. **Register an account** at http://localhost:3000/register
   - Username: 3-30 alphanumeric characters
   - Password: Minimum 8 characters with letter + number
   - Display name: Your name

2. **Link with your partner**
   - Click your profile in the header
   - Enter partner's username
   - They must also link back to you

3. **Start managing your household!**
   - Shopping lists
   - Chores
   - Appointments
   - To-do lists
   - Reminders
   - Whiteboard
   - Vision board
   - Direct messaging
   - Webhooks

---

## 🔧 Configuration Options

### Environment Variables (`server/.env`)

```env
PORT=5000                          # Server port
JWT_SECRET=<your-secret-here>      # REQUIRED: 64+ character random string
NODE_ENV=development               # development | production
CLIENT_URL=http://localhost:3000   # CORS origin (change for production)
```

### Generate Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 Package Scripts

```bash
npm run install:all    # Install all dependencies
npm run dev           # Run dev mode (frontend + backend)
npm run dev:server    # Run backend only
npm run dev:client    # Run frontend only
npm run build         # Build for production
npm start            # Start production server
npm run preview      # Build and preview production
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in server/.env
PORT=5001
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules server/node_modules client/node_modules
rm package-lock.json server/package-lock.json client/package-lock.json
npm run install:all
```

### Database Issues
```bash
# Delete and recreate database
rm server/data/micasa.db
# Database will be recreated on next server start
```

---

## 📚 Documentation

- [README.md](README.md) - Project overview
- [CODE_REVIEW_FIXES.md](CODE_REVIEW_FIXES.md) - Security improvements
- [FEATURES.md](FEATURES.md) - Feature documentation
- [INSTALLATION.md](INSTALLATION.md) - Detailed installation guide
- [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Production deployment
- [DEPLOYMENT.md](DEPLOYMENT.md) - Platform-specific deployment

---

## 🤝 Contributing

This branch contains security fixes and improvements. Please test thoroughly before merging to main.

---

## 📝 License

ISC

---

**Micasa** - Household management for couples, now with enterprise-grade security! 🏡💜
