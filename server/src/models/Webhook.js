const { getDB } = require('../config/database');

class Webhook {
  static async create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO webhooks (
        householdId, name, url, events, isActive, 
        secret, createdBy, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.name,
      data.url,
      JSON.stringify(data.events || []),
      data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
      data.secret || null,
      data.createdBy,
      now,
      now
    );
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const webhook = db.prepare(`
      SELECT w.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM webhooks w
      LEFT JOIN users u ON w.createdBy = u.id
      WHERE w.id = ?
    `).get(id);
    
    return webhook ? this._formatWebhook(webhook) : null;
  }

  static findByHousehold(householdId) {
    const db = getDB();
    const webhooks = db.prepare(`
      SELECT w.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM webhooks w
      LEFT JOIN users u ON w.createdBy = u.id
      WHERE w.householdId = ?
      ORDER BY w.createdAt DESC
    `).all(householdId);
    
    return webhooks.map(webhook => this._formatWebhook(webhook));
  }

  static findActiveByHouseholdAndEvent(householdId, event) {
    const db = getDB();
    const webhooks = db.prepare(`
      SELECT w.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM webhooks w
      LEFT JOIN users u ON w.createdBy = u.id
      WHERE w.householdId = ? AND w.isActive = 1
      ORDER BY w.createdAt DESC
    `).all(householdId);
    
    return webhooks
      .map(webhook => this._formatWebhook(webhook))
      .filter(webhook => webhook.events.includes(event) || webhook.events.includes('*'));
  }

  static update(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    const allowedFields = ['name', 'url', 'isActive', 'secret'];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        if (key === 'isActive') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    if (updates.events) {
      fields.push('events = ?');
      values.push(JSON.stringify(updates.events));
    }
    
    if (fields.length === 0) return this.findById(id);
    
    fields.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);
    
    db.prepare(`UPDATE webhooks SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static delete(id) {
    const db = getDB();
    const result = db.prepare('DELETE FROM webhooks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static _formatWebhook(webhook) {
    if (!webhook) return null;
    
    return {
      _id: webhook.id,
      id: webhook.id,
      householdId: webhook.householdId,
      name: webhook.name,
      url: webhook.url,
      events: JSON.parse(webhook.events || '[]'),
      isActive: webhook.isActive === 1,
      secret: webhook.secret,
      createdBy: {
        id: webhook.createdBy,
        username: webhook.createdByUsername,
        displayName: webhook.createdByDisplayName
      },
      createdAt: new Date(webhook.createdAt),
      updatedAt: new Date(webhook.updatedAt)
    };
  }
}

module.exports = Webhook;
