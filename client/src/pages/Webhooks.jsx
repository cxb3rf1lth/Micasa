import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { webhooksAPI } from '../services/api';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaEdit } from 'react-icons/fa';
import '../styles/Webhooks.css';

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [],
    isActive: true,
    secret: '',
  });
  const [loading, setLoading] = useState(true);

  const availableEvents = [
    { value: '*', label: 'All Events' },
    { value: 'shopping-updated', label: 'Shopping Updates' },
    { value: 'chore-updated', label: 'Chore Updates' },
    { value: 'appointment-updated', label: 'Appointment Updates' },
    { value: 'todo-updated', label: 'Todo Updates' },
    { value: 'reminder-updated', label: 'Reminder Updates' },
    { value: 'whiteboard-updated', label: 'Whiteboard Updates' },
    { value: 'vision-board-updated', label: 'Vision Board Updates' },
    { value: 'message-received', label: 'New Messages' },
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await webhooksAPI.getAll();
      setWebhooks(response.data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingWebhook) {
        await webhooksAPI.update(editingWebhook.id, newWebhook);
        setEditingWebhook(null);
      } else {
        await webhooksAPI.create(newWebhook);
      }
      setNewWebhook({ name: '', url: '', events: [], isActive: true, secret: '' });
      setShowForm(false);
      fetchWebhooks();
    } catch (error) {
      console.error('Error saving webhook:', error);
    }
  };

  const handleEdit = (webhook) => {
    setEditingWebhook(webhook);
    setNewWebhook({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
      secret: webhook.secret || '',
    });
    setShowForm(true);
  };

  const handleToggleActive = async (webhook) => {
    try {
      await webhooksAPI.update(webhook.id, { isActive: !webhook.isActive });
      fetchWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this webhook?')) {
      try {
        await webhooksAPI.delete(id);
        fetchWebhooks();
      } catch (error) {
        console.error('Error deleting webhook:', error);
      }
    }
  };

  const handleEventToggle = (eventValue) => {
    setNewWebhook(prev => {
      const events = prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue];
      return { ...prev, events };
    });
  };

  if (loading) {
    return <div className="loading">Loading webhooks...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="webhooks-container"
    >
      <div className="webhooks-header">
        <h1>🔔 Webhooks</h1>
        <p>Configure external notifications and alerts</p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditingWebhook(null); }}>
          <FaPlus /> Add Webhook
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="webhook-form-container"
          >
            <form onSubmit={handleCreate} className="webhook-form">
              <h3>{editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}</h3>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                  placeholder="e.g., Slack Notifications"
                  required
                />
              </div>

              <div className="form-group">
                <label>Webhook URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://hooks.slack.com/services/..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Secret (optional)</label>
                <input
                  type="text"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  placeholder="Optional secret for request signing"
                />
              </div>

              <div className="form-group">
                <label>Events to Subscribe</label>
                <div className="events-list">
                  {availableEvents.map(event => (
                    <label key={event.value} className="event-checkbox">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event.value)}
                        onChange={() => handleEventToggle(event.value)}
                      />
                      <span>{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={newWebhook.isActive}
                    onChange={(e) => setNewWebhook({ ...newWebhook, isActive: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingWebhook ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowForm(false);
                  setEditingWebhook(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="webhooks-list">
        {webhooks.length === 0 ? (
          <div className="empty-state">
            <p>No webhooks configured. Add one to get started!</p>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`webhook-item ${webhook.isActive ? 'active' : 'inactive'}`}
            >
              <div className="webhook-header">
                <h3>{webhook.name}</h3>
                <div className="webhook-actions">
                  <button onClick={() => handleToggleActive(webhook)}>
                    {webhook.isActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                  <button onClick={() => handleEdit(webhook)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(webhook.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="webhook-details">
                <div className="webhook-url">
                  <strong>URL:</strong> {webhook.url}
                </div>
                <div className="webhook-events">
                  <strong>Events:</strong>
                  <div className="event-tags">
                    {webhook.events.map(event => (
                      <span key={event} className="event-tag">
                        {availableEvents.find(e => e.value === event)?.label || event}
                      </span>
                    ))}
                  </div>
                </div>
                {webhook.secret && (
                  <div className="webhook-secret">
                    <strong>Secret:</strong> <span className="secret-value">***********</span>
                  </div>
                )}
              </div>

              <div className="webhook-footer">
                <span>Created by {webhook.createdBy.displayName}</span>
                <span className={`status-badge ${webhook.isActive ? 'active' : 'inactive'}`}>
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Webhooks;
