const express = require('express');
const router = express.Router();
const {
  getShoppingNotes,
  createShoppingNote,
  updateShoppingNote,
  deleteShoppingNote
} = require('../controllers/shoppingController');
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');

router.route('/')
  .get(protect, getShoppingNotes)
  .post(protect, validators.shoppingNote, validate, createShoppingNote);

router.route('/:id')
  .put(protect, validators.id, validate, updateShoppingNote)
  .delete(protect, validators.id, validate, deleteShoppingNote);

module.exports = router;
