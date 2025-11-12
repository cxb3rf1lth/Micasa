const { getDB } = require('../config/database');

class Message {
  static async create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO messages (
        householdId, senderId, recipientId, content,
        isRead, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.senderId,
      data.recipientId,
      data.content,
      0,
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const message = db.prepare(`
      SELECT m.*, 
        u1.username as senderUsername, u1.displayName as senderDisplayName,
        u2.username as recipientUsername, u2.displayName as recipientDisplayName
      FROM messages m
      LEFT JOIN users u1 ON m.senderId = u1.id
      LEFT JOIN users u2 ON m.recipientId = u2.id
      WHERE m.id = ?
    `).get(id);
    
    return message ? this._formatMessage(message) : null;
  }

  static findByHousehold(householdId, userId) {
    const db = getDB();
    const messages = db.prepare(`
      SELECT m.*, 
        u1.username as senderUsername, u1.displayName as senderDisplayName,
        u2.username as recipientUsername, u2.displayName as recipientDisplayName
      FROM messages m
      LEFT JOIN users u1 ON m.senderId = u1.id
      LEFT JOIN users u2 ON m.recipientId = u2.id
      WHERE m.householdId = ? AND (m.senderId = ? OR m.recipientId = ?)
      ORDER BY m.createdAt DESC
    `).all(householdId, userId, userId);
    
    return messages.map(message => this._formatMessage(message));
  }

  static findConversation(userId1, userId2) {
    const db = getDB();
    const messages = db.prepare(`
      SELECT m.*, 
        u1.username as senderUsername, u1.displayName as senderDisplayName,
        u2.username as recipientUsername, u2.displayName as recipientDisplayName
      FROM messages m
      LEFT JOIN users u1 ON m.senderId = u1.id
      LEFT JOIN users u2 ON m.recipientId = u2.id
      WHERE (m.senderId = ? AND m.recipientId = ?) OR (m.senderId = ? AND m.recipientId = ?)
      ORDER BY m.createdAt ASC
    `).all(userId1, userId2, userId2, userId1);
    
    return messages.map(message => this._formatMessage(message));
  }

  static markAsRead(id) {
    const db = getDB();
    const now = Date.now();
    
    db.prepare(`
      UPDATE messages 
      SET isRead = 1, readAt = ?, updatedAt = ?
      WHERE id = ?
    `).run(now, now, id);
    
    return this.findById(id);
  }

  static getUnreadCount(userId) {
    const db = getDB();
    const result = db.prepare(`
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE recipientId = ? AND isRead = 0
    `).get(userId);
    
    return result ? result.count : 0;
  }

  static delete(id) {
    const db = getDB();
    const result = db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static _formatMessage(message) {
    if (!message) return null;
    
    return {
      _id: message.id,
      id: message.id,
      householdId: message.householdId,
      sender: {
        id: message.senderId,
        username: message.senderUsername,
        displayName: message.senderDisplayName
      },
      recipient: {
        id: message.recipientId,
        username: message.recipientUsername,
        displayName: message.recipientDisplayName
      },
      content: message.content,
      isRead: message.isRead === 1,
      readAt: message.readAt ? new Date(message.readAt) : null,
      createdAt: new Date(message.createdAt),
      updatedAt: new Date(message.updatedAt)
    };
  }
}

module.exports = Message;
