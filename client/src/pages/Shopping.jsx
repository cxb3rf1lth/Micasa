import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiCheck, FiEdit } from 'react-icons/fi';
import { shoppingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socket';
import '../styles/Shopping.css';

function Shopping() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    item: '',
    quantity: '1',
    category: 'groceries',
    priority: 'medium',
    notes: ''
  });
  const { getHouseholdId } = useAuth();

  useEffect(() => {
    fetchItems();
    
    // Socket listeners
    socketService.on('shopping-updated', handleSocketUpdate);
    
    return () => {
      socketService.off('shopping-updated', handleSocketUpdate);
    };
  }, []);

  const handleSocketUpdate = () => {
    fetchItems();
  };

  const fetchItems = async () => {
    try {
      const response = await shoppingAPI.getAll();
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await shoppingAPI.update(editingItem._id, formData);
      } else {
        await shoppingAPI.create(formData);
      }
      
      socketService.emitUpdate('shopping-updated', { householdId: getHouseholdId() });
      
      setShowModal(false);
      setEditingItem(null);
      setFormData({ item: '', quantity: '1', category: 'groceries', priority: 'medium', notes: '' });
      fetchItems();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleTogglePurchased = async (item) => {
    try {
      await shoppingAPI.update(item._id, { isPurchased: !item.isPurchased });
      socketService.emitUpdate('shopping-updated', { householdId: getHouseholdId() });
      fetchItems();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await shoppingAPI.delete(id);
      socketService.emitUpdate('shopping-updated', { householdId: getHouseholdId() });
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      item: item.item,
      quantity: item.quantity,
      category: item.category,
      priority: item.priority,
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const pendingItems = items.filter(i => !i.isPurchased);
  const purchasedItems = items.filter(i => i.isPurchased);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="shopping-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping List</h1>
          <p className="page-subtitle">
            {pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''} to buy
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Item
        </button>
      </div>

      <div className="shopping-sections">
        <section className="shopping-section">
          <h2 className="section-title">To Buy ({pendingItems.length})</h2>
          <div className="shopping-grid">
            <AnimatePresence>
              {pendingItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="shopping-item"
                >
                  <div className="item-header">
                    <h3 className="item-title">{item.item}</h3>
                    <span className={`badge badge-${item.priority}`}>
                      {item.priority}
                    </span>
                  </div>
                  
                  <div className="item-details">
                    <span className="item-quantity">Qty: {item.quantity}</span>
                    <span className="item-category">{item.category}</span>
                  </div>

                  {item.notes && (
                    <p className="item-notes">{item.notes}</p>
                  )}

                  <div className="item-meta">
                    <span className="item-author">
                      Added by {item.createdBy?.displayName}
                    </span>
                  </div>

                  <div className="item-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleTogglePurchased(item)}
                    >
                      <FiCheck /> Mark Purchased
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {pendingItems.length === 0 && (
            <div className="empty-state">
              <p>No items to buy! 🎉</p>
            </div>
          )}
        </section>

        {purchasedItems.length > 0 && (
          <section className="shopping-section">
            <h2 className="section-title">Purchased ({purchasedItems.length})</h2>
            <div className="shopping-grid">
              {purchasedItems.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  className="shopping-item purchased"
                >
                  <div className="item-header">
                    <h3 className="item-title">{item.item}</h3>
                  </div>
                  <div className="item-meta">
                    <span className="item-author">
                      Purchased by {item.purchasedBy?.displayName}
                    </span>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleTogglePurchased(item)}
                    >
                      Undo
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowModal(false);
              setEditingItem(null);
              setFormData({ item: '', quantity: '1', category: 'groceries', priority: 'medium', notes: '' });
            }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="modal-title">
                {editingItem ? 'Edit Item' : 'Add Shopping Item'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    placeholder="e.g., Milk, Bread"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="1"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="groceries">Groceries</option>
                      <option value="household">Household</option>
                      <option value="personal">Personal</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      setFormData({ item: '', quantity: '1', category: 'groceries', priority: 'medium', notes: '' });
                    }}
                  >
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

export default Shopping;
