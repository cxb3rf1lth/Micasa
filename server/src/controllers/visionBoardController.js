const VisionBoardItem = require('../models/VisionBoardItem');
const { triggerWebhooks } = require('../utils/webhookTrigger');

const getVisionBoardItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    
    const items = VisionBoardItem.findByHousehold(householdId);
    res.json(items);
  } catch (error) {
    console.error('Error fetching vision board items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createVisionBoardItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    
    const itemData = {
      ...req.body,
      householdId,
      createdBy: userId
    };
    
    const item = await VisionBoardItem.create(itemData);
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('vision-board-updated', {
        action: 'create',
        item,
        householdId
      });
    }

    await triggerWebhooks(householdId, 'vision-board-updated', { action: 'created', item });

    res.status(201).json(item);
  } catch (error) {
    console.error('Error creating vision board item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateVisionBoardItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    const { id } = req.params;
    
    const item = VisionBoardItem.update(id, req.body);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('vision-board-updated', {
        action: 'update',
        item,
        householdId
      });
    }

    await triggerWebhooks(householdId, 'vision-board-updated', { action: 'updated', item });

    res.json(item);
  } catch (error) {
    console.error('Error updating vision board item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteVisionBoardItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    const { id } = req.params;
    
    const deleted = VisionBoardItem.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('vision-board-updated', {
        action: 'delete',
        id,
        householdId
      });
    }

    await triggerWebhooks(householdId, 'vision-board-updated', { action: 'deleted', item: { id } });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting vision board item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getVisionBoardItems,
  createVisionBoardItem,
  updateVisionBoardItem,
  deleteVisionBoardItem
};
