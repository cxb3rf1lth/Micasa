const express = require('express');
const router = express.Router();
const {
  getChores,
  createChore,
  updateChore,
  deleteChore
} = require('../controllers/choreController');
const { protect } = require('../middleware/auth');
const { validateChore, validateId } = require('../middleware/validation');

router.route('/')
  .get(protect, getChores)
  .post(protect, validateChore, createChore);

router.route('/:id')
  .put(protect, validateId, validateChore, updateChore)
  .delete(protect, validateId, deleteChore);

module.exports = router;
