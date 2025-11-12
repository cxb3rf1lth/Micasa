const express = require('express');
const router = express.Router();
const {
  getShoppingNotes,
  createShoppingNote,
  updateShoppingNote,
  deleteShoppingNote
} = require('../controllers/shoppingController');
const { protect } = require('../middleware/auth');
const { validateShoppingNote, validateId } = require('../middleware/validation');

router.route('/')
  .get(protect, getShoppingNotes)
  .post(protect, validateShoppingNote, createShoppingNote);

router.route('/:id')
  .put(protect, validateId, validateShoppingNote, updateShoppingNote)
  .delete(protect, validateId, deleteShoppingNote);

module.exports = router;
