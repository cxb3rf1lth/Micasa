/**
 * Generic CRUD Controller Factory
 * Creates standardized CRUD operations for any model
 * Reduces code duplication across controllers
 */

const { getHouseholdId, verifyHouseholdAccess, sendError, emitSocketEvent } = require('./controllerHelpers');

/**
 * Create a CRUD controller for a model
 *
 * @param {Object} Model - The model class (e.g., ShoppingNote, Chore)
 * @param {Object} options - Configuration options
 * @param {string} options.resourceName - Name of the resource (e.g., 'shopping note', 'chore')
 * @param {string} options.socketEvent - Base name for socket events (e.g., 'shopping', 'chore')
 * @param {Function} options.beforeCreate - Optional hook to modify data before creation
 * @param {Function} options.beforeUpdate - Optional hook to modify data before update
 * @returns {Object} Controller object with CRUD methods
 */
const createCRUDController = (Model, options = {}) => {
  const {
    resourceName = 'item',
    socketEvent = 'resource',
    beforeCreate = null,
    beforeUpdate = null
  } = options;

  /**
   * Get all items for household
   * @route GET /api/resource
   */
  const getAll = async (req, res) => {
    try {
      const householdId = getHouseholdId(req.user);
      const items = Model.find({ householdId });
      res.json(items);
    } catch (error) {
      sendError(res, 500, 'Server error', error);
    }
  };

  /**
   * Create a new item
   * @route POST /api/resource
   */
  const create = async (req, res) => {
    try {
      const householdId = getHouseholdId(req.user);

      let itemData = {
        ...req.body,
        householdId,
        createdBy: req.user._id
      };

      // Apply beforeCreate hook if provided
      if (beforeCreate) {
        itemData = beforeCreate(itemData, req);
      }

      const item = Model.create(itemData);

      // Emit socket event for real-time update
      emitSocketEvent(req, householdId, `${socketEvent}-updated`, {
        action: 'create',
        [resourceName]: item
      });

      res.status(201).json(item);
    } catch (error) {
      sendError(res, 500, 'Server error', error);
    }
  };

  /**
   * Update an item
   * @route PUT /api/resource/:id
   */
  const update = async (req, res) => {
    try {
      const { id } = req.params;
      const householdId = getHouseholdId(req.user);

      // Verify item exists and belongs to household
      const existingItem = Model.findById(id);
      if (!verifyHouseholdAccess(existingItem, householdId)) {
        return sendError(res, 404, `${resourceName} not found`);
      }

      let updateData = { ...req.body };

      // Apply beforeUpdate hook if provided
      if (beforeUpdate) {
        updateData = beforeUpdate(updateData, req, existingItem);
      }

      const updatedItem = Model.findByIdAndUpdate(id, updateData);

      // Emit socket event for real-time update
      emitSocketEvent(req, householdId, `${socketEvent}-updated`, {
        action: 'update',
        [resourceName]: updatedItem
      });

      res.json(updatedItem);
    } catch (error) {
      sendError(res, 500, 'Server error', error);
    }
  };

  /**
   * Delete an item
   * @route DELETE /api/resource/:id
   */
  const remove = async (req, res) => {
    try {
      const { id } = req.params;
      const householdId = getHouseholdId(req.user);

      // Verify item exists and belongs to household
      const existingItem = Model.findById(id);
      if (!verifyHouseholdAccess(existingItem, householdId)) {
        return sendError(res, 404, `${resourceName} not found`);
      }

      Model.findByIdAndDelete(id);

      // Emit socket event for real-time update
      emitSocketEvent(req, householdId, `${socketEvent}-updated`, {
        action: 'delete',
        id
      });

      res.json({ message: `${resourceName} deleted successfully` });
    } catch (error) {
      sendError(res, 500, 'Server error', error);
    }
  };

  return {
    getAll,
    create,
    update,
    remove
  };
};

module.exports = { createCRUDController };
