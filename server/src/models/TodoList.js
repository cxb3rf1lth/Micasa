const { getDB } = require('../config/database');

class TodoList {
  static create(data) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO todo_lists (
        householdId, title, description, isShared, owner, category,
        priority, dueDate, color, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.title,
      data.description || '',
      data.isShared !== false ? 1 : 0,
      data.owner,
      data.category || 'household',
      data.priority || 'medium',
      data.dueDate ? (data.dueDate instanceof Date ? data.dueDate.getTime() : new Date(data.dueDate).getTime()) : null,
      data.color || '#9D8DF1',
      now,
      now
    );
    
    const todoListId = result.lastInsertRowid;
    
    // Add shared users
    if (data.sharedWith && data.sharedWith.length > 0) {
      const insertShared = db.prepare('INSERT INTO todo_list_shared_with (todoListId, userId) VALUES (?, ?)');
      data.sharedWith.forEach(userId => {
        insertShared.run(todoListId, userId);
      });
    }
    
    return this.findById(todoListId);
  }

  static findById(id) {
    const db = getDB();
    const todoList = db.prepare('SELECT * FROM todo_lists WHERE id = ?').get(id);
    
    if (!todoList) return null;
    
    // Get shared users
    const sharedWith = db.prepare('SELECT userId FROM todo_list_shared_with WHERE todoListId = ?').all(id);
    
    // Get items
    const items = db.prepare('SELECT * FROM todo_items WHERE todoListId = ? ORDER BY createdAt ASC').all(id);
    
    return this._formatTodoList(todoList, sharedWith.map(s => s.userId), items);
  }

  static find(query = {}) {
    const db = getDB();
    let sql = 'SELECT * FROM todo_lists WHERE 1=1';
    const params = [];
    
    if (query.householdId) {
      sql += ' AND householdId = ?';
      params.push(query.householdId);
    }
    
    sql += ' ORDER BY createdAt DESC';
    
    const todoLists = db.prepare(sql).all(...params);
    
    return todoLists.map(todoList => {
      const sharedWith = db.prepare('SELECT userId FROM todo_list_shared_with WHERE todoListId = ?').all(todoList.id);
      const items = db.prepare('SELECT * FROM todo_items WHERE todoListId = ? ORDER BY createdAt ASC').all(todoList.id);
      return this._formatTodoList(todoList, sharedWith.map(s => s.userId), items);
    });
  }

  static findByIdAndUpdate(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== '_id' && key !== 'sharedWith' && key !== 'items') {
        if (key === 'isShared') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'dueDate') {
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
    
    if (fields.length > 0) {
      fields.push('updatedAt = ?');
      values.push(Date.now());
      values.push(id);
      
      db.prepare(`UPDATE todo_lists SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    }
    
    // Update shared users if provided
    if (updates.sharedWith) {
      db.prepare('DELETE FROM todo_list_shared_with WHERE todoListId = ?').run(id);
      const insertShared = db.prepare('INSERT INTO todo_list_shared_with (todoListId, userId) VALUES (?, ?)');
      updates.sharedWith.forEach(userId => {
        insertShared.run(id, userId);
      });
    }
    
    return this.findById(id);
  }

  static findByIdAndDelete(id) {
    const db = getDB();
    const todoList = this.findById(id);
    db.prepare('DELETE FROM todo_list_shared_with WHERE todoListId = ?').run(id);
    db.prepare('DELETE FROM todo_items WHERE todoListId = ?').run(id);
    db.prepare('DELETE FROM todo_lists WHERE id = ?').run(id);
    return todoList;
  }

  static addItem(todoListId, itemData) {
    const db = getDB();
    const now = Date.now();
    
    const result = db.prepare(`
      INSERT INTO todo_items (todoListId, text, isCompleted, completedAt, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      todoListId,
      itemData.text,
      itemData.isCompleted ? 1 : 0,
      itemData.completedAt ? (itemData.completedAt instanceof Date ? itemData.completedAt.getTime() : new Date(itemData.completedAt).getTime()) : null,
      now,
      now
    );
    
    // Update parent todo list's updatedAt
    db.prepare('UPDATE todo_lists SET updatedAt = ? WHERE id = ?').run(now, todoListId);
    
    return this.findById(todoListId);
  }

  static updateItem(todoListId, itemId, updates) {
    const db = getDB();
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && key !== '_id') {
        if (key === 'isCompleted') {
          fields.push(`${key} = ?`);
          values.push(updates[key] ? 1 : 0);
        } else if (key === 'completedAt') {
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
    
    const now = Date.now();
    fields.push('updatedAt = ?');
    values.push(now);
    values.push(itemId);
    
    db.prepare(`UPDATE todo_items SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    
    // Update parent todo list's updatedAt
    db.prepare('UPDATE todo_lists SET updatedAt = ? WHERE id = ?').run(now, todoListId);
    
    return this.findById(todoListId);
  }

  static deleteItem(todoListId, itemId) {
    const db = getDB();
    db.prepare('DELETE FROM todo_items WHERE id = ?').run(itemId);
    
    // Update parent todo list's updatedAt
    db.prepare('UPDATE todo_lists SET updatedAt = ? WHERE id = ?').run(Date.now(), todoListId);
    
    return this.findById(todoListId);
  }

  static _formatTodoList(todoList, sharedWith = [], items = []) {
    if (!todoList) return null;
    
    return {
      _id: todoList.id,
      id: todoList.id,
      householdId: todoList.householdId,
      title: todoList.title,
      description: todoList.description,
      items: items.map(item => ({
        _id: item.id,
        id: item.id,
        text: item.text,
        isCompleted: item.isCompleted === 1,
        completedAt: item.completedAt ? new Date(item.completedAt) : null,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt)
      })),
      isShared: todoList.isShared === 1,
      owner: todoList.owner,
      sharedWith: sharedWith,
      category: todoList.category,
      priority: todoList.priority,
      dueDate: todoList.dueDate ? new Date(todoList.dueDate) : null,
      color: todoList.color,
      createdAt: new Date(todoList.createdAt),
      updatedAt: new Date(todoList.updatedAt)
    };
  }
}

module.exports = TodoList;
