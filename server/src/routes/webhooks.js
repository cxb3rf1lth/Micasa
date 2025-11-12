const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook
} = require('../controllers/webhookController');

router.use(protect);

router.get('/', getWebhooks);
router.post('/', createWebhook);
router.put('/:id', updateWebhook);
router.delete('/:id', deleteWebhook);

module.exports = router;
