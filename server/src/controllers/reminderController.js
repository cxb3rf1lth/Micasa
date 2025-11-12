const Reminder = require('../models/Reminder');

// Helper function to get household ID
const getHouseholdId = (user) => {
  return user.partnerId ? [user._id.toString(), user.partnerId.toString()].sort().join('-') : user._id.toString();
};

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const reminders = await Reminder.find({ householdId })
      .populate('createdBy', 'displayName username')
      .sort({ reminderDate: 1 });
    
    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { title, description, category, reminderDate, isRecurring, recurrencePattern, notifyBoth, priority } = req.body;

    const reminder = await Reminder.create({
      householdId,
      title,
      description,
      category,
      reminderDate,
      isRecurring,
      recurrencePattern,
      notifyBoth,
      priority,
      createdBy: req.user._id
    });

    const populatedReminder = await Reminder.findById(reminder._id)
      .populate('createdBy', 'displayName username');

    res.status(201).json(populatedReminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const reminder = await Reminder.findOne({ _id: id, householdId });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const updateData = { ...req.body };
    
    // If marking as completed
    if (req.body.isCompleted && !reminder.isCompleted) {
      updateData.completedAt = new Date();
    }

    const updatedReminder = await Reminder.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'displayName username');

    res.json(updatedReminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const reminder = await Reminder.findOneAndDelete({ _id: id, householdId });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
};
