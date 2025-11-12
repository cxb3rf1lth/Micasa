import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheck } from 'react-icons/fi';
import { todosAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Shopping.css';

function Todos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'household',
    priority: 'medium',
    isShared: true
  });
  const { user, getHouseholdId } = useAuth();

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await todosAPI.getAll();
      setTodos(response.data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await todosAPI.create({
        ...formData,
        sharedWith: user.partnerId ? [user.partnerId] : []
      });
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'household', priority: 'medium', isShared: true });
      fetchTodos();
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  const handleAddItem = async (todoId) => {
    const text = prompt('Enter new task:');
    if (!text) return;
    try {
      await todosAPI.addItem(todoId, text);
      fetchTodos();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleToggleItem = async (todoId, itemId, isCompleted) => {
    try {
      await todosAPI.updateItem(todoId, itemId, { isCompleted: !isCompleted });
      fetchTodos();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this to-do list?')) return;
    try {
      await todosAPI.delete(id);
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="shopping-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">To-Do Lists</h1>
          <p className="page-subtitle">{todos.length} list{todos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> New List
        </button>
      </div>

      <div className="shopping-sections">
        <section className="shopping-section">
          <div className="shopping-grid">
            {todos.map((todo) => (
              <motion.div key={todo._id} className="shopping-item" layout>
                <div className="item-header">
                  <h3 className="item-title">{todo.title}</h3>
                  <span className={`badge badge-${todo.priority}`}>{todo.priority}</span>
                </div>
                
                {todo.description && <p className="item-notes">{todo.description}</p>}

                <div style={{ margin: '1rem 0' }}>
                  {todo.items.map((item) => (
                    <div key={item._id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      padding: '0.5rem',
                      background: 'var(--grey-900)',
                      borderRadius: '6px',
                      marginBottom: '0.5rem'
                    }}>
                      <button
                        onClick={() => handleToggleItem(todo._id, item._id, item.isCompleted)}
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '2px solid var(--purple-600)',
                          borderRadius: '4px',
                          background: item.isCompleted ? 'var(--purple-600)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {item.isCompleted && <FiCheck size={14} />}
                      </button>
                      <span style={{ 
                        flex: 1, 
                        textDecoration: item.isCompleted ? 'line-through' : 'none',
                        opacity: item.isCompleted ? 0.6 : 1,
                        color: 'var(--grey-300)'
                      }}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="item-actions">
                  <button className="btn btn-sm btn-secondary" onClick={() => handleAddItem(todo._id)}>
                    <FiPlus /> Add Task
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(todo._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {todos.length === 0 && <div className="empty-state"><p>No to-do lists yet</p></div>}
        </section>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Create To-Do List</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className="form-input" value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Weekend Tasks" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..." />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                      <option value="personal">Personal</option>
                      <option value="household">Household</option>
                      <option value="work">Work</option>
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

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">Create List</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Todos;
