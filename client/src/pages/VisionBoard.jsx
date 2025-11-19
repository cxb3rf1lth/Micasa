import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { visionBoardAPI, appointmentsAPI, todosAPI } from '../services/api';
import socketService from '../services/socket';
import { FaPlus, FaTrash, FaEdit, FaCheckCircle, FaCalendar, FaTasks } from 'react-icons/fa';
import '../styles/VisionBoard.css';

const VisionBoard = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    type: 'goal',
    status: 'planning',
    priority: 'medium',
    targetDate: '',
  });
  const [loading, setLoading] = useState(true);

  const itemTypes = ['goal', 'trip', 'dream', 'project', 'milestone'];
  const statuses = ['planning', 'in-progress', 'completed'];
  const priorities = ['low', 'medium', 'high'];

  useEffect(() => {
    fetchItems();
    
    const socket = socketService.connect();
    const householdId = `household_${localStorage.getItem('userId')}`;
    socketService.joinHousehold(householdId);

    const handleVisionBoardUpdate = (data) => {
      if (data.action === 'create') {
        setItems(prev => [data.item, ...prev]);
      } else if (data.action === 'update') {
        setItems(prev => prev.map(item => 
          item.id === data.item.id ? data.item : item
        ));
      } else if (data.action === 'delete') {
        setItems(prev => prev.filter(item => item.id !== data.id));
      }
    };

    socketService.on('vision-board-updated', handleVisionBoardUpdate);

    return () => {
      socketService.off('vision-board-updated', handleVisionBoardUpdate);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const response = await visionBoardAPI.getAll();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching vision board items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await visionBoardAPI.update(editingItem.id, newItem);
        setEditingItem(null);
      } else {
        await visionBoardAPI.create(newItem);
      }
      setNewItem({ title: '', description: '', type: 'goal', status: 'planning', priority: 'medium', targetDate: '' });
      setShowForm(false);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({
      title: item.title,
      description: item.description,
      type: item.type,
      status: item.status,
      priority: item.priority,
      targetDate: item.targetDate ? new Date(item.targetDate).toISOString().split('T')[0] : '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await visionBoardAPI.delete(id);
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleStatusChange = async (item, newStatus) => {
    try {
      await visionBoardAPI.update(item.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleConvertToAppointment = async (item) => {
    try {
      const appointmentData = {
        title: item.title,
        description: item.description || `Vision Board: ${item.type}`,
        startTime: item.targetDate ? new Date(item.targetDate).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: item.targetDate ? new Date(new Date(item.targetDate).getTime() + 2 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
        location: '',
        attendees: [],
        category: item.type === 'trip' ? 'Social' : 'Personal',
        reminder: true,
        isRecurring: false,
        color: '#9D8DF1'
      };

      await appointmentsAPI.create(appointmentData);
      alert('Successfully created appointment!');
    } catch (error) {
      console.error('Error converting to appointment:', error);
      alert('Failed to create appointment');
    }
  };

  const handleConvertToTodo = async (item) => {
    try {
      const todoData = {
        title: `Action Plan: ${item.title}`,
        description: item.description || '',
        items: [
          { text: 'Research and plan', isCompleted: false },
          { text: 'Set budget and timeline', isCompleted: false },
          { text: 'Take action', isCompleted: false },
          { text: 'Review progress', isCompleted: false }
        ],
        isShared: true,
        category: 'Personal',
        priority: item.priority,
        dueDate: item.targetDate || null,
        color: '#9D8DF1'
      };

      await todosAPI.create(todoData);
      alert('Successfully created action plan!');
    } catch (error) {
      console.error('Error converting to todo:', error);
      alert('Failed to create action plan');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return '#9D8DF1';
      case 'in-progress': return '#FFD93D';
      case 'completed': return '#6BCF7F';
      default: return '#9D8DF1';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#4ECDC4';
      case 'medium': return '#FFD93D';
      case 'high': return '#FF6B6B';
      default: return '#FFD93D';
    }
  };

  if (loading) {
    return <div className="loading">Loading vision board...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="vision-board-container"
    >
      <div className="vision-board-header">
        <h1>✨ Vision Board</h1>
        <p>Plan your dreams, set goals, and track your journey together</p>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditingItem(null); }}>
          <FaPlus /> Add Goal
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="vision-form-container"
          >
            <form onSubmit={handleCreate} className="vision-form">
              <h3>{editingItem ? 'Edit Goal' : 'Create New Goal'}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  >
                    {itemTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newItem.priority}
                    onChange={(e) => setNewItem({ ...newItem, priority: e.target.value })}
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., Trip to Hawaii, Buy a house..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe your goal in detail..."
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newItem.status}
                    onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={newItem.targetDate}
                    onChange={(e) => setNewItem({ ...newItem, targetDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="vision-board-grid">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No goals yet. Start planning your dreams!</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="vision-item"
              style={{ borderColor: getStatusColor(item.status) }}
            >
              <div className="item-header">
                <div className="item-badges">
                  <span className="type-badge">{item.type}</span>
                  <span
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(item.priority) }}
                  >
                    {item.priority}
                  </span>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleEdit(item)} title="Edit"><FaEdit /></button>
                  <button onClick={() => handleDelete(item.id)} title="Delete"><FaTrash /></button>
                </div>
              </div>

              <h3>{item.title}</h3>
              {item.description && <p className="item-description">{item.description}</p>}

              <div className="item-conversion-actions">
                <button
                  className="conversion-btn"
                  onClick={() => handleConvertToAppointment(item)}
                  title="Create Appointment"
                >
                  <FaCalendar /> Schedule
                </button>
                <button
                  className="conversion-btn"
                  onClick={() => handleConvertToTodo(item)}
                  title="Create Action Plan"
                >
                  <FaTasks /> Action Plan
                </button>
              </div>

              <div className="item-footer">
                <div className="status-selector">
                  <label>Status:</label>
                  <select 
                    value={item.status}
                    onChange={(e) => handleStatusChange(item, e.target.value)}
                    style={{ borderColor: getStatusColor(item.status) }}
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                
                {item.targetDate && (
                  <div className="target-date">
                    <span>Target: {new Date(item.targetDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="item-meta">
                <span>Created by {item.createdBy.displayName}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default VisionBoard;
