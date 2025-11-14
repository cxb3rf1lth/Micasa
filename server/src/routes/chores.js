const express = require('express');
const router = express.Router();
const {
  getChores,
  createChore,
  updateChore,
  deleteChore
} = require('../controllers/choreController');
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');

router.route('/')
  .get(protect, getChores)
  .post(protect, validators.chore, validate, createChore);

router.route('/:id')
  .put(protect, validators.id, validate, updateChore)
  .delete(protect, validators.id, validate, deleteChore);

module.exports = router;
