const Reminder = require('../models/Reminder');
const { createCRUDController } = require('../utils/crudControllerFactory');

// Hook to handle completion tracking
const beforeUpdate = (updateData, req, existingReminder) => {
  // If marking as completed
  if (updateData.isCompleted && !existingReminder.isCompleted) {
    updateData.completedAt = new Date();
  }
  return updateData;
};

// Create CRUD operations using the factory
const crudController = createCRUDController(Reminder, {
  resourceName: 'Reminder',
  socketEvent: 'reminder',
  beforeUpdate
});

// Export with original naming for backward compatibility
module.exports = {
  getReminders: crudController.getAll,
  createReminder: crudController.create,
  updateReminder: crudController.update,
  deleteReminder: crudController.remove
};
