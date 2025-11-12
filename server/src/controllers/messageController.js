const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.user.partnerId;
    const householdId = partnerId
      ? [userId, partnerId].sort().join('-')
      : `household_${userId}`;

    const messages = Message.findByHousehold(householdId, userId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;
    
    const messages = Message.findConversation(userId, partnerId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const partnerId = req.user.partnerId;
    const householdId = partnerId
      ? [userId, partnerId].sort().join('-')
      : `household_${userId}`;

    const messageData = {
      householdId,
      senderId: userId,
      recipientId: req.body.recipientId,
      content: req.body.content
    };

    const message = Message.create(messageData);
    
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
    
    const message = Message.markAsRead(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
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
    
    const deleted = Message.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
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
