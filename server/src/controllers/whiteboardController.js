const WhiteboardNote = require('../models/WhiteboardNote');
const { getHouseholdId, verifyHouseholdAccess, sendError, emitSocketEvent } = require('../utils/controllerHelpers');

// Custom implementation for whiteboard since it uses different method names
const getWhiteboardNotes = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const notes = WhiteboardNote.findByHousehold(householdId);
    res.json(notes);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const createWhiteboardNote = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);

    const noteData = {
      ...req.body,
      householdId,
      createdBy: req.user._id
    };

    const note = await WhiteboardNote.create(noteData);

    emitSocketEvent(req, householdId, 'whiteboard-updated', {
      action: 'create',
      note
    });

    res.status(201).json(note);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const updateWhiteboardNote = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { id } = req.params;

    // Verify note belongs to household
    const existingNote = WhiteboardNote.findById(id);
    if (!verifyHouseholdAccess(existingNote, householdId)) {
      return sendError(res, 404, 'Note not found');
    }

    const note = WhiteboardNote.update(id, req.body);

    if (!note) {
      return sendError(res, 404, 'Note not found');
    }

    emitSocketEvent(req, householdId, 'whiteboard-updated', {
      action: 'update',
      note
    });

    res.json(note);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const deleteWhiteboardNote = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { id } = req.params;

    // Verify note belongs to household
    const existingNote = WhiteboardNote.findById(id);
    if (!verifyHouseholdAccess(existingNote, householdId)) {
      return sendError(res, 404, 'Note not found');
    }

    const deleted = WhiteboardNote.delete(id);

    if (!deleted) {
      return sendError(res, 404, 'Note not found');
    }

    emitSocketEvent(req, householdId, 'whiteboard-updated', {
      action: 'delete',
      id
    });

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

module.exports = {
  getWhiteboardNotes,
  createWhiteboardNote,
  updateWhiteboardNote,
  deleteWhiteboardNote
};
