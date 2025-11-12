const mongoose = require('mongoose');

const todoItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const todoListSchema = new mongoose.Schema({
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
  items: [todoItemSchema],
  isShared: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    enum: ['personal', 'household', 'work', 'shopping', 'other'],
    default: 'household'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  color: {
    type: String,
    default: '#9D8DF1'
  }
}, {
  timestamps: true
});

todoListSchema.index({ householdId: 1, isShared: 1 });

module.exports = mongoose.model('TodoList', todoListSchema);
