const ShoppingNote = require('../models/ShoppingNote');
const { createCRUDController } = require('../utils/crudControllerFactory');

// Hook to handle purchase tracking
const beforeUpdate = (updateData, req, existingNote) => {
  // If marking as purchased
  if (updateData.isPurchased && !existingNote.isPurchased) {
    updateData.purchasedBy = req.user._id;
    updateData.purchasedAt = new Date();
  }
  return updateData;
};

// Create CRUD operations using the factory
const crudController = createCRUDController(ShoppingNote, {
  resourceName: 'Shopping note',
  socketEvent: 'shopping',
  beforeUpdate
});

// Export with original naming for backward compatibility
module.exports = {
  getShoppingNotes: crudController.getAll,
  createShoppingNote: crudController.create,
  updateShoppingNote: crudController.update,
  deleteShoppingNote: crudController.remove
};
