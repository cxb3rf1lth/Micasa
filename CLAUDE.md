# CLAUDE.md - AI Assistant Development Guide

This document provides comprehensive guidance for AI assistants working on the Micasa codebase. It covers architecture, conventions, patterns, and workflows to ensure consistent, high-quality contributions.

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Codebase Structure](#codebase-structure)
- [Development Conventions](#development-conventions)
- [Key Patterns](#key-patterns)
- [Database Schema](#database-schema)
- [API Conventions](#api-conventions)
- [Real-time Features](#real-time-features)
- [Security Guidelines](#security-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

**Micasa** is a modern, real-time household management application designed for couples to collaboratively manage their home life.

### Tech Stack

#### Frontend (`client/`)
- **React 18** with Vite - Fast development and optimized builds
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Socket.IO Client** - Real-time bidirectional communication
- **Axios** - HTTP client for API calls
- **Zustand** - Lightweight state management
- **date-fns** - Date formatting and manipulation

#### Backend (`server/`)
- **Node.js + Express** - RESTful API server
- **SQLite (better-sqlite3)** - Local file-based database
- **Socket.IO** - WebSocket server for real-time updates
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-validator** - Input validation
- **express-rate-limit** - API rate limiting

### Key Features
1. **Shopping Lists** - Shared shopping with categories and priorities
2. **Household Chores** - Task management with assignments and tracking
3. **Appointments** - Shared calendar with reminders
4. **To-Do Lists** - Collaborative task lists
5. **Reminders** - Bill and maintenance reminders
6. **Whiteboard** - Creative space for notes and ideas
7. **Vision Board** - Goals and dreams tracking
8. **In-App Messaging** - Direct partner communication
9. **Webhooks** - External notifications integration
10. **Household Roles** - Customizable user roles

---

## Architecture

### Monorepo Structure

```
Micasa/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth)
│   │   ├── pages/         # Page components (views)
│   │   ├── services/      # API and Socket.IO services
│   │   ├── styles/        # CSS stylesheets
│   │   ├── App.jsx        # Root component with routing
│   │   └── main.jsx       # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── config/       # Configuration (database)
│   │   ├── controllers/  # Business logic handlers
│   │   ├── middleware/   # Express middleware (auth, rate limiting)
│   │   ├── models/       # Data models (SQLite)
│   │   ├── routes/       # API route definitions
│   │   ├── utils/        # Utility functions
│   │   └── index.js      # Server entry point
│   ├── data/             # SQLite database files (gitignored)
│   ├── .env              # Environment variables (gitignored)
│   └── package.json
├── package.json          # Root package.json with workspace scripts
├── install.sh/bat        # Installation scripts
├── quick-start.sh/bat    # Quick start scripts
└── [DOCUMENTATION].md    # Various documentation files
```

### Request Flow

1. **Client Request** → Axios API call from component/page
2. **API Service** → Organized by feature in `client/src/services/api.js`
3. **Express Route** → Route handler in `server/src/routes/`
4. **Middleware** → Auth validation, rate limiting, input validation
5. **Controller** → Business logic in `server/src/controllers/`
6. **Model** → Data access layer in `server/src/models/`
7. **Database** → SQLite operations
8. **Response** → JSON response back to client
9. **WebSocket** → Broadcast update to other connected clients via Socket.IO

---

## Codebase Structure

### Frontend Structure (`client/src/`)

#### Components (`components/`)
- **Layout.jsx** - Main layout wrapper with sidebar and header
- **Header.jsx** - Top navigation bar with user info and logout
- **Sidebar.jsx** - Left navigation menu

#### Contexts (`contexts/`)
- **AuthContext.jsx** - Authentication state management
  - Provides: `user`, `login()`, `logout()`, `register()`, `loading`
  - Handles JWT token storage in localStorage
  - Auto-fetches user on mount if token exists

#### Pages (`pages/`)
Each feature has its own page component:
- **Dashboard.jsx** - Home page overview
- **Shopping.jsx** - Shopping list management
- **Chores.jsx** - Household chores
- **Appointments.jsx** - Calendar and appointments
- **Todos.jsx** - To-do lists
- **Reminders.jsx** - Reminders management
- **Whiteboard.jsx** - Interactive whiteboard
- **VisionBoard.jsx** - Vision board
- **Messages.jsx** - In-app messaging
- **Webhooks.jsx** - Webhook configuration
- **Settings.jsx** - User settings
- **Login.jsx** / **Register.jsx** - Authentication

#### Services (`services/`)
- **api.js** - Axios instance and all API endpoints organized by feature
- **socket.js** - Socket.IO client setup and event handlers

### Backend Structure (`server/src/`)

#### Config (`config/`)
- **database.js** - SQLite connection and schema initialization
  - `connectDB()` - Initialize database connection
  - `getDB()` - Get database instance
  - `initializeSchema()` - Create all tables and indexes

#### Controllers (`controllers/`)
One controller per feature, handles business logic:
- **authController.js** - User registration, login, partner linking
- **shoppingController.js** - Shopping list CRUD operations
- **choreController.js** - Chores management
- **appointmentController.js** - Appointments with attendees
- **todoController.js** - Todo lists and items
- **reminderController.js** - Reminders management
- **whiteboardController.js** - Whiteboard notes
- **visionBoardController.js** - Vision board items
- **messageController.js** - In-app messaging
- **webhookController.js** - Webhook configuration

#### Middleware (`middleware/`)
- **auth.js** - JWT authentication middleware
  - Validates token from Authorization header
  - Attaches `req.user` with user data
  - Returns 401 if invalid/missing token
- **rateLimiter.js** - Rate limiting configurations
  - `apiLimiter` - General API rate limit
  - `authLimiter` - Stricter limit for auth endpoints
  - `staticLimiter` - Limit for static file serving

#### Models (`models/`)
Data access layer with SQLite operations:
- **User.js** - User CRUD and authentication
- **ShoppingNote.js** - Shopping items
- **Chore.js** - Household chores
- **Appointment.js** - Appointments with attendees
- **TodoList.js** - Todo lists and items
- **Reminder.js** - Reminders
- **WhiteboardNote.js** - Whiteboard notes
- **VisionBoardItem.js** - Vision board items
- **Message.js** - Messages
- **Webhook.js** - Webhook configurations

#### Routes (`routes/`)
Express route definitions, one file per feature:
- Maps HTTP methods to controller functions
- Applies auth middleware to protected routes
- Uses express-validator for input validation

#### Utils (`utils/`)
- **generateToken.js** - JWT token generation
- **sanitize.js** - Input sanitization helpers
- **webhookTrigger.js** - Webhook notification sender

---

## Development Conventions

### Code Style

#### JavaScript/JSX
- Use **ES6+ syntax** (arrow functions, destructuring, async/await)
- **No semicolons** (consistent with existing code)
- **2-space indentation**
- **Single quotes** for strings
- **CamelCase** for variables/functions, **PascalCase** for components
- Use **const** by default, **let** when reassignment needed, avoid **var**

#### React Conventions
- **Functional components** with hooks (no class components)
- **Named exports** for API services, **default export** for components
- **Props destructuring** in function parameters
- **Early returns** for conditional rendering
- **Custom hooks** prefix with "use" (e.g., `useAuth`, `useSocket`)

Example:
```jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const MyComponent = ({ title, items = [] }) => {
  const [isLoading, setIsLoading] = useState(false)

  if (!title) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1>{title}</h1>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </motion.div>
  )
}

export default MyComponent
```

#### Backend Conventions
- **Async/await** for asynchronous operations (avoid callbacks)
- **Try-catch blocks** for error handling in controllers
- **Consistent error responses**: `res.status(4xx/5xx).json({ message: 'Error description' })`
- **Success responses**: `res.json(data)` or `res.status(201).json(data)` for creation
- **Route protection**: Always apply `auth` middleware to protected routes

Example:
```javascript
const getItems = async (req, res) => {
  try {
    const items = Model.findByHousehold(req.user.householdId)
    res.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    res.status(500).json({ message: 'Failed to fetch items' })
  }
}
```

### Naming Conventions

#### Files
- **Components**: PascalCase (e.g., `ShoppingList.jsx`, `Header.jsx`)
- **Utilities**: camelCase (e.g., `generateToken.js`, `sanitize.js`)
- **Routes/Controllers**: camelCase with feature name (e.g., `shoppingController.js`, `todos.js`)

#### Variables
- **Boolean**: Prefix with `is`, `has`, `should` (e.g., `isLoading`, `hasPermission`)
- **Functions**: Verb + noun (e.g., `getUser`, `createItem`, `handleSubmit`)
- **Event handlers**: Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MAX_RETRIES`, `API_BASE_URL`)

### Git Workflow

#### Branch Naming
- Feature branches: `claude/feature-name-sessionid`
- Bug fixes: `claude/fix-description-sessionid`
- Always include session ID suffix for Claude branches

#### Commit Messages
Follow conventional commits style:
- **feat:** New feature (e.g., `feat: add shopping list filtering`)
- **fix:** Bug fix (e.g., `fix: resolve authentication token expiry`)
- **refactor:** Code restructuring (e.g., `refactor: extract validation logic`)
- **docs:** Documentation changes (e.g., `docs: update API documentation`)
- **style:** Code style changes (e.g., `style: format code with prettier`)
- **test:** Test additions/modifications
- **chore:** Build process or tooling changes

Example commits:
```
feat: add webhook notification system
fix: prevent unauthorized message access
refactor: consolidate database queries
docs: add CLAUDE.md development guide
```

#### Pull Request Guidelines
1. **Clear description** of changes and motivation
2. **Reference related issues** if applicable
3. **Test plan** describing how changes were validated
4. **Screenshots** for UI changes
5. **Breaking changes** clearly documented

---

## Key Patterns

### Authentication Pattern

#### Client-Side (Frontend)
```jsx
// In AuthContext
const login = async (username, password) => {
  const response = await axios.post('/api/auth/login', { username, password })
  const { token, user } = response.data
  localStorage.setItem('token', token)
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  setUser(user)
}

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Loading...</div>
  if (!user) return <Navigate to="/login" />
  return children
}
```

#### Server-Side (Backend)
```javascript
// Auth middleware (middleware/auth.js)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    if (!token) throw new Error()

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = User.findById(decoded.id)
    if (!user) throw new Error()

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' })
  }
}

// Apply to routes
router.get('/api/shopping', auth, shoppingController.getAll)
```

### Household ID Pattern

**Critical:** Most resources belong to a household (pair of linked partners).

```javascript
// Household ID generation (consistent pattern)
const getHouseholdId = (user) => {
  if (!user.partnerId) return user._id.toString()

  // Sort IDs to ensure consistent household ID regardless of who queries
  return [user._id.toString(), user.partnerId.toString()]
    .sort()
    .join('-')
}

// Usage in controllers
const getItems = async (req, res) => {
  const householdId = req.user.partnerId
    ? [req.user._id, req.user.partnerId].sort().join('-')
    : req.user._id.toString()

  const items = Model.findByHousehold(householdId)
  res.json(items)
}
```

### Real-time Update Pattern

When data changes, emit Socket.IO event to household:

```javascript
// Server-side (in controller after database update)
const updateItem = async (req, res) => {
  try {
    const item = Model.update(id, data)
    const io = req.app.get('io')

    // Emit to all household members
    io.to(householdId).emit('shopping-updated', {
      action: 'update',
      item,
      householdId
    })

    res.json(item)
  } catch (error) {
    // handle error
  }
}

// Client-side (in component or service)
import socket from '../services/socket'

useEffect(() => {
  socket.on('shopping-updated', (data) => {
    if (data.action === 'update') {
      // Update local state
      setItems(prev => prev.map(item =>
        item.id === data.item.id ? data.item : item
      ))
    }
  })

  return () => socket.off('shopping-updated')
}, [])
```

### Model Pattern (SQLite)

All models follow consistent CRUD pattern:

```javascript
class Model {
  static create(data) {
    const stmt = db.prepare('INSERT INTO table (...) VALUES (...)')
    const result = stmt.run(data)
    return this.findById(result.lastInsertRowid)
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM table WHERE id = ?')
    return stmt.get(id)
  }

  static findByHousehold(householdId) {
    const stmt = db.prepare('SELECT * FROM table WHERE householdId = ? ORDER BY ...')
    return stmt.all(householdId)
  }

  static update(id, data) {
    const stmt = db.prepare('UPDATE table SET ..., updatedAt = ? WHERE id = ?')
    stmt.run(...data, Date.now(), id)
    return this.findById(id)
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM table WHERE id = ?')
    return stmt.run(id)
  }
}
```

### Input Validation Pattern

Use express-validator in routes:

```javascript
const { body, param, validationResult } = require('express-validator')

router.post('/items',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format')
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    // proceed with controller logic
  }
)
```

---

## Database Schema

### Core Tables

#### users
- **id** (INTEGER PRIMARY KEY AUTOINCREMENT)
- **username** (TEXT UNIQUE NOT NULL)
- **password** (TEXT NOT NULL) - bcrypt hashed
- **displayName** (TEXT NOT NULL)
- **partnerId** (INTEGER) - References users(id)
- **avatar** (TEXT) - Avatar URL
- **theme** (TEXT DEFAULT 'dark-purple')
- **notifications** (INTEGER DEFAULT 1) - Boolean
- **role** (TEXT DEFAULT 'member') - Household role
- **createdAt**, **updatedAt** (INTEGER) - Unix timestamps in milliseconds

#### Resource Tables Pattern
All resource tables (shopping_notes, chores, appointments, etc.) follow similar structure:
- **id** (INTEGER PRIMARY KEY AUTOINCREMENT)
- **householdId** (TEXT NOT NULL) - Links resources to household
- **createdBy** (INTEGER NOT NULL) - Foreign key to users
- **createdAt**, **updatedAt** (INTEGER) - Unix timestamps in milliseconds
- Feature-specific fields

#### Key Indexes
```sql
-- Optimize household queries
CREATE INDEX idx_shopping_household ON shopping_notes(householdId, isPurchased)
CREATE INDEX idx_chores_household ON chores(householdId, isCompleted, dueDate)
CREATE INDEX idx_appointments_household ON appointments(householdId, startTime)
CREATE INDEX idx_messages_household ON messages(householdId, recipientId, isRead)
```

### Relationships

- **User ↔ User**: Self-referencing via `partnerId` (one-to-one)
- **User → Resources**: One user creates many resources (one-to-many)
- **Appointment ↔ Users**: Many-to-many via `appointment_attendees` junction table
- **TodoList ↔ Users**: Many-to-many via `todo_list_shared_with` junction table
- **TodoList → TodoItems**: One-to-many (cascade delete)

---

## API Conventions

### Endpoint Structure
```
/api/{resource}           GET - List all (filtered by household)
/api/{resource}           POST - Create new
/api/{resource}/:id       GET - Get by ID (verify household ownership)
/api/{resource}/:id       PUT - Update (verify household ownership)
/api/{resource}/:id       DELETE - Delete (verify household ownership)
```

### Request/Response Patterns

#### Success Responses
- **200 OK**: Successful GET, PUT, DELETE
- **201 Created**: Successful POST
- Body: JSON data or array of data

```json
// Single item
{ "id": 1, "title": "...", "createdAt": 1234567890 }

// List
[{ "id": 1, ... }, { "id": 2, ... }]
```

#### Error Responses
- **400 Bad Request**: Invalid input/validation errors
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server-side error

```json
// Error format
{ "message": "Error description" }

// Validation errors
{
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

### Authentication Header
All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

---

## Real-time Features

### Socket.IO Events

#### Client → Server
- **join-household** - Join household room on connection
  - Payload: `{ householdId: string }`
  - Server validates user belongs to household

#### Server → Client
Broadcast events for real-time updates:
- **shopping-updated** - Shopping list change
- **chore-updated** - Chore change
- **appointment-updated** - Appointment change
- **todo-updated** - Todo list change
- **reminder-updated** - Reminder change
- **whiteboard-updated** - Whiteboard note change
- **vision-board-updated** - Vision board item change
- **message-received** - New message received

Event payload format:
```javascript
{
  action: 'create' | 'update' | 'delete',
  item: { /* updated/created data */ },
  householdId: 'user1-user2'
}
```

### Socket Authentication

Socket.IO connections are authenticated:
```javascript
// Client connection
import io from 'socket.io-client'
const token = localStorage.getItem('token')
const socket = io('http://localhost:5000', {
  auth: { token }
})

// Server authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  // Verify JWT and attach user to socket
  socket.userId = decoded.id
  socket.user = user
  next()
})
```

---

## Security Guidelines

### Critical Security Rules

1. **Always validate household ownership**
   ```javascript
   // Before any operation, verify user has access
   const item = Model.findById(id)
   if (!item) return res.status(404).json({ message: 'Not found' })

   const userHouseholdId = getHouseholdId(req.user)
   if (item.householdId !== userHouseholdId) {
     return res.status(403).json({ message: 'Access denied' })
   }
   ```

2. **Never expose passwords**
   ```javascript
   // In User model, exclude password from queries
   static findById(id) {
     const stmt = db.prepare('SELECT id, username, displayName, ... FROM users WHERE id = ?')
     // Note: SELECT * is FORBIDDEN - always explicit columns without password
   }
   ```

3. **Sanitize all user input**
   ```javascript
   const { sanitizeInput } = require('../utils/sanitize')
   const cleanTitle = sanitizeInput(req.body.title)
   ```

4. **Use parameterized queries** (SQLite prepared statements)
   ```javascript
   // GOOD
   const stmt = db.prepare('SELECT * FROM items WHERE id = ?')
   stmt.get(id)

   // BAD - SQL injection risk
   db.exec(`SELECT * FROM items WHERE id = ${id}`)
   ```

5. **Rate limit all endpoints** (already configured in middleware)

6. **Validate partner relationships**
   ```javascript
   // For messages, verify users are partners
   if (!req.user.partnerId || req.user.partnerId !== recipientId) {
     return res.status(403).json({ message: 'Can only message your partner' })
   }
   ```

7. **Password requirements** (enforced in authController)
   - Minimum 8 characters
   - Must contain letters and numbers
   - Hashed with bcrypt before storage

### Security Headers (Helmet)
Already configured in `server/src/index.js`:
- Content Security Policy
- X-Frame-Options (prevent clickjacking)
- X-Content-Type-Options (prevent MIME sniffing)
- Strict-Transport-Security (HTTPS enforcement in production)

---

## Testing Guidelines

### Manual Testing Checklist

When adding/modifying features:

1. **Authentication**
   - [ ] Unauthenticated requests return 401
   - [ ] Invalid tokens return 401
   - [ ] Valid tokens allow access

2. **Authorization**
   - [ ] Users can only access their household's data
   - [ ] Users cannot access other households' data
   - [ ] Partner linking works correctly

3. **CRUD Operations**
   - [ ] Create: Successfully creates with valid data
   - [ ] Read: Returns correct data for household
   - [ ] Update: Updates only with proper ownership
   - [ ] Delete: Deletes only with proper ownership

4. **Real-time Updates**
   - [ ] Changes sync to partner in real-time
   - [ ] WebSocket events received correctly
   - [ ] Reconnection after disconnect works

5. **Input Validation**
   - [ ] Invalid data returns 400 with error messages
   - [ ] Missing required fields rejected
   - [ ] XSS attempts sanitized

6. **Edge Cases**
   - [ ] Empty lists display correctly
   - [ ] Long text handled gracefully
   - [ ] Date/time edge cases (timezone, past dates)
   - [ ] Concurrent updates don't corrupt data

### Testing Locally

```bash
# Terminal 1: Start server in dev mode
cd server
npm run dev

# Terminal 2: Start client in dev mode
cd client
npm run dev

# Access at http://localhost:3000
```

### Production Testing

```bash
# Build client
npm run build

# Start production server
npm start

# Access at http://localhost:5000
```

---

## Common Tasks

### Adding a New Feature

1. **Plan the feature**
   - Define data model and relationships
   - Design API endpoints
   - Plan UI components

2. **Backend Implementation**
   ```bash
   # Add database schema in server/src/config/database.js
   # Create model in server/src/models/NewFeature.js
   # Create controller in server/src/controllers/newFeatureController.js
   # Create routes in server/src/routes/newFeature.js
   # Add route to server/src/index.js
   ```

3. **Frontend Implementation**
   ```bash
   # Add API service in client/src/services/api.js
   # Create page component in client/src/pages/NewFeature.jsx
   # Add route in client/src/App.jsx
   # Add navigation link in client/src/components/Sidebar.jsx
   ```

4. **Real-time Support**
   ```bash
   # Add Socket.IO event in server/src/index.js
   # Emit events in controller after mutations
   # Listen for events in client/src/services/socket.js or component
   ```

5. **Testing**
   - Test all CRUD operations
   - Test authorization
   - Test real-time updates
   - Test input validation

### Adding a New API Endpoint

1. **Define route** in appropriate route file:
   ```javascript
   router.post('/items/:id/action', auth, controller.performAction)
   ```

2. **Add validation** if needed:
   ```javascript
   router.post('/items/:id/action',
     auth,
     [body('parameter').notEmpty()],
     controller.performAction
   )
   ```

3. **Implement controller**:
   ```javascript
   const performAction = async (req, res) => {
     try {
       // Validate ownership
       // Perform action
       // Emit socket event if needed
       res.json(result)
     } catch (error) {
       res.status(500).json({ message: error.message })
     }
   }
   ```

4. **Add to API service** (client):
   ```javascript
   export const itemsAPI = {
     performAction: (id, data) => api.post(`/items/${id}/action`, data)
   }
   ```

### Modifying Database Schema

1. **Update schema** in `server/src/config/database.js`:
   ```javascript
   // Add new column with default or make nullable
   db.exec(`
     ALTER TABLE table_name
     ADD COLUMN new_column TEXT DEFAULT 'default_value'
   `)
   ```

2. **Update model** to handle new field
3. **Update controller** to accept/return new field
4. **Update validation** if needed
5. **Update frontend** to use new field

**Note:** SQLite has limited ALTER TABLE support. For complex changes, may need to:
- Create new table with desired schema
- Copy data from old table
- Drop old table
- Rename new table

### Adding WebSocket Event

1. **Server** (`server/src/index.js`):
   ```javascript
   socket.on('new-event-updated', (data) => {
     // Verify household membership
     socket.to(data.householdId).emit('new-event-updated', data)
   })
   ```

2. **Controller** (emit on data change):
   ```javascript
   const io = req.app.get('io')
   io.to(householdId).emit('new-event-updated', {
     action: 'create',
     item: newItem,
     householdId
   })
   ```

3. **Client** (`client/src/services/socket.js` or in component):
   ```javascript
   socket.on('new-event-updated', (data) => {
     // Update local state
     console.log('New event:', data)
   })
   ```

---

## Troubleshooting

### Common Issues

#### "Please authenticate" / 401 Errors
- **Cause:** Missing or invalid JWT token
- **Fix:** Ensure token is stored in localStorage and sent in Authorization header
- **Check:** `localStorage.getItem('token')` and axios default headers

#### Socket.IO Not Connecting
- **Cause:** Token not provided or CORS issue
- **Fix:** Verify token passed in `auth` option when creating socket
- **Check:** Browser console for connection errors

#### "Access denied" / 403 Errors
- **Cause:** User doesn't belong to household or not partner
- **Fix:** Verify household ID calculation matches on client and server
- **Check:** `getHouseholdId()` logic consistency

#### Real-time Updates Not Working
- **Cause:** Not joined to household room or event name mismatch
- **Fix:** Ensure `join-household` emitted on connection with correct householdId
- **Check:** Server logs for room join confirmation

#### Database Schema Errors
- **Cause:** Missing table or column
- **Fix:** Delete `server/data/micasa.db` and restart server (re-initializes schema)
- **Warning:** This deletes all data - only for development

#### Build Errors
- **Cause:** Dependency issues or syntax errors
- **Fix:**
  ```bash
  # Clear and reinstall
  rm -rf node_modules client/node_modules server/node_modules
  npm run install:all

  # Rebuild
  npm run build
  ```

### Debugging Tips

1. **Backend Debugging**
   ```javascript
   // Add detailed logging
   console.log('User:', req.user)
   console.log('Household ID:', householdId)
   console.log('Query result:', items)
   ```

2. **Frontend Debugging**
   ```javascript
   // Log API responses
   console.log('API response:', response.data)

   // Log socket events
   socket.onAny((event, ...args) => {
     console.log('Socket event:', event, args)
   })
   ```

3. **Database Debugging**
   ```javascript
   // Enable verbose mode in database.js
   const db = new Database(dbPath, { verbose: console.log })
   // Shows all SQL queries executed
   ```

4. **Network Debugging**
   - Use browser DevTools → Network tab
   - Check request/response payloads
   - Verify status codes and headers

---

## Design System

### Color Palette
- **Primary Purple**: `#9D8DF1`, `#C8B6FF`
- **Background**: `#0A0A0A` (black), `#1A1A1A` (dark grey)
- **Text**: `#FFFFFF` (white), `#A0A0A0` (grey)
- **Success**: `#4CAF50` (green)
- **Warning**: `#FF9800` (orange)
- **Danger**: `#F44336` (red)

### Typography
- **Font Family**: Inter
- **Headings**: Bold weight
- **Body**: Regular weight
- **Code**: Monospace

### Animation Guidelines
- Use Framer Motion for all animations
- Default duration: 0.3s
- Use `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` for fade-ins
- Stagger children animations with `staggerChildren: 0.1`

---

## Environment Variables

### Server (.env)
```bash
# Required
JWT_SECRET=your_secret_key_here   # Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
PORT=5000                          # Server port (default: 5000)

# Optional
NODE_ENV=development               # development | production
CLIENT_URL=http://localhost:3000   # CORS origin for client
```

### Client
No environment variables required. API calls use relative path `/api` which proxies to server in development.

---

## Quick Reference

### NPM Scripts

**Root:**
- `npm run install:all` - Install all dependencies (root, client, server)
- `npm run dev` - Start both client and server in dev mode
- `npm run build` - Build client for production
- `npm start` - Start production server
- `npm run preview` - Build and preview in production mode

**Server:**
- `npm run dev` - Start with nodemon (auto-restart)
- `npm start` - Start production server

**Client:**
- `npm run dev` - Start Vite dev server (HMR)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### File Locations

| What | Where |
|------|-------|
| Add API endpoint (server) | `server/src/routes/*.js` |
| Add controller logic | `server/src/controllers/*Controller.js` |
| Add data model | `server/src/models/*.js` |
| Add database table | `server/src/config/database.js` |
| Add API call (client) | `client/src/services/api.js` |
| Add page component | `client/src/pages/*.jsx` |
| Add reusable component | `client/src/components/*.jsx` |
| Add route (client) | `client/src/App.jsx` |
| Add socket event handler | `client/src/services/socket.js` |
| Add middleware | `server/src/middleware/*.js` |
| Add utility function | `server/src/utils/*.js` |

### Key Files to Check

When working on:
- **Authentication** → `server/src/middleware/auth.js`, `client/src/contexts/AuthContext.jsx`
- **Real-time** → `server/src/index.js` (Socket.IO setup), `client/src/services/socket.js`
- **Database** → `server/src/config/database.js` (schema), `server/src/models/` (queries)
- **API** → `server/src/routes/` (endpoints), `server/src/controllers/` (logic)
- **UI Components** → `client/src/components/`, `client/src/pages/`
- **Routing** → `client/src/App.jsx`
- **Styling** → `client/src/styles/`

---

## Additional Resources

### Documentation Files
- **README.md** - Project overview and quick start
- **INSTALLATION.md** - Detailed installation instructions
- **FEATURES.md** - Complete feature guide
- **DEPLOYMENT.md** - Production deployment guide
- **PRODUCTION_SETUP.md** - Production setup and testing
- **CODE_REVIEW_FIXES.md** - Security improvements applied
- **QUICK_SETUP.md** - One-command installation guide

### External Documentation
- [React 18 Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/docs/v4/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [Framer Motion](https://www.framer.com/motion/)

---

## Summary

**Key Principles for AI Assistants:**
1. **Security First** - Always validate ownership and sanitize inputs
2. **Consistency** - Follow existing patterns and conventions
3. **Real-time** - Emit socket events for all data mutations
4. **Household-centric** - Most features are shared between partners
5. **Error Handling** - Graceful failures with clear error messages
6. **Code Quality** - Clean, readable, maintainable code

**Before making changes:**
- Read relevant model, controller, and route files
- Understand household ID and partner relationship patterns
- Check authorization logic
- Review existing similar features for patterns

**After making changes:**
- Test CRUD operations thoroughly
- Verify authorization (can't access other households)
- Test real-time synchronization
- Check error handling
- Commit with clear, descriptive message

This guide should enable any AI assistant to effectively contribute to the Micasa codebase while maintaining consistency, security, and quality.
