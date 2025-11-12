const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'micasa.db');
let db;

const connectDB = () => {
  try {
    db = new Database(dbPath, { 
      verbose: process.env.NODE_ENV === 'development' ? console.log : null 
    });
    
    console.log(`SQLite Database Connected: ${dbPath}`);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize database schema
    initializeSchema();
    
    // Handle process termination
    process.on('SIGINT', () => {
      db.close();
      console.log('SQLite database connection closed through app termination');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      db.close();
      console.log('SQLite database connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const initializeSchema = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      displayName TEXT NOT NULL,
      partnerId INTEGER,
      avatar TEXT,
      theme TEXT DEFAULT 'dark-purple',
      notifications INTEGER DEFAULT 1,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (partnerId) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // Shopping notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shopping_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdId TEXT NOT NULL,
      item TEXT NOT NULL,
      quantity TEXT DEFAULT '1',
      category TEXT DEFAULT 'groceries',
      priority TEXT DEFAULT 'medium',
      isPurchased INTEGER DEFAULT 0,
      createdBy INTEGER NOT NULL,
      purchasedBy INTEGER,
      purchasedAt INTEGER,
      notes TEXT DEFAULT '',
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (purchasedBy) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_shopping_household ON shopping_notes(householdId, isPurchased)`);

  // Chores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      assignedTo INTEGER NOT NULL,
      frequency TEXT DEFAULT 'weekly',
      dueDate INTEGER NOT NULL,
      isCompleted INTEGER DEFAULT 0,
      completedAt INTEGER,
      completedBy INTEGER,
      priority TEXT DEFAULT 'medium',
      category TEXT DEFAULT 'other',
      estimatedTime INTEGER DEFAULT 30,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (completedBy) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_chores_household ON chores(householdId, isCompleted, dueDate)`);

  // Appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      startTime INTEGER NOT NULL,
      endTime INTEGER NOT NULL,
      location TEXT DEFAULT '',
      category TEXT DEFAULT 'other',
      reminderEnabled INTEGER DEFAULT 1,
      reminderMinutesBefore INTEGER DEFAULT 30,
      isRecurring INTEGER DEFAULT 0,
      recurrencePattern TEXT,
      createdBy INTEGER NOT NULL,
      color TEXT DEFAULT '#9D8DF1',
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_appointments_household ON appointments(householdId, startTime)`);

  // Appointment attendees table (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointment_attendees (
      appointmentId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      PRIMARY KEY (appointmentId, userId),
      FOREIGN KEY (appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'other',
      reminderDate INTEGER NOT NULL,
      isRecurring INTEGER DEFAULT 0,
      recurrencePattern TEXT,
      isCompleted INTEGER DEFAULT 0,
      completedAt INTEGER,
      createdBy INTEGER NOT NULL,
      notifyBoth INTEGER DEFAULT 1,
      priority TEXT DEFAULT 'medium',
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_reminders_household ON reminders(householdId, reminderDate, isCompleted)`);

  // Todo lists table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todo_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      householdId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      isShared INTEGER DEFAULT 1,
      owner INTEGER NOT NULL,
      category TEXT DEFAULT 'household',
      priority TEXT DEFAULT 'medium',
      dueDate INTEGER,
      color TEXT DEFAULT '#9D8DF1',
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_todo_lists_household ON todo_lists(householdId, isShared)`);

  // Todo items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS todo_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todoListId INTEGER NOT NULL,
      text TEXT NOT NULL,
      isCompleted INTEGER DEFAULT 0,
      completedAt INTEGER,
      createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      FOREIGN KEY (todoListId) REFERENCES todo_lists(id) ON DELETE CASCADE
    )
  `);

  // Todo list shared with table (many-to-many)
  db.exec(`
    CREATE TABLE IF NOT EXISTS todo_list_shared_with (
      todoListId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      PRIMARY KEY (todoListId, userId),
      FOREIGN KEY (todoListId) REFERENCES todo_lists(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database schema initialized');
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
