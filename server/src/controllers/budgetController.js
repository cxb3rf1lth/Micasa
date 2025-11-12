const Budget = require('../models/Budget');

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.user.partnerId;
    const householdId = partnerId
      ? [userId, partnerId].sort().join('-')
      : `household_${userId}`;

    const budgets = Budget.findByHousehold(householdId);
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.user.partnerId;
    const householdId = partnerId
      ? [userId, partnerId].sort().join('-')
      : `household_${userId}`;

    const budgetData = {
      ...req.body,
      householdId,
      createdBy: userId
    };

    const budget = Budget.create(budgetData);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('budget-updated', { budget, householdId });
    }

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = Budget.update(id, req.body);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(budget.householdId).emit('budget-updated', {
        budget,
        householdId: budget.householdId
      });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const addExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const budget = Budget.addExpense(id, amount);

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(budget.householdId).emit('budget-updated', {
        budget,
        householdId: budget.householdId
      });
    }

    res.json(budget);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = Budget.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  addExpense,
  deleteBudget
};
