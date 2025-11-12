const bcrypt = require('bcryptjs');
const { getDB } = require('../config/database');

class User {
  static async create({ username, password, displayName, avatar = null, theme = 'dark-purple', notifications = true }) {
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO users (username, password, displayName, avatar, theme, notifications, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(username.toLowerCase().trim(), hashedPassword, displayName, avatar, theme, notifications ? 1 : 0, now, now);
    
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (user) {
      return this._formatUser(user);
    }
    return null;
  }

  static findOne({ username }) {
    const db = getDB();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.toLowerCase().trim());
    
    if (user) {
      return this._formatUser(user);
    }
    return null;
  }

  static findByIdAndUpdate(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    fields.push('updatedAt = ?');
    values.push(Date.now());
    values.push(id);
    
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    return this.findById(id);
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  static _formatUser(user) {
    if (!user) return null;
    
    return {
      _id: user.id,
      id: user.id,
      username: user.username,
      password: user.password,
      displayName: user.displayName,
      partnerId: user.partnerId,
      avatar: user.avatar,
      preferences: {
        theme: user.theme,
        notifications: user.notifications === 1
      },
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      comparePassword: async function(candidatePassword) {
        return User.comparePassword(candidatePassword, this.password);
      }
    };
  }

  static getPartner(userId) {
    const db = getDB();
    const user = db.prepare('SELECT partnerId FROM users WHERE id = ?').get(userId);
    
    if (user && user.partnerId) {
      const partner = db.prepare('SELECT id, username, displayName FROM users WHERE id = ?').get(user.partnerId);
      if (partner) {
        return {
          _id: partner.id,
          id: partner.id,
          username: partner.username,
          displayName: partner.displayName
        };
      }
    }
    return null;
  }
}

module.exports = User;
