const WhiteboardNote = require('../models/WhiteboardNote');

const getWhiteboardNotes = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    
    const notes = WhiteboardNote.findByHousehold(householdId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching whiteboard notes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createWhiteboardNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    
    const noteData = {
      ...req.body,
      householdId,
      createdBy: userId
    };
    
    const note = await WhiteboardNote.create(noteData);
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('whiteboard-updated', { 
        action: 'create', 
        note,
        householdId 
      });
    }
    
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating whiteboard note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateWhiteboardNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    const { id } = req.params;
    
    const note = WhiteboardNote.update(id, req.body);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('whiteboard-updated', { 
        action: 'update', 
        note,
        householdId 
      });
    }
    
    res.json(note);
  } catch (error) {
    console.error('Error updating whiteboard note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteWhiteboardNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    const { id } = req.params;
    
    const deleted = WhiteboardNote.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('whiteboard-updated', { 
        action: 'delete', 
        id,
        householdId 
      });
    }
    
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting whiteboard note:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWhiteboardNotes,
  createWhiteboardNote,
  updateWhiteboardNote,
  deleteWhiteboardNote
};
