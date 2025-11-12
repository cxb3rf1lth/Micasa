const ShoppingNote = require('../models/ShoppingNote');

// Helper function to get household ID
const getHouseholdId = (user) => {
  return user.partnerId ? [user._id.toString(), user.partnerId.toString()].sort().join('-') : user._id.toString();
};

// @desc    Get all shopping notes
// @route   GET /api/shopping
// @access  Private
const getShoppingNotes = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const notes = await ShoppingNote.find({ householdId })
      .populate('createdBy', 'displayName username')
      .populate('purchasedBy', 'displayName username')
      .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    console.error('Get shopping notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create shopping note
// @route   POST /api/shopping
// @access  Private
const createShoppingNote = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { item, quantity, category, priority, notes } = req.body;

    const shoppingNote = await ShoppingNote.create({
      householdId,
      item,
      quantity,
      category,
      priority,
      notes,
      createdBy: req.user._id
    });

    const populatedNote = await ShoppingNote.findById(shoppingNote._id)
      .populate('createdBy', 'displayName username');

    res.status(201).json(populatedNote);
  } catch (error) {
    console.error('Create shopping note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update shopping note
// @route   PUT /api/shopping/:id
// @access  Private
const updateShoppingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const note = await ShoppingNote.findOne({ _id: id, householdId });
    
    if (!note) {
      return res.status(404).json({ message: 'Shopping note not found' });
    }

    const updateData = { ...req.body };
    
    // If marking as purchased
    if (req.body.isPurchased && !note.isPurchased) {
      updateData.purchasedBy = req.user._id;
      updateData.purchasedAt = new Date();
    }

    const updatedNote = await ShoppingNote.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'displayName username')
      .populate('purchasedBy', 'displayName username');

    res.json(updatedNote);
  } catch (error) {
    console.error('Update shopping note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete shopping note
// @route   DELETE /api/shopping/:id
// @access  Private
const deleteShoppingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const note = await ShoppingNote.findOneAndDelete({ _id: id, householdId });
    
    if (!note) {
      return res.status(404).json({ message: 'Shopping note not found' });
    }

    res.json({ message: 'Shopping note deleted' });
  } catch (error) {
    console.error('Delete shopping note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getShoppingNotes,
  createShoppingNote,
  updateShoppingNote,
  deleteShoppingNote
};
