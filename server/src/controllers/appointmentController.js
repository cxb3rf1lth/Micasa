const Appointment = require('../models/Appointment');
const { createCRUDController } = require('../utils/crudControllerFactory');

// Create CRUD operations using the factory
const crudController = createCRUDController(Appointment, {
  resourceName: 'Appointment',
  socketEvent: 'appointment'
});

// Export with original naming for backward compatibility
module.exports = {
  getAppointments: crudController.getAll,
  createAppointment: crudController.create,
  updateAppointment: crudController.update,
  deleteAppointment: crudController.remove
};
