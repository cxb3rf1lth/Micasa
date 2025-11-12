const { getDB } = require('../config/database');

class Reminder {
  static create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO reminders (
        householdId, title, description, category, reminderDate,
        isRecurring, recurrencePattern, isCompleted, completedAt,
        createdBy, notifyBoth, priority, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.title,
      data.description || '',
      data.category || 'other',
      new Date(data.reminderDate).getTime(),
      data.isRecurring ? 1 : 0,
      data.recurrencePattern || null,
      data.isCompleted ? 1 : 0,
      data.completedAt ? new Date(data.completedAt).getTime() : null,
      data.createdBy,
      data.notifyBoth !== false ? 1 : 0,
      data.priority || 'medium',
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const reminder = db.prepare('SELECT * FROM reminders WHERE id = ?').get(id);
    return reminder ? this._formatReminder(reminder) : null;
  }

  static find(query = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM reminders WHERE 1=1';
    const params = [];
    
    if (query.householdId) {
      sql += ' AND householdId = ?';
      params.push(query.householdId);
    }
    
    sql += ' ORDER BY reminderDate ASC';
    
    const reminders = db.prepare(sql).all(...params);
    return reminders.map(reminder => this._formatReminder(reminder));
  }

  static findByIdAndUpdate(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== '_id') {
        if (key === 'isCompleted' || key === 'isRecurring' || key === 'notifyBoth') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'reminderDate' || key === 'completedAt') {
          fields.push(`${key} = ?`);
          const val = updates[key];
          values.push(val ? (val instanceof Date ? val.getTime() : new Date(val).getTime()) : null);
        } else if (updates[key] instanceof Date) {
          fields.push(`${key} = ?`);
          values.push(updates[key].getTime());
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    fields.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);
    
    db.prepare(`UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static findByIdAndDelete(id) {
    const db = getDB();
    const reminder = this.findById(id);
    db.prepare('DELETE FROM reminders WHERE id = ?').run(id);
    return reminder;
  }

  static _formatReminder(reminder) {
    if (!reminder) return null;
    
    return {
      _id: reminder.id,
      id: reminder.id,
      householdId: reminder.householdId,
      title: reminder.title,
      description: reminder.description,
      category: reminder.category,
      reminderDate: new Date(reminder.reminderDate),
      isRecurring: reminder.isRecurring === 1,
      recurrencePattern: reminder.recurrencePattern,
      isCompleted: reminder.isCompleted === 1,
      completedAt: reminder.completedAt ? new Date(reminder.completedAt) : null,
      createdBy: reminder.createdBy,
      notifyBoth: reminder.notifyBoth === 1,
      priority: reminder.priority,
      createdAt: new Date(reminder.createdAt),
      updatedAt: new Date(reminder.updatedAt)
    };
  }
}

module.exports = Reminder;
