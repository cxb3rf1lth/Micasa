-- ============================================================================
-- Micasa PostgreSQL Database Schema
-- For AWS RDS PostgreSQL Deployment
-- ============================================================================
--
-- This schema is designed for PostgreSQL 15+ on AWS RDS
-- Run this script after creating your RDS PostgreSQL database
--
-- Usage:
--   psql -h your-rds-endpoint.rds.amazonaws.com -U micasa -d micasa -f postgres-schema.sql
-- ============================================================================

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  partner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  avatar TEXT,
  theme VARCHAR(50) DEFAULT 'dark-purple',
  notifications BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_partner ON users(partner_id);

-- ============================================================================
-- SHOPPING NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS shopping_notes (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  item VARCHAR(200) NOT NULL,
  quantity VARCHAR(50) DEFAULT '1',
  category VARCHAR(50) DEFAULT 'groceries',
  priority VARCHAR(20) DEFAULT 'medium',
  is_purchased BOOLEAN DEFAULT false,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purchased_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  purchased_at TIMESTAMP,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shopping_household ON shopping_notes(household_id, is_purchased);
CREATE INDEX IF NOT EXISTS idx_shopping_created_by ON shopping_notes(created_by);

-- ============================================================================
-- CHORES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS chores (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  assigned_to INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  frequency VARCHAR(20) DEFAULT 'weekly',
  due_date TIMESTAMP NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  completed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(50) DEFAULT 'other',
  estimated_time INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chores_household ON chores(household_id, is_completed, due_date);
CREATE INDEX IF NOT EXISTS idx_chores_assigned ON chores(assigned_to, is_completed);

-- ============================================================================
-- APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(500) DEFAULT '',
  category VARCHAR(50) DEFAULT 'other',
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_minutes_before INTEGER DEFAULT 30,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  color VARCHAR(20) DEFAULT '#9D8DF1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_household ON appointments(household_id, start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);

-- ============================================================================
-- APPOINTMENT ATTENDEES TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointment_attendees (
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (appointment_id, user_id)
);

-- ============================================================================
-- REMINDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(50) DEFAULT 'other',
  reminder_date TIMESTAMP NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_both BOOLEAN DEFAULT true,
  priority VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reminders_household ON reminders(household_id, reminder_date, is_completed);
CREATE INDEX IF NOT EXISTS idx_reminders_created_by ON reminders(created_by);

-- ============================================================================
-- TODO LISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS todo_lists (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  is_shared BOOLEAN DEFAULT true,
  owner INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) DEFAULT 'household',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP,
  color VARCHAR(20) DEFAULT '#9D8DF1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_todo_lists_household ON todo_lists(household_id, is_shared);
CREATE INDEX IF NOT EXISTS idx_todo_lists_owner ON todo_lists(owner);

-- ============================================================================
-- TODO ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS todo_items (
  id SERIAL PRIMARY KEY,
  todo_list_id INTEGER NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
  text VARCHAR(500) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_todo_items_list ON todo_items(todo_list_id);

-- ============================================================================
-- TODO LIST SHARED WITH TABLE (Many-to-Many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS todo_list_shared_with (
  todo_list_id INTEGER NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_list_id, user_id)
);

-- ============================================================================
-- WHITEBOARD NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS whiteboard_notes (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'note',
  color VARCHAR(20) DEFAULT '#9D8DF1',
  font_size INTEGER DEFAULT 16,
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  width REAL DEFAULT 200,
  height REAL DEFAULT 150,
  rotation REAL DEFAULT 0,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whiteboard_household ON whiteboard_notes(household_id);
CREATE INDEX IF NOT EXISTS idx_whiteboard_created_by ON whiteboard_notes(created_by);

-- ============================================================================
-- VISION BOARD ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vision_board_items (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  type VARCHAR(50) DEFAULT 'goal',
  image_url TEXT,
  target_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'planning',
  priority VARCHAR(20) DEFAULT 'medium',
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  width REAL DEFAULT 250,
  height REAL DEFAULT 200,
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vision_board_household ON vision_board_items(household_id);
CREATE INDEX IF NOT EXISTS idx_vision_board_created_by ON vision_board_items(created_by);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_household ON messages(household_id, recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at);

-- ============================================================================
-- WEBHOOKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id SERIAL PRIMARY KEY,
  household_id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  secret VARCHAR(100),
  created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_household ON webhooks(household_id, is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_created_by ON webhooks(created_by);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================
-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_notes_updated_at BEFORE UPDATE ON shopping_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chores_updated_at BEFORE UPDATE ON chores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_lists_updated_at BEFORE UPDATE ON todo_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_todo_items_updated_at BEFORE UPDATE ON todo_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whiteboard_notes_updated_at BEFORE UPDATE ON whiteboard_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vision_board_items_updated_at BEFORE UPDATE ON vision_board_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
-- Grant all privileges to the micasa user (adjust username as needed)
-- This assumes you're running as a superuser and granting to the app user
--
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO micasa;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO micasa;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO micasa;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
-- If you see this without errors, the schema has been successfully created!
--
-- Next steps:
-- 1. Verify tables: \dt
-- 2. Check table structure: \d users
-- 3. Update your .env file with RDS connection details
-- 4. Restart your application
-- ============================================================================
