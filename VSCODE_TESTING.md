# Testing Micasa in VS Code

This guide will walk you through testing the Micasa application directly in VS Code using the integrated terminal.

## Prerequisites

Before starting, ensure you have:
- ✅ VS Code installed
- ✅ Node.js v16 or higher installed
- ✅ MongoDB set up (MongoDB Atlas or local installation)

## Step 1: Open Project in VS Code

1. Open VS Code
2. File → Open Folder
3. Navigate to the Micasa directory
4. Click "Select Folder"

## Step 2: Configure Environment

1. Open the integrated terminal:
   - View → Terminal (or press `` Ctrl+` ``)
   - Or press `` Cmd+` `` on Mac

2. Install dependencies:
   ```bash
   npm run install:all
   ```

3. Set up environment variables:
   ```bash
   # Copy example environment file
   cp server/.env.example server/.env
   ```

4. Edit `server/.env` in VS Code:
   - Click on `server/.env` in the file explorer
   - Update `MONGODB_URI` with your MongoDB connection string
   - Generate secure JWT_SECRET:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
   - Copy the output and paste as JWT_SECRET value

## Step 3: Build the Application

In the integrated terminal:

```bash
npm run build
```

This creates an optimized production build in `client/dist/`.

## Step 4: Test in Development Mode

### Option A: Full Development Server (Hot Reload)

In the terminal:
```bash
npm run dev
```

This starts:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:3000

**To view the app:**
1. Click the link in the terminal (hold Ctrl/Cmd and click)
2. Or manually open browser to http://localhost:3000

### Option B: Production Preview Mode

In the terminal:
```bash
npm run preview
```

This runs the production build locally.

## Step 5: Test Using VS Code Browser

### Method 1: Live Preview Extension (Recommended)

1. Install "Live Preview" extension:
   - Click Extensions icon (or press `Ctrl+Shift+X`)
   - Search for "Live Preview"
   - Install by Microsoft

2. Open the preview:
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Live Preview: Start Server"
   - Navigate to http://localhost:3000

### Method 2: Simple Browser

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Simple Browser: Show"
3. Enter URL: http://localhost:3000

### Method 3: External Browser

Simply click the terminal links or open your preferred browser to:
- http://localhost:3000 (Frontend)
- http://localhost:5000/api/health (Backend health check)

## Step 6: Test Application Features

### Create First Account

1. Click "Sign up" button
2. Fill in registration form:
   - Display Name: Your Name
   - Username: youruser (lowercase, alphanumeric)
   - Password: secure123 (min 6 characters)
3. Click "Register"

### Test Core Features

#### Shopping Lists
1. Click "Shopping" in sidebar
2. Click "Add Item"
3. Fill in item details:
   - Item Name: Milk
   - Quantity: 2 liters
   - Category: Groceries
   - Priority: Medium
4. Click "Add Item"
5. Verify item appears in list
6. Click "Mark Purchased" to test completion
7. Click trash icon to delete

#### Household Chores
1. Click "Chores" in sidebar
2. Click "Add Chore"
3. Fill in details:
   - Title: Clean Kitchen
   - Assign To: Yourself
   - Due Date: Tomorrow
   - Frequency: Weekly
   - Category: Cleaning
4. Click "Add Chore"
5. Test marking as complete

#### Appointments
1. Click "Appointments"
2. Click "Add Appointment"
3. Fill in event details
4. Test viewing and deleting

#### To-Do Lists
1. Click "To-Do Lists"
2. Click "New List"
3. Create list with tasks
4. Test checking off tasks

#### Reminders
1. Click "Reminders"
2. Click "Add Reminder"
3. Set reminder with due date
4. Test marking complete

### Test Partner Linking (Optional)

To test real-time sync:

1. Open a second browser/incognito window
2. Create a second account
3. In first account:
   - Click "Link Partner" button in header
   - Enter second username
4. Make changes in one window
5. Verify they appear in the other window instantly

## Step 7: Monitor Server Logs

In VS Code terminal, you can see:
- Server startup messages
- API requests
- WebSocket connections
- Database operations
- Any errors

**Split terminal for better monitoring:**
1. Click "+" icon in terminal to open new terminal
2. Run backend in one: `cd server && npm run dev`
3. Run frontend in other: `cd client && npm run dev`

## Step 8: Debug Mode (Optional)

### Backend Debugging

1. Create `.vscode/launch.json`:
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Server",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/server/src/index.js",
         "env": {
           "NODE_ENV": "development"
         }
       }
     ]
   }
   ```

2. Set breakpoints in server code
3. Press F5 or Run → Start Debugging

### Frontend Debugging

1. Install "Debugger for Chrome" or "Debugger for Firefox" extension
2. Use browser DevTools (F12)
3. Or use VS Code's JavaScript Debug Terminal

## Step 9: Test API Endpoints

### Using REST Client Extension

1. Install "REST Client" extension
2. Create `test-api.http`:
   ```http
   ### Health Check
   GET http://localhost:5000/api/health
   
   ### Register User
   POST http://localhost:5000/api/auth/register
   Content-Type: application/json
   
   {
     "displayName": "Test User",
     "username": "testuser",
     "password": "testpass123"
   }
   
   ### Login
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json
   
   {
     "username": "testuser",
     "password": "testpass123"
   }
   ```

3. Click "Send Request" above each endpoint

### Using cURL in Terminal

```bash
# Health check
curl http://localhost:5000/api/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Test","username":"test","password":"test123"}'
```

## Common Issues and Solutions

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000   # Windows
```

### MongoDB Connection Failed

**Error:** `MongooseError: connect ECONNREFUSED`

**Solutions:**
1. Check MongoDB is running
2. Verify MONGODB_URI in server/.env
3. For MongoDB Atlas:
   - Check IP whitelist (add 0.0.0.0/0 for testing)
   - Verify credentials
   - Check connection string format

### Cannot Find Module

**Error:** `Cannot find module 'xyz'`

**Solution:**
```bash
# Clean install
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

### Build Errors

**Error:** Build fails or shows errors

**Solution:**
```bash
# Clear cache and rebuild
rm -rf client/dist
cd client && npm run build
```

## VS Code Extensions for Better Development

### Recommended Extensions

1. **Live Preview** - Preview the app in VS Code
2. **REST Client** - Test API endpoints
3. **MongoDB for VS Code** - View database
4. **ESLint** - Code linting
5. **Prettier** - Code formatting
6. **GitLens** - Git integration
7. **Error Lens** - Inline error display
8. **Path Intellisense** - Path autocomplete

### Theme and Icons

- **Material Icon Theme** - Better file icons
- **One Dark Pro** - Popular dark theme
- **Night Owl** - Easy on eyes

## Keyboard Shortcuts for Testing

### Terminal
- `` Ctrl+` `` - Toggle terminal
- `Ctrl+Shift+5` - Split terminal
- `Ctrl+C` - Stop running process

### Navigation
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+E` - Explorer
- `Ctrl+Shift+F` - Search
- `Ctrl+Shift+D` - Debug

### Code
- `F5` - Start debugging
- `F12` - Go to definition
- `Alt+Shift+F` - Format document
- `Ctrl+/` - Toggle comment

## Tips for Efficient Testing

1. **Use terminal tabs** - Run backend and frontend in separate terminals
2. **Watch mode** - Keep `npm run dev` running for hot reload
3. **Browser DevTools** - Use for frontend debugging (F12)
4. **Console logs** - Monitor terminal for backend logs
5. **Network tab** - Check API calls in browser DevTools
6. **React DevTools** - Install browser extension for React debugging

## Next Steps After Testing

Once you've verified everything works:

1. ✅ Test all features thoroughly
2. ✅ Check real-time sync works
3. ✅ Verify error handling
4. ✅ Test on different screen sizes
5. → Deploy to production (see DEPLOYMENT.md)
6. → Set up monitoring
7. → Configure backups

## Getting Help

If you encounter issues:

1. Check server logs in terminal
2. Check browser console (F12)
3. Review this guide's troubleshooting section
4. Check PRODUCTION_SETUP.md
5. Check INSTALLATION.md
6. Create GitHub issue with error details

---

Happy testing! 🚀

Now you can confidently test Micasa in VS Code before deploying to production.
