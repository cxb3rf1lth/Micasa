const express = require('express');
const router = express.Router();
const {
  getChores,
  createChore,
  updateChore,
  deleteChore
} = require('../controllers/choreController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getChores)
  .post(protect, createChore);

router.route('/:id')
  .put(protect, updateChore)
  .delete(protect, deleteChore);

module.exports = router;
