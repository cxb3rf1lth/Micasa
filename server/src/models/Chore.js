const mongoose = require('mongoose');

const choreSchema = new mongoose.Schema({
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
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'once'],
    default: 'weekly'
  },
  dueDate: {
    type: Date,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['cleaning', 'cooking', 'maintenance', 'shopping', 'other'],
    default: 'other'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30
  }
}, {
  timestamps: true
});

choreSchema.index({ householdId: 1, isCompleted: 1, dueDate: 1 });

module.exports = mongoose.model('Chore', choreSchema);
