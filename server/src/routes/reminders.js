const express = require('express');
const router = express.Router();
const {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');
const { protect } = require('../middleware/auth');
const { validateReminder, validateId } = require('../middleware/validation');

router.route('/')
  .get(protect, getReminders)
  .post(protect, validateReminder, createReminder);

router.route('/:id')
  .put(protect, validateId, validateReminder, updateReminder)
  .delete(protect, validateId, deleteReminder);

module.exports = router;
