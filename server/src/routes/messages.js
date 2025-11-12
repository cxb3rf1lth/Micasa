const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMessages,
  getConversation,
  createMessage,
  markAsRead,
  getUnreadCount,
  deleteMessage
} = require('../controllers/messageController');
const { validateMessage, validateId } = require('../middleware/validation');

router.use(protect);

router.get('/', getMessages);
router.get('/unread-count', getUnreadCount);
router.get('/conversation/:partnerId', validateId, getConversation);
router.post('/', validateMessage, createMessage);
router.put('/:id/read', validateId, markAsRead);
router.delete('/:id', validateId, deleteMessage);

module.exports = router;
