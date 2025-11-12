const { getDB } = require('../config/database');

class VisionBoardItem {
  static async create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO vision_board_items (
        householdId, title, description, type, imageUrl, 
        targetDate, status, priority, positionX, positionY, 
        width, height, createdBy, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.title,
      data.description || '',
      data.type || 'goal',
      data.imageUrl || null,
      data.targetDate || null,
      data.status || 'planning',
      data.priority || 'medium',
      data.positionX || 0,
      data.positionY || 0,
      data.width || 250,
      data.height || 200,
      data.createdBy,
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const item = db.prepare(`
      SELECT vbi.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM vision_board_items vbi
      LEFT JOIN users u ON vbi.createdBy = u.id
      WHERE vbi.id = ?
    `).get(id);
    
    return item ? this._formatItem(item) : null;
  }

  static findByHousehold(householdId) {
    const db = getDB();
    const items = db.prepare(`
      SELECT vbi.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM vision_board_items vbi
      LEFT JOIN users u ON vbi.createdBy = u.id
      WHERE vbi.householdId = ?
      ORDER BY vbi.createdAt DESC
    `).all(householdId);
    
    return items.map(item => this._formatItem(item));
  }

  static update(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    const allowedFields = ['title', 'description', 'type', 'imageUrl', 'targetDate', 'status', 'priority', 'positionX', 'positionY', 'width', 'height'];
    
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
    
    db.prepare(`UPDATE vision_board_items SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static delete(id) {
    const db = getDB();
    const result = db.prepare('DELETE FROM vision_board_items WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static _formatItem(item) {
    if (!item) return null;
    
    return {
      _id: item.id,
      id: item.id,
      householdId: item.householdId,
      title: item.title,
      description: item.description,
      type: item.type,
      imageUrl: item.imageUrl,
      targetDate: item.targetDate ? new Date(item.targetDate) : null,
      status: item.status,
      priority: item.priority,
      position: {
        x: item.positionX,
        y: item.positionY
      },
      size: {
        width: item.width,
        height: item.height
      },
      createdBy: {
        id: item.createdBy,
        username: item.createdByUsername,
        displayName: item.createdByDisplayName
      },
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    };
  }
}

module.exports = VisionBoardItem;
