const { getDB } = require('../config/database');

class WhiteboardNote {
  static async create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO whiteboard_notes (
        householdId, content, type, color, fontSize, 
        positionX, positionY, width, height, rotation,
        createdBy, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.content,
      data.type || 'note',
      data.color || '#9D8DF1',
      data.fontSize || 16,
      data.positionX || 0,
      data.positionY || 0,
      data.width || 200,
      data.height || 150,
      data.rotation || 0,
      data.createdBy,
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const note = db.prepare(`
      SELECT wn.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM whiteboard_notes wn
      LEFT JOIN users u ON wn.createdBy = u.id
      WHERE wn.id = ?
    `).get(id);
    
    return note ? this._formatNote(note) : null;
  }

  static findByHousehold(householdId) {
    const db = getDB();
    const notes = db.prepare(`
      SELECT wn.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM whiteboard_notes wn
      LEFT JOIN users u ON wn.createdBy = u.id
      WHERE wn.householdId = ?
      ORDER BY wn.createdAt DESC
    `).all(householdId);
    
    return notes.map(note => this._formatNote(note));
  }

  static update(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    const allowedFields = ['content', 'type', 'color', 'fontSize', 'positionX', 'positionY', 'width', 'height', 'rotation'];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) return this.findById(id);
    
    fields.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);
    
    db.prepare(`UPDATE whiteboard_notes SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static delete(id) {
    const db = getDB();
    const result = db.prepare('DELETE FROM whiteboard_notes WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static _formatNote(note) {
    if (!note) return null;
    
    return {
      _id: note.id,
      id: note.id,
      householdId: note.householdId,
      content: note.content,
      type: note.type,
      color: note.color,
      fontSize: note.fontSize,
      position: {
        x: note.positionX,
        y: note.positionY
      },
      size: {
        width: note.width,
        height: note.height
      },
      rotation: note.rotation,
      createdBy: {
        id: note.createdBy,
        username: note.createdByUsername,
        displayName: note.createdByDisplayName
      },
      createdAt: new Date(note.createdAt),
      updatedAt: new Date(note.updatedAt)
    };
  }
}

module.exports = WhiteboardNote;
