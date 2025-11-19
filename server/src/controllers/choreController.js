const Chore = require('../models/Chore');
const { triggerWebhooks } = require('../utils/webhookTrigger');

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
    const chores = Chore.find({ householdId });
    
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

    const chore = Chore.create({
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

    await triggerWebhooks(householdId, 'chore-updated', { action: 'created', item: chore });

    res.status(201).json(chore);
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
    
    const chore = Chore.findById(id);
    
    if (!chore || chore.householdId !== householdId) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    const updateData = { ...req.body };
    
    // If marking as completed
    if (req.body.isCompleted && !chore.isCompleted) {
      updateData.completedBy = req.user._id;
      updateData.completedAt = new Date();
    }

    const updatedChore = Chore.findByIdAndUpdate(id, updateData);

    await triggerWebhooks(householdId, 'chore-updated', { action: 'updated', item: updatedChore });

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
    
    const chore = Chore.findById(id);
    
    if (!chore || chore.householdId !== householdId) {
      return res.status(404).json({ message: 'Chore not found' });
    }

    Chore.findByIdAndDelete(id);

    await triggerWebhooks(householdId, 'chore-updated', { action: 'deleted', item: { id, title: chore.title } });

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
