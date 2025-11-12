import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheck, FiEdit } from 'react-icons/fi';
import { choresAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socket';
import { format } from 'date-fns';
import '../styles/Shopping.css';

function Chores() {
  const [chores, setChores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    frequency: 'weekly',
    dueDate: '',
    priority: 'medium',
    category: 'other',
    estimatedTime: 30
  });
  const { user, getHouseholdId } = useAuth();

  useEffect(() => {
    fetchChores();
    socketService.on('chore-updated', handleSocketUpdate);
    return () => socketService.off('chore-updated', handleSocketUpdate);
  }, []);

  const handleSocketUpdate = () => fetchChores();

  const fetchChores = async () => {
    try {
      const response = await choresAPI.getAll();
      setChores(response.data);
    } catch (error) {
      console.error('Failed to fetch chores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingChore) {
        await choresAPI.update(editingChore._id, formData);
      } else {
        await choresAPI.create(formData);
      }
      socketService.emitUpdate('chore-updated', { householdId: getHouseholdId() });
      setShowModal(false);
      setEditingChore(null);
      resetForm();
      fetchChores();
    } catch (error) {
      console.error('Failed to save chore:', error);
    }
  };

  const handleToggleComplete = async (chore) => {
    try {
      await choresAPI.update(chore._id, { isCompleted: !chore.isCompleted });
      socketService.emitUpdate('chore-updated', { householdId: getHouseholdId() });
      fetchChores();
    } catch (error) {
      console.error('Failed to update chore:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this chore?')) return;
    try {
      await choresAPI.delete(id);
      socketService.emitUpdate('chore-updated', { householdId: getHouseholdId() });
      fetchChores();
    } catch (error) {
      console.error('Failed to delete chore:', error);
    }
  };

  const handleEdit = (chore) => {
    setEditingChore(chore);
    setFormData({
      title: chore.title,
      description: chore.description,
      assignedTo: chore.assignedTo._id,
      frequency: chore.frequency,
      dueDate: format(new Date(chore.dueDate), 'yyyy-MM-dd'),
      priority: chore.priority,
      category: chore.category,
      estimatedTime: chore.estimatedTime
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: user._id,
      frequency: 'weekly',
      dueDate: '',
      priority: 'medium',
      category: 'other',
      estimatedTime: 30
    });
  };

  const activeChores = chores.filter(c => !c.isCompleted);
  const completedChores = chores.filter(c => c.isCompleted);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="shopping-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Household Chores</h1>
          <p className="page-subtitle">{activeChores.length} chore{activeChores.length !== 1 ? 's' : ''} to complete</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          <FiPlus /> Add Chore
        </button>
      </div>

      <div className="shopping-sections">
        <section className="shopping-section">
          <h2 className="section-title">Active Chores ({activeChores.length})</h2>
          <div className="shopping-grid">
            <AnimatePresence>
              {activeChores.map((chore) => (
                <motion.div
                  key={chore._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="shopping-item"
                >
                  <div className="item-header">
                    <h3 className="item-title">{chore.title}</h3>
                    <span className={`badge badge-${chore.priority}`}>{chore.priority}</span>
                  </div>
                  
                  {chore.description && <p className="item-notes">{chore.description}</p>}
                  
                  <div className="item-details">
                    <span className="item-quantity">Assigned to: {chore.assignedTo?.displayName}</span>
                    <span className="item-category">{chore.category}</span>
                  </div>

                  <div className="item-details">
                    <span>Due: {format(new Date(chore.dueDate), 'MMM dd, yyyy')}</span>
                    <span>{chore.estimatedTime} min</span>
                  </div>

                  <div className="item-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleToggleComplete(chore)}>
                      <FiCheck /> Complete
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(chore)}>
                      <FiEdit />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(chore._id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {activeChores.length === 0 && <div className="empty-state"><p>No active chores! 🎉</p></div>}
        </section>

        {completedChores.length > 0 && (
          <section className="shopping-section">
            <h2 className="section-title">Completed ({completedChores.length})</h2>
            <div className="shopping-grid">
              {completedChores.map((chore) => (
                <motion.div key={chore._id} layout className="shopping-item purchased">
                  <div className="item-header">
                    <h3 className="item-title">{chore.title}</h3>
                  </div>
                  <div className="item-meta">
                    Completed by {chore.completedBy?.displayName}
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleToggleComplete(chore)}>Undo</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(chore._id)}><FiTrash2 /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setShowModal(false); setEditingChore(null); }}>
            <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">{editingChore ? 'Edit Chore' : 'Add Chore'}</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-input" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Clean kitchen" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Details..." />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assign To *</label>
                    <select className="form-select" value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} required>
                      <option value="">Select...</option>
                      <option value={user._id}>{user.displayName} (You)</option>
                      {user.partnerId && <option value={user.partnerId._id}>{user.partnerId.displayName}</option>}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="date" className="form-input" value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="cleaning">Cleaning</option>
                      <option value="cooking">Cooking</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="shopping">Shopping</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select className="form-select" value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="once">Once</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Est. Time (min)</label>
                    <input type="number" className="form-input" value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingChore ? 'Update' : 'Add'} Chore
                  </button>
                  <button type="button" className="btn btn-secondary"
                    onClick={() => { setShowModal(false); setEditingChore(null); }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chores;
