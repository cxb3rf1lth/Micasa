const Message = require('../models/Message');

// Helper function to get household ID (consistent with other controllers)
const getHouseholdId = (user) => {
  return user.partnerId ? [user._id.toString(), user.partnerId.toString()].sort().join('-') : user._id.toString();
};

const getMessages = async (req, res) => {
  try {
    const userId = req.user._id; // Fixed: use _id for consistency
    const householdId = getHouseholdId(req.user); // Fixed: use proper household ID logic

    const messages = Message.findByHousehold(householdId, userId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversation = async (req, res) => {
  try {
    const userId = req.user._id; // Fixed: use _id for consistency
    const { partnerId } = req.params;

    // Security: Verify the partnerId is actually the user's partner
    if (req.user.partnerId && req.user.partnerId.toString() !== partnerId) {
      return res.status(403).json({ message: 'Unauthorized: Can only view conversation with your partner' });
    }

    const messages = Message.findConversation(userId, partnerId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMessage = async (req, res) => {
  try {
    const userId = req.user._id; // Fixed: use _id for consistency
    const householdId = getHouseholdId(req.user); // Fixed: use proper household ID logic

    // Security: Verify recipient is the user's partner
    if (req.user.partnerId && req.user.partnerId.toString() !== req.body.recipientId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Can only send messages to your partner' });
    }

    const messageData = {
      householdId,
      senderId: userId,
      recipientId: req.body.recipientId,
      content: req.body.content
    };

    const message = await Message.create(messageData);

    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(householdId).emit('message-received', {
        message,
        householdId
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Security fix: Verify user is the recipient before marking as read
    const message = Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the recipient can mark a message as read
    if (message.recipient.id !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized: Only the recipient can mark a message as read' });
    }

    const updatedMessage = Message.markAsRead(id);
    res.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id; // Fixed: use _id for consistency
    const count = Message.getUnreadCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    // Security fix: Verify user is sender or recipient before deleting
    const message = Message.findById(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only sender or recipient can delete a message
    if (message.sender.id !== req.user._id && message.recipient.id !== req.user._id) {
      return res.status(403).json({ message: 'Unauthorized: Can only delete your own messages' });
    }

    const deleted = Message.delete(id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMessages,
  getConversation,
  createMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage
};
