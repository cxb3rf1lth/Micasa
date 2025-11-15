const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');

router.route('/')
  .get(protect, getReminders)
  .post(protect, validators.reminder, validate, createReminder);

router.route('/:id')
  .put(protect, validators.id, validate, updateReminder)
  .delete(protect, validators.id, validate, deleteReminder);

module.exports = router;
