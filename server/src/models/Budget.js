const { getDB } = require('../config/database');

class Budget {
  static create(data) {
    const db = getDB();
    const now = Date.now();

    const result = db.prepare(`
      INSERT INTO budgets (
        householdId, category, amount, spent, period,
        startDate, endDate, createdBy, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.householdId,
      data.category,
      data.amount || 0,
      data.spent || 0,
      data.period || 'monthly',
      data.startDate || now,
      data.endDate || null,
      data.createdBy,
      now,
      now
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const db = getDB();
    const budget = db.prepare(`
      SELECT b.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM budgets b
      LEFT JOIN users u ON b.createdBy = u.id
      WHERE b.id = ?
    `).get(id);

    return budget ? this._formatBudget(budget) : null;
  }

  static findByHousehold(householdId) {
    const db = getDB();
    const budgets = db.prepare(`
      SELECT b.*, u.username as createdByUsername, u.displayName as createdByDisplayName
      FROM budgets b
      LEFT JOIN users u ON b.createdBy = u.id
      WHERE b.householdId = ?
      ORDER BY b.createdAt DESC
    `).all(householdId);

    return budgets.map(budget => this._formatBudget(budget));
  }

  static update(id, updates) {
    const db = getDB();
    const fields = [];
    const values = [];

    const allowedFields = ['category', 'amount', 'spent', 'period', 'startDate', 'endDate'];

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

    db.prepare(`UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`).run(...values);

    return this.findById(id);
  }

  static addExpense(id, amount) {
    const db = getDB();
    const budget = this.findById(id);

    if (!budget) return null;

    const newSpent = budget.spent + parseFloat(amount);

    db.prepare(`
      UPDATE budgets
      SET spent = ?, updatedAt = ?
      WHERE id = ?
    `).run(newSpent, Date.now(), id);

    return this.findById(id);
  }

  static delete(id) {
    const db = getDB();
    const result = db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static _formatBudget(budget) {
    if (!budget) return null;

    const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;

    return {
      _id: budget.id,
      id: budget.id,
      householdId: budget.householdId,
      category: budget.category,
      amount: parseFloat(budget.amount),
      spent: parseFloat(budget.spent),
      remaining: parseFloat(budget.amount) - parseFloat(budget.spent),
      percentage: Math.min(percentage, 100),
      period: budget.period,
      startDate: new Date(budget.startDate),
      endDate: budget.endDate ? new Date(budget.endDate) : null,
      createdBy: {
        id: budget.createdBy,
        username: budget.createdByUsername,
        displayName: budget.createdByDisplayName
      },
      createdAt: new Date(budget.createdAt),
      updatedAt: new Date(budget.updatedAt)
    };
  }
}

module.exports = Budget;
