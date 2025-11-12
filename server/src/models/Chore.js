const { getDB } = require('../config/database');

class Chore {
  static create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO chores (
        householdId, title, description, assignedTo, frequency, dueDate,
        isCompleted, completedAt, completedBy, priority, category, estimatedTime,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.title,
      data.description || '',
      data.assignedTo,
      data.frequency || 'weekly',
      new Date(data.dueDate).getTime(),
      data.isCompleted ? 1 : 0,
      data.completedAt ? new Date(data.completedAt).getTime() : null,
      data.completedBy || null,
      data.priority || 'medium',
      data.category || 'other',
      data.estimatedTime || 30,
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const chore = db.prepare('SELECT * FROM chores WHERE id = ?').get(id);
    return chore ? this._formatChore(chore) : null;
  }

  static find(query = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM chores WHERE 1=1';
    const params = [];
    
    if (query.householdId) {
      sql += ' AND householdId = ?';
      params.push(query.householdId);
    }
    
    sql += ' ORDER BY dueDate ASC';
    
    const chores = db.prepare(sql).all(...params);
    return chores.map(chore => this._formatChore(chore));
  }

  static findByIdAndUpdate(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== '_id') {
        if (key === 'isCompleted') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'dueDate' || key === 'completedAt') {
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
    
    db.prepare(`UPDATE chores SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static findByIdAndDelete(id) {
    const db = getDB();
    const chore = this.findById(id);
    db.prepare('DELETE FROM chores WHERE id = ?').run(id);
    return chore;
  }

  static _formatChore(chore) {
    if (!chore) return null;
    
    return {
      _id: chore.id,
      id: chore.id,
      householdId: chore.householdId,
      title: chore.title,
      description: chore.description,
      assignedTo: chore.assignedTo,
      frequency: chore.frequency,
      dueDate: new Date(chore.dueDate),
      isCompleted: chore.isCompleted === 1,
      completedAt: chore.completedAt ? new Date(chore.completedAt) : null,
      completedBy: chore.completedBy,
      priority: chore.priority,
      category: chore.category,
      estimatedTime: chore.estimatedTime,
      createdAt: new Date(chore.createdAt),
      updatedAt: new Date(chore.updatedAt)
    };
  }
}

module.exports = Chore;
