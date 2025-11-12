const express = require('express');
const router = express.Router();
const {
  getShoppingNotes,
  createShoppingNote,
  updateShoppingNote,
  deleteShoppingNote
} = require('../controllers/shoppingController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getShoppingNotes)
  .post(protect, createShoppingNote);

router.route('/:id')
  .put(protect, updateShoppingNote)
  .delete(protect, deleteShoppingNote);

module.exports = router;
