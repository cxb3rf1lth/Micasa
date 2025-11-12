const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook
} = require('../controllers/webhookController');
const { validateWebhook, validateId } = require('../middleware/validation');

router.use(protect);

router.get('/', getWebhooks);
router.post('/', validateWebhook, createWebhook);
router.put('/:id', validateId, validateWebhook, updateWebhook);
router.delete('/:id', validateId, deleteWebhook);

module.exports = router;
