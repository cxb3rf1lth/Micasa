const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');
const {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook
} = require('../controllers/webhookController');

router.use(protect);

router.get('/', getWebhooks);
router.post('/', validators.webhook, validate, createWebhook);
router.put('/:id', validators.id, validators.webhook, validate, updateWebhook);
router.delete('/:id', validators.id, validate, deleteWebhook);

module.exports = router;
