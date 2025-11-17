const Chore = require('../models/Chore');
const { createCRUDController } = require('../utils/crudControllerFactory');

// Hook to handle completion tracking
const beforeUpdate = (updateData, req, existingChore) => {
  // If marking as completed
  if (updateData.isCompleted && !existingChore.isCompleted) {
    updateData.completedBy = req.user._id;
    updateData.completedAt = new Date();
  }
  return updateData;
};

// Create CRUD operations using the factory
const crudController = createCRUDController(Chore, {
  resourceName: 'Chore',
  socketEvent: 'chore',
  beforeUpdate
});

// Export with original naming for backward compatibility
module.exports = {
  getChores: crudController.getAll,
  createChore: crudController.create,
  updateChore: crudController.update,
  deleteChore: crudController.remove
};
