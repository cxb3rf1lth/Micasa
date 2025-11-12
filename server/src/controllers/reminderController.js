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
    const reminders = Reminder.find({ householdId });
    
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

    const reminder = Reminder.create({
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

    res.status(201).json(reminder);
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
    
    const reminder = Reminder.findById(id);
    
    if (!reminder || reminder.householdId !== householdId) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const updateData = { ...req.body };
    
    // If marking as completed
    if (req.body.isCompleted && !reminder.isCompleted) {
      updateData.completedAt = new Date();
    }

    const updatedReminder = Reminder.findByIdAndUpdate(id, updateData);

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
    
    const reminder = Reminder.findById(id);
    
    if (!reminder || reminder.householdId !== householdId) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    Reminder.findByIdAndDelete(id);

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
