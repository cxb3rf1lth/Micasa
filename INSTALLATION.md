# Installation Guide for Micasa

This guide will walk you through setting up Micasa on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/downloads)

**No database installation required!** Micasa uses SQLite, a lightweight file-based database that is automatically created when you run the application.

## Step 1: Clone the Repository

```bash
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
```

## Step 2: Automated Installation (Recommended)

Run the automated install script for your platform:

### Unix/Linux/Mac

```bash
./install.sh
```

### Windows

```bash
install.bat
```

The install script will:
- ✅ Check for Node.js installation
- ✅ Install all dependencies (root, server, and client)
- ✅ Generate a secure JWT secret automatically
- ✅ Create the `.env` configuration file
- ✅ Initialize the SQLite database directory
- ✅ Build the client application

**That's it!** Skip to Step 6 to start the application.

## Step 3: Manual Installation (Alternative)

If you prefer to install manually or the automated script doesn't work:

### Install Dependencies

```bash
npm run install:all
```

This will install:
- Root dependencies (concurrently for running multiple processes)
- Server dependencies (Express, SQLite, Socket.IO, etc.)
- Client dependencies (React, Vite, Framer Motion, etc.)

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and update the following:

   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-key-here-change-this
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

   **Important:** Generate a strong JWT secret. You can use this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## Step 5: Build the Client

```bash
npm run build
```

## Step 6: Start the Application

### Development Mode (Recommended for testing)

Run both frontend and backend together with hot reload:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:3000
- SQLite database will be automatically created in `server/data/micasa.db`

### Production Mode

1. Build the frontend (if not already done):
   ```bash
   npm run build
   ```

2. Start the backend:
   ```bash
   npm start
   ```

3. Open your browser to http://localhost:5000

## Step 7: Create Your First Account

1. Open your browser and navigate to http://localhost:3000 (development) or http://localhost:5000 (production)
2. Click "Sign up" to create your account
3. Fill in your details:
   - Display Name: Your full name
   - Username: Choose a unique username (lowercase, alphanumeric)
   - Password: At least 6 characters
4. After registration, you'll be automatically logged in

## Step 8: Link Your Partner (Optional)

1. Have your partner create their own account (repeat Step 7)
2. Once both accounts are created, click the "Link Partner" button in the header
3. Enter your partner's username
4. Both accounts will now share the same household data

## Database Information

### SQLite Benefits
- **Zero Configuration**: No database server to install or configure
- **Automatic Creation**: Database is created automatically on first run
- **File-Based**: All data stored in a single file (`server/data/micasa.db`)
- **Portable**: Easy to backup (just copy the database file)
- **Lightweight**: Perfect for household use with 1-2 users

### Database Location
- Development: `server/data/micasa.db`
- The database file is automatically excluded from git via `.gitignore`

### Backup Your Data
To backup your data, simply copy the database file:
```bash
# Create a backup
cp server/data/micasa.db server/data/micasa-backup-$(date +%Y%m%d).db

# Restore from backup
cp server/data/micasa-backup-20240101.db server/data/micasa.db
```

## Troubleshooting

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`
- Another process is using port 5000
- Kill the process or change the PORT in `server/.env`

```bash
# Find and kill the process (Unix/Mac)
lsof -ti:5000 | xargs kill -9

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Not Loading

**Error:** `Failed to fetch` or API errors
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure `client/vite.config.js` proxy is configured correctly

### Missing Dependencies

**Error:** `Cannot find module 'xyz'`
- Delete `node_modules` folders and reinstall:
  ```bash
  rm -rf node_modules client/node_modules server/node_modules
  npm run install:all
  ```

### Database Errors

**Error:** Database-related errors
- Make sure the `server/data` directory exists and is writable
- Check file permissions on `server/data/micasa.db`
- Try deleting the database file to start fresh (you'll lose all data):
  ```bash
  rm server/data/micasa.db
  ```

### Node.js Version Issues

**Error:** Node version errors
- Ensure you have Node.js v16 or higher:
  ```bash
  node -v
  ```
- If needed, update Node.js from https://nodejs.org/

## Next Steps

Now that you have Micasa running:

1. **Explore Features**: Check out Shopping Lists, Chores, Appointments, To-Do Lists, and Reminders
2. **Customize**: Modify the theme colors in `client/src/styles/index.css`
3. **Deploy**: See `DEPLOYMENT.md` for production deployment guides
4. **Contribute**: Found a bug or want a feature? Open an issue on GitHub

## Support

If you encounter any issues not covered here:
- Check existing GitHub issues
- Create a new issue with details about your problem
- Include your OS, Node version, and error messages

---

Enjoy using Micasa! 🏠
