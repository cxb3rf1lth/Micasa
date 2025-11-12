const Chore = require('../models/Chore');

// Helper function to get household ID
const getHouseholdId = (user) => {
  return user.partnerId ? [user._id.toString(), user.partnerId.toString()].sort().join('-') : user._id.toString();
};

// @desc    Get all chores
// @route   GET /api/chores
// @access  Private
const getChores = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const chores = await Chore.find({ householdId })
      .populate('assignedTo', 'displayName username')
      .populate('completedBy', 'displayName username')
      .sort({ dueDate: 1 });
    
    res.json(chores);
  } catch (error) {
    console.error('Get chores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create chore
// @route   POST /api/chores
// @access  Private
const createChore = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { title, description, assignedTo, frequency, dueDate, priority, category, estimatedTime } = req.body;

    const chore = await Chore.create({
      householdId,
      title,
      description,
      assignedTo,
      frequency,
      dueDate,
      priority,
      category,
      estimatedTime
    });

    const populatedChore = await Chore.findById(chore._id)
      .populate('assignedTo', 'displayName username');

    res.status(201).json(populatedChore);
  } catch (error) {
    console.error('Create chore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update chore
// @route   PUT /api/chores/:id
// @access  Private
const updateChore = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const chore = await Chore.findOne({ _id: id, householdId });
    
    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    const updateData = { ...req.body };
    
    // If marking as completed
    if (req.body.isCompleted && !chore.isCompleted) {
      updateData.completedBy = req.user._id;
      updateData.completedAt = new Date();
    }

    const updatedChore = await Chore.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assignedTo', 'displayName username')
      .populate('completedBy', 'displayName username');

    res.json(updatedChore);
  } catch (error) {
    console.error('Update chore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete chore
// @route   DELETE /api/chores/:id
// @access  Private
const deleteChore = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const chore = await Chore.findOneAndDelete({ _id: id, householdId });
    
    if (!chore) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    res.json({ message: 'Chore deleted' });
  } catch (error) {
    console.error('Delete chore error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChores,
  createChore,
  updateChore,
  deleteChore
};
