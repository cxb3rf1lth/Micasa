const mongoose = require('mongoose');

const shoppingNoteSchema = new mongoose.Schema({
  householdId: {
    type: String,
    required: true,
    index: true
  },
  item: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: String,
    default: '1'
  },
  category: {
    type: String,
    enum: ['groceries', 'household', 'personal', 'other'],
    default: 'groceries'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isPurchased: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  purchasedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purchasedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

shoppingNoteSchema.index({ householdId: 1, isPurchased: 1 });

module.exports = mongoose.model('ShoppingNote', shoppingNoteSchema);
