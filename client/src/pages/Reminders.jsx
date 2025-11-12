import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { remindersAPI } from '../services/api';
import { format } from 'date-fns';
import '../styles/Shopping.css';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await remindersAPI.getAll();
      setReminders(response.data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (reminder) => {
    try {
      await remindersAPI.update(reminder._id, { isCompleted: !reminder.isCompleted });
      fetchReminders();
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await remindersAPI.delete(id);
      fetchReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="shopping-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reminders</h1>
          <p className="page-subtitle">{activeReminders.length} active reminder{activeReminders.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="shopping-sections">
        <section className="shopping-section">
          <h2 className="section-title">Active Reminders ({activeReminders.length})</h2>
          <div className="shopping-grid">
            {activeReminders.map((reminder) => (
              <motion.div key={reminder._id} className="shopping-item" layout>
                <div className="item-header">
                  <h3 className="item-title">{reminder.title}</h3>
                  <span className={`badge badge-${reminder.priority}`}>{reminder.priority}</span>
                </div>
                
                {reminder.description && <p className="item-notes">{reminder.description}</p>}
                
                <div className="item-details">
                  <span className="item-category">{reminder.category}</span>
                  <span>🔔 {format(new Date(reminder.reminderDate), 'MMM dd, yyyy')}</span>
                </div>

                <div className="item-meta">
                  Created by {reminder.createdBy?.displayName}
                </div>

                <div className="item-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => handleToggleComplete(reminder)}>
                    <FiCheck /> Complete
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(reminder._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {activeReminders.length === 0 && <div className="empty-state"><p>No active reminders</p></div>}
        </section>

        {completedReminders.length > 0 && (
          <section className="shopping-section">
            <h2 className="section-title">Completed ({completedReminders.length})</h2>
            <div className="shopping-grid">
              {completedReminders.map((reminder) => (
                <motion.div key={reminder._id} className="shopping-item purchased" layout>
                  <div className="item-header">
                    <h3 className="item-title">{reminder.title}</h3>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => handleToggleComplete(reminder)}>Undo</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(reminder._id)}><FiTrash2 /></button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Reminders;
