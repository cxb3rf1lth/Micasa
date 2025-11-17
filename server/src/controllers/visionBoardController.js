const VisionBoardItem = require('../models/VisionBoardItem');
const { getHouseholdId, verifyHouseholdAccess, sendError, emitSocketEvent } = require('../utils/controllerHelpers');

// Custom implementation for vision board since it uses different method names
const getVisionBoardItems = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const items = VisionBoardItem.findByHousehold(householdId);
    res.json(items);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const createVisionBoardItem = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);

    const itemData = {
      ...req.body,
      householdId,
      createdBy: req.user._id
    };

    const item = await VisionBoardItem.create(itemData);

    emitSocketEvent(req, householdId, 'vision-board-updated', {
      action: 'create',
      item
    });

    res.status(201).json(item);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const updateVisionBoardItem = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { id } = req.params;

    // Verify item belongs to household
    const existingItem = VisionBoardItem.findById(id);
    if (!verifyHouseholdAccess(existingItem, householdId)) {
      return sendError(res, 404, 'Item not found');
    }

    const item = VisionBoardItem.update(id, req.body);

    if (!item) {
      return sendError(res, 404, 'Item not found');
    }

    emitSocketEvent(req, householdId, 'vision-board-updated', {
      action: 'update',
      item
    });

    res.json(item);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const deleteVisionBoardItem = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { id } = req.params;

    // Verify item belongs to household
    const existingItem = VisionBoardItem.findById(id);
    if (!verifyHouseholdAccess(existingItem, householdId)) {
      return sendError(res, 404, 'Item not found');
    }

    const deleted = VisionBoardItem.delete(id);

    if (!deleted) {
      return sendError(res, 404, 'Item not found');
    }

    emitSocketEvent(req, householdId, 'vision-board-updated', {
      action: 'delete',
      id
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

module.exports = {
  getVisionBoardItems,
  createVisionBoardItem,
  updateVisionBoardItem,
  deleteVisionBoardItem
};
