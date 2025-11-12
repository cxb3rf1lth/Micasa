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

router.use(protect);

router.get('/', getMessages);
router.get('/unread-count', getUnreadCount);
router.get('/conversation/:partnerId', getConversation);
router.post('/', createMessage);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteMessage);

module.exports = router;
