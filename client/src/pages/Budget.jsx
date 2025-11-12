import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import { FiDollarSign, FiPlus, FiTrendingUp, FiTrendingDown, FiPieChart, FiEdit2, FiTrash2 } from 'react-icons/fi';
import '../styles/Budget.css';

function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('/api/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBudget) {
        await axios.put(`/api/budgets/${editingBudget.id}`, newBudget);
      } else {
        await axios.post('/api/budgets', {
          ...newBudget,
          amount: parseFloat(newBudget.amount),
          startDate: Date.now()
        });
      }

      setNewBudget({ category: '', amount: '', period: 'monthly' });
      setEditingBudget(null);
      setShowModal(false);
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setNewBudget({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      await axios.delete(`/api/budgets/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, b) => sum + b.spent, 0);
  };

  const getTotalRemaining = () => {
    return getTotalBudget() - getTotalSpent();
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'var(--error)';
    if (percentage >= 70) return 'var(--warning)';
    return 'var(--success)';
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="budget-page">
        <div className="page-header">
          <div>
            <h1 className="page-title gradient-text">Budget Tracker</h1>
            <p className="page-subtitle">Manage your household finances</p>
          </div>
          <button
            className="btn btn-premium"
            onClick={() => {
              setEditingBudget(null);
              setNewBudget({ category: '', amount: '', period: 'monthly' });
              setShowModal(true);
            }}
          >
            <FiPlus /> Add Budget
          </button>
        </div>

        {/* Summary Cards */}
        <div className="budget-summary">
          <motion.div
            className="summary-card card-glass"
            whileHover={{ scale: 1.02 }}
          >
            <div className="summary-icon" style={{ background: 'rgba(157, 141, 241, 0.2)' }}>
              <FiDollarSign style={{ color: 'var(--purple-400)' }} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Total Budget</p>
              <h3 className="summary-value">${getTotalBudget().toFixed(2)}</h3>
            </div>
          </motion.div>

          <motion.div
            className="summary-card card-glass"
            whileHover={{ scale: 1.02 }}
          >
            <div className="summary-icon" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
              <FiTrendingDown style={{ color: 'var(--error)' }} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Total Spent</p>
              <h3 className="summary-value">${getTotalSpent().toFixed(2)}</h3>
            </div>
          </motion.div>

          <motion.div
            className="summary-card card-glass"
            whileHover={{ scale: 1.02 }}
          >
            <div className="summary-icon" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <FiTrendingUp style={{ color: 'var(--success)' }} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Remaining</p>
              <h3 className="summary-value">${getTotalRemaining().toFixed(2)}</h3>
            </div>
          </motion.div>

          <motion.div
            className="summary-card card-glass"
            whileHover={{ scale: 1.02 }}
          >
            <div className="summary-icon" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
              <FiPieChart style={{ color: 'var(--info)' }} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Categories</p>
              <h3 className="summary-value">{budgets.length}</h3>
            </div>
          </motion.div>
        </div>

        {/* Budget List */}
        <div className="budget-grid">
          {budgets.map((budget, index) => (
            <motion.div
              key={budget.id}
              className="budget-card card-premium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="budget-header">
                <h3 className="budget-category">{budget.category}</h3>
                <div className="budget-actions">
                  <button
                    className="btn-icon tooltip"
                    data-tooltip="Edit"
                    onClick={() => handleEdit(budget)}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn-icon tooltip"
                    data-tooltip="Delete"
                    onClick={() => handleDelete(budget.id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="budget-amounts">
                <div className="amount-item">
                  <span className="amount-label">Budget</span>
                  <span className="amount-value">${budget.amount.toFixed(2)}</span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Spent</span>
                  <span className="amount-value" style={{ color: getStatusColor(budget.percentage) }}>
                    ${budget.spent.toFixed(2)}
                  </span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Remaining</span>
                  <span className="amount-value" style={{ color: 'var(--success)' }}>
                    ${budget.remaining.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="budget-progress">
                <div className="progress-header">
                  <span className="progress-label">{budget.percentage.toFixed(1)}% Used</span>
                  <span className="progress-period">{budget.period}</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{
                      background: `linear-gradient(90deg, ${getStatusColor(budget.percentage)}, ${getStatusColor(budget.percentage)}dd)`
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {budgets.length === 0 && (
            <div className="empty-state">
              <FiDollarSign className="empty-icon" />
              <h3>No budgets yet</h3>
              <p>Create your first budget to start tracking your finances</p>
              <button className="btn btn-premium" onClick={() => setShowModal(true)}>
                <FiPlus /> Create Budget
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h2>
              <form onSubmit={handleSubmit} className="budget-form">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                    placeholder="e.g., Groceries, Entertainment, Utilities"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Period</label>
                  <select
                    className="form-select"
                    value={newBudget.period}
                    onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value })}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-premium">
                    {editingBudget ? 'Update' : 'Create'} Budget
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Budget;
