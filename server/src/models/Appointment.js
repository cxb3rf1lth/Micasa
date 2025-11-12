const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  category: {
    type: String,
    enum: ['medical', 'work', 'social', 'family', 'other'],
    default: 'other'
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    minutesBefore: {
      type: Number,
      default: 30
    }
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  color: {
    type: String,
    default: '#9D8DF1'
  }
}, {
  timestamps: true
});

appointmentSchema.index({ householdId: 1, startTime: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
