# Installation Guide for Micasa

This guide will walk you through setting up Micasa on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database)
- **Git** - [Download here](https://git-scm.com/downloads)

## Step 1: Clone the Repository

```bash
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
```

## Step 2: Install Dependencies

Run the following command to install all dependencies for both client and server:

```bash
npm run install:all
```

This will install:
- Root dependencies (concurrently for running multiple processes)
- Server dependencies (Express, MongoDB, Socket.IO, etc.)
- Client dependencies (React, Vite, Framer Motion, etc.)

## Step 3: Set Up MongoDB

### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # On macOS (with Homebrew)
   brew services start mongodb-community

   # On Linux
   sudo systemctl start mongod

   # On Windows
   # MongoDB should start automatically as a service
   ```

3. Verify MongoDB is running:
   ```bash
   mongosh
   ```

### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier is fine)
3. Create a database user with read/write permissions
4. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/micasa`)

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp server/.env.example server/.env
   ```

2. Edit `server/.env` and update the following:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/micasa
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/micasa
   
   JWT_SECRET=your-super-secret-key-here-change-this
   NODE_ENV=development
   ```

   **Important:** Generate a strong JWT secret. You can use this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## Step 5: Start the Application

### Development Mode (Recommended for testing)

Run both frontend and backend together:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:3000

### Production Mode

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the backend:
   ```bash
   npm start
   ```

3. Configure your web server (nginx, Apache) to serve the built files from `client/dist` and proxy API requests to port 5000.

## Step 6: Create Your First Account

1. Open your browser and navigate to http://localhost:3000
2. Click "Sign up" to create your account
3. Fill in your details:
   - Display Name: Your full name
   - Username: Choose a unique username (lowercase, alphanumeric)
   - Password: At least 6 characters
4. After registration, you'll be automatically logged in

## Step 7: Link Your Partner (Optional)

1. Have your partner create their own account (repeat Step 6)
2. Once both accounts are created, click the "Link Partner" button in the header
3. Enter your partner's username
4. Both accounts will now share the same household data

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoServerError: Authentication failed`
- Check your MongoDB connection string in `server/.env`
- Verify username and password are correct
- Ensure your IP is whitelisted in MongoDB Atlas

**Error:** `MongooseError: Can't call `openUri()` on an active connection`
- Make sure only one instance of the server is running
- Restart the server: `Ctrl+C` then `npm run dev`

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
