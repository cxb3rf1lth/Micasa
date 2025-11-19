import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { whiteboardAPI, remindersAPI } from '../services/api';
import socketService from '../services/socket';
import { FaPlus, FaTrash, FaPalette, FaBell } from 'react-icons/fa';
import '../styles/Whiteboard.css';

const Whiteboard = () => {
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'note',
    color: '#9D8DF1',
    fontSize: 16,
  });
  const [loading, setLoading] = useState(true);

  const colors = ['#9D8DF1', '#FF6B9D', '#4ECDC4', '#FFD93D', '#6BCF7F', '#FF6B6B'];
  const noteTypes = ['note', 'idea', 'love-letter', 'reminder'];

  useEffect(() => {
    fetchNotes();
    
    const socket = socketService.connect();
    const householdId = `household_${localStorage.getItem('userId')}`;
    socketService.joinHousehold(householdId);

    const handleWhiteboardUpdate = (data) => {
      if (data.action === 'create') {
        setNotes(prev => [data.note, ...prev]);
      } else if (data.action === 'update') {
        setNotes(prev => prev.map(note => 
          note.id === data.note.id ? data.note : note
        ));
      } else if (data.action === 'delete') {
        setNotes(prev => prev.filter(note => note.id !== data.id));
      }
    };

    socketService.on('whiteboard-updated', handleWhiteboardUpdate);

    return () => {
      socketService.off('whiteboard-updated', handleWhiteboardUpdate);
    };
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await whiteboardAPI.getAll();
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching whiteboard notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await whiteboardAPI.create(newNote);
      setNewNote({ content: '', type: 'note', color: '#9D8DF1', fontSize: 16 });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await whiteboardAPI.delete(id);
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleConvertToReminder = async (note) => {
    try {
      // Create a reminder from the whiteboard note
      const reminderData = {
        title: `Reminder: ${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}`,
        description: note.content,
        category: 'Personal',
        reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default to tomorrow
        isRecurring: false,
        notifyBoth: true,
        priority: 'Medium'
      };

      await remindersAPI.create(reminderData);
      alert('Successfully converted to reminder!');

      // Optionally delete the whiteboard note after conversion
      if (window.confirm('Would you like to delete this whiteboard note?')) {
        await whiteboardAPI.delete(note.id);
      }
    } catch (error) {
      console.error('Error converting to reminder:', error);
      alert('Failed to convert to reminder');
    }
  };

  if (loading) {
    return <div className="loading">Loading whiteboard...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="whiteboard-container"
    >
      <div className="whiteboard-header">
        <h1>🎨 Whiteboard</h1>
        <p>A creative space for notes, ideas, and love letters</p>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> Add Note
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="note-form-container"
          >
            <form onSubmit={handleCreate} className="note-form">
              <div className="form-group">
                <label>Note Type</label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                >
                  {noteTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note, idea, or love letter..."
                  rows={5}
                  required
                />
              </div>

              <div className="form-group">
                <label><FaPalette /> Color</label>
                <div className="color-picker">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newNote.color === color ? 'active' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewNote({ ...newNote, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">Create Note</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="whiteboard-grid">
        {notes.length === 0 ? (
          <div className="empty-state">
            <p>No notes yet. Start by adding one!</p>
          </div>
        ) : (
          notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="whiteboard-note"
              style={{ 
                backgroundColor: note.color,
                fontSize: `${note.fontSize}px`
              }}
            >
              <div className="note-header">
                <span className="note-type">{note.type}</span>
                <div className="note-actions">
                  {note.type === 'reminder' && (
                    <button
                      className="convert-btn"
                      onClick={() => handleConvertToReminder(note)}
                      title="Convert to Reminder"
                    >
                      <FaBell />
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="note-content">{note.content}</div>
              <div className="note-footer">
                <span className="note-author">- {note.createdBy.displayName}</span>
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default Whiteboard;
