# 🏠 Micasa - Household Management Application

A modern, real-time household management application designed for couples to collaboratively manage their home life.

## ✨ Features

### Core Features
- **Shopping Notes**: Shared shopping lists with categories, priorities, and real-time updates
- **Household Chores**: Task management with assignments, due dates, and completion tracking
- **Appointments**: Shared calendar for scheduling appointments and events
- **To-Do Lists**: Create and manage shared or personal to-do lists
- **Reminders**: Set reminders for bills, maintenance, and other important tasks

### Key Highlights
- 🔄 **Real-time Synchronization**: Changes sync instantly between partners using WebSocket
- 🤝 **Shared Features**: All features support 2-way collaboration
- 🎨 **Beautiful Design**: Deep purple pastel theme on dark background with smooth animations
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Secure**: JWT-based authentication with bcrypt password hashing
- ⚡ **Premium UX**: Framer Motion animations and intuitive interface

## 🎨 Design Theme

- **Primary Colors**: Deep purple pastels (#9D8DF1, #C8B6FF)
- **Background**: Black (#0A0A0A) and dark grey (#1A1A1A)
- **Accent Colors**: Purple gradients with subtle glow effects
- **Typography**: Inter font family
- **Animations**: Smooth fade-ins, slides, and interactive micro-animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Framer Motion** for animations
- **Socket.IO Client** for real-time updates
- **Axios** for API calls
- **Zustand** for state management
- **date-fns** for date formatting

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.IO** for WebSocket connections
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance - MongoDB Atlas recommended)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/cxb3rf1lth/Micasa.git
cd Micasa
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Configure environment variables**
```bash
# Copy example environment file
cp server/.env.example server/.env
# Edit server/.env and update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
```

4. **Set up MongoDB**
   - **Option A:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud database - recommended)
   - **Option B:** Install MongoDB locally (see [INSTALLATION.md](./INSTALLATION.md))

5. **Run the application**

Development mode (with hot reload):
```bash
npm run dev
```

Production preview:
```bash
npm run preview
```

This will start:
- Backend server on http://localhost:5000
- Frontend on http://localhost:3000

### 📚 Detailed Guides

- **[INSTALLATION.md](./INSTALLATION.md)** - Complete installation instructions
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production setup and VS Code testing
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to Heroku, Render, Railway, or VPS
- **[FEATURES.md](./FEATURES.md)** - Comprehensive feature guide

## 🚀 Usage

1. **Register an account**: Create your account with a username and password
2. **Link your partner**: After registration, use the "Link Partner" button to connect with your partner's account by entering their username
3. **Start managing**: Add shopping items, create chores, schedule appointments, and more!

## 📁 Project Structure

```
Micasa/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and socket services
│   │   ├── styles/        # CSS stylesheets
│   │   └── App.jsx        # Main App component
│   ├── index.html
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Mongoose models
│   │   ├── routes/       # API routes
│   │   ├── utils/        # Utility functions
│   │   └── index.js      # Server entry point
│   └── package.json
└── package.json          # Root package.json

```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/link-partner` - Link partner account

### Shopping
- `GET /api/shopping` - Get all shopping items
- `POST /api/shopping` - Create shopping item
- `PUT /api/shopping/:id` - Update shopping item
- `DELETE /api/shopping/:id` - Delete shopping item

### Chores
- `GET /api/chores` - Get all chores
- `POST /api/chores` - Create chore
- `PUT /api/chores/:id` - Update chore
- `DELETE /api/chores/:id` - Delete chore

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### To-Do Lists
- `GET /api/todos` - Get all to-do lists
- `POST /api/todos` - Create to-do list
- `PUT /api/todos/:id` - Update to-do list
- `DELETE /api/todos/:id` - Delete to-do list
- `POST /api/todos/:id/items` - Add item to list
- `PUT /api/todos/:id/items/:itemId` - Update item
- `DELETE /api/todos/:id/items/:itemId` - Delete item

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## 🔄 Real-time Events

WebSocket events for real-time synchronization:
- `shopping-updated` - Shopping list changes
- `chore-updated` - Chore changes
- `appointment-updated` - Appointment changes
- `todo-updated` - To-do list changes
- `reminder-updated` - Reminder changes

## 📚 Complete Documentation

This repository includes comprehensive documentation:

- **[README.md](./README.md)** (this file) - Overview and quick start
- **[INSTALLATION.md](./INSTALLATION.md)** - Detailed installation instructions
- **[FEATURES.md](./FEATURES.md)** - Complete feature guide and usage
- **[PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md)** - Production setup and local testing
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deploy to various platforms
- **[VSCODE_TESTING.md](./VSCODE_TESTING.md)** - Test in VS Code terminal
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)** - Pre-launch checklist

## 🚀 Quick Commands

```bash
# Install all dependencies
npm run install:all

# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Production preview
npm run preview

# Start production server
npm start
```

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📝 License

ISC

## 👥 Authors

Built with ❤️ for household management

---

**Ready to deploy?** Check out [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) to ensure you're production-ready!