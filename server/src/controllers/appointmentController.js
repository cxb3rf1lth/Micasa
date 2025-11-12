const Appointment = require('../models/Appointment');

// Helper function to get household ID
const getHouseholdId = (user) => {
  return user.partnerId ? [user._id.toString(), user.partnerId.toString()].sort().join('-') : user._id.toString();
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const appointments = await Appointment.find({ householdId })
      .populate('createdBy', 'displayName username')
      .populate('attendees', 'displayName username')
      .sort({ startTime: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { title, description, startTime, endTime, location, attendees, category, reminder, isRecurring, recurrencePattern, color } = req.body;

    const appointment = await Appointment.create({
      householdId,
      title,
      description,
      startTime,
      endTime,
      location,
      attendees,
      category,
      reminder,
      isRecurring,
      recurrencePattern,
      color,
      createdBy: req.user._id
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('createdBy', 'displayName username')
      .populate('attendees', 'displayName username');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const appointment = await Appointment.findOne({ _id: id, householdId });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true })
      .populate('createdBy', 'displayName username')
      .populate('attendees', 'displayName username');

    res.json(updatedAppointment);
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const appointment = await Appointment.findOneAndDelete({ _id: id, householdId });
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
};
