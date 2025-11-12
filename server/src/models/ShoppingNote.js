const { getDB } = require('../config/database');

class ShoppingNote {
  static create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO shopping_notes (
        householdId, item, quantity, category, priority, isPurchased,
        createdBy, purchasedBy, purchasedAt, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.item,
      data.quantity || '1',
      data.category || 'groceries',
      data.priority || 'medium',
      data.isPurchased ? 1 : 0,
      data.createdBy,
      data.purchasedBy || null,
      data.purchasedAt || null,
      data.notes || '',
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const note = db.prepare('SELECT * FROM shopping_notes WHERE id = ?').get(id);
    return note ? this._formatNote(note) : null;
  }

  static find(query = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM shopping_notes WHERE 1=1';
    const params = [];
    
    if (query.householdId) {
      sql += ' AND householdId = ?';
      params.push(query.householdId);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    const notes = db.prepare(sql).all(...params);
    return notes.map(note => this._formatNote(note));
  }

  static findByIdAndUpdate(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== '_id') {
        if (key === 'isPurchased') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'purchasedAt' && updates[key] instanceof Date) {
          fields.push(`${key} = ?`);
          values.push(updates[key].getTime());
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
    
    db.prepare(`UPDATE shopping_notes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static findByIdAndDelete(id) {
    const db = getDB();
    const note = this.findById(id);
    db.prepare('DELETE FROM shopping_notes WHERE id = ?').run(id);
    return note;
  }

  static _formatNote(note) {
    if (!note) return null;
    
    return {
      _id: note.id,
      id: note.id,
      householdId: note.householdId,
      item: note.item,
      quantity: note.quantity,
      category: note.category,
      priority: note.priority,
      isPurchased: note.isPurchased === 1,
      createdBy: note.createdBy,
      purchasedBy: note.purchasedBy,
      purchasedAt: note.purchasedAt ? new Date(note.purchasedAt) : null,
      notes: note.notes,
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    };
  }
}

module.exports = ShoppingNote;
