const Appointment = require('../models/Appointment');
const { triggerWebhooks } = require('../utils/webhookTrigger');

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
    const appointments = Appointment.find({ householdId });
    
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

    const appointment = Appointment.create({
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

    await triggerWebhooks(householdId, 'appointment-updated', { action: 'created', item: appointment });

    res.status(201).json(appointment);
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
    
    const appointment = Appointment.findById(id);
    
    if (!appointment || appointment.householdId !== householdId) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updatedAppointment = Appointment.findByIdAndUpdate(id, req.body);

    await triggerWebhooks(householdId, 'appointment-updated', { action: 'updated', item: updatedAppointment });

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
    
    const appointment = Appointment.findById(id);
    
    if (!appointment || appointment.householdId !== householdId) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    Appointment.findByIdAndDelete(id);

    await triggerWebhooks(householdId, 'appointment-updated', { action: 'deleted', item: { id, title: appointment.title } });

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
