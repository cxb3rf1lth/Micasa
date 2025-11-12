const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  householdId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['shopping', 'bills', 'maintenance', 'personal', 'other'],
    default: 'other'
  },
  reminderDate: {
    type: Date,
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', null],
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notifyBoth: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

reminderSchema.index({ householdId: 1, reminderDate: 1, isCompleted: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
