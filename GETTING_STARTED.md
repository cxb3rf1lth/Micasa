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

## 🚀 Quick Start (2 Minutes!)

### 1. Prerequisites

Make sure you have:
- Node.js v16 or higher ([Download](https://nodejs.org/))
- **That's it!** No database installation required - uses SQLite

### 2. Automated Installation (Recommended)

```bash
# Clone the repository
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa

# Run the automated install script
# On Linux/Mac:
./install.sh

# On Windows:
install.bat
```

The install script automatically:
- ✅ Installs all dependencies
- ✅ Generates secure JWT secret
- ✅ Creates environment configuration
- ✅ Initializes SQLite database
- ✅ Builds the client application

**Skip to step 4!**

### 3. Manual Installation (Alternative)

If the automated script doesn't work:

```bash
# Install dependencies
npm run install:all

# Create environment file
cp server/.env.example server/.env

# Generate JWT secret and update .env
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy the output and paste it as JWT_SECRET in server/.env

# Build the client
npm run build
```

### 4. Start the Application

```bash
# Development mode (hot reload)
npm run dev

# Or production preview
npm run preview
```

Open your browser to **http://localhost:3000**

The SQLite database will be automatically created in `server/data/micasa.db`

## 📱 First Time Setup

### Create Your Account

1. Click **"Sign up"**
2. Enter your details:
   - Display Name: Your full name
   - Username: Unique username (letters, numbers, dash, underscore)
   - Password: At least 6 characters
3. Click **"Create Account"**

### Link Your Partner (Optional)

1. Have your partner create their account first
2. Click the **"Link Partner"** button in the header
3. Enter your partner's username
4. Click **"Link"**

Now you're sharing the same household! All data syncs in real-time.

## 🎨 Using Micasa

### Shopping Lists

1. Click **"Shopping"** in the navigation
2. Click **"Add Item"**
3. Enter item name, quantity, category, and priority
4. Mark items as purchased when done
5. Your partner sees updates instantly!

### Chores

1. Click **"Chores"** in the navigation
2. Click **"Add Chore"**
3. Fill in details:
   - Title and description
   - Assign to yourself or partner
   - Set due date and frequency
   - Choose category and priority
4. Mark complete when done

### Appointments

1. Click **"Appointments"**
2. Click **"Add Appointment"**
3. Set title, date, time, location
4. Add both partners as attendees
5. Set reminders if needed

### To-Do Lists

1. Click **"To-Do Lists"**
2. Click **"New List"**
3. Give it a title and add items
4. Mark items complete as you finish
5. Lists can be shared or personal

### Reminders

1. Click **"Reminders"**
2. Click **"Add Reminder"**
3. Set title, date, and category
4. Choose if both partners should be notified
5. Mark complete when done

## 💡 Tips & Tricks

### Real-Time Sync
- Changes appear instantly for your partner
- No need to refresh the page
- Uses WebSocket for efficient updates

### Categories & Priorities
- Use categories to organize items
- Set priorities to focus on what's important
- Filter by category for easier management

### Database
- All data stored locally in SQLite
- No internet required after setup
- Database location: `server/data/micasa.db`
- Easy to backup - just copy the file!

### Backup Your Data
```bash
# Create backup
cp server/data/micasa.db server/data/micasa-backup-$(date +%Y%m%d).db

# Restore from backup
cp server/data/micasa-backup-YYYYMMDD.db server/data/micasa.db
```

## 🔧 Common Commands

```bash
# Start development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Production preview (build + start)
npm run preview

# Install/update dependencies
npm run install:all
```

## 🐛 Troubleshooting

### "Port 5000 already in use"

```bash
# Find and kill the process (Mac/Linux)
lsof -ti:5000 | xargs kill -9

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

### "Database error"

```bash
# Reset database (WARNING: deletes all data!)
rm server/data/micasa.db
# Restart the server - database will be recreated
```

### Frontend not loading

- Check server is running on port 5000
- Check browser console for errors
- Verify `client/vite.config.js` proxy settings
- Try clearing browser cache

## 📚 Learn More

- **[README.md](./README.md)** - Overview and features
- **[INSTALLATION.md](./INSTALLATION.md)** - Detailed installation guide
- **[FEATURES.md](./FEATURES.md)** - Complete feature documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to production

## 🤝 Need Help?

- Check the documentation files
- Search GitHub issues
- Create a new issue with:
  - Your OS and Node version
  - Steps to reproduce the problem
  - Error messages and logs

---

Enjoy using Micasa! 🏠✨
