const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');
const {
  getVisionBoardItems,
  createVisionBoardItem,
  updateVisionBoardItem,
  deleteVisionBoardItem
} = require('../controllers/visionBoardController');

router.use(protect);

router.get('/', getVisionBoardItems);
router.post('/', validators.visionBoardItem, validate, createVisionBoardItem);
router.put('/:id', validators.id, validate, updateVisionBoardItem);
router.delete('/:id', validators.id, validate, deleteVisionBoardItem);

module.exports = router;
