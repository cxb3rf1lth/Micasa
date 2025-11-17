const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');
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
router.get('/conversation/:partnerId', validators.partnerId, validate, getConversation);
router.post('/', validators.message, validate, createMessage);
router.put('/:id/read', validators.id, validate, markAsRead);
router.delete('/:id', validators.id, validate, deleteMessage);

module.exports = router;
