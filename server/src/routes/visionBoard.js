const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getVisionBoardItems,
  createVisionBoardItem,
  updateVisionBoardItem,
  deleteVisionBoardItem
} = require('../controllers/visionBoardController');
const { validateVisionBoardItem, validateId } = require('../middleware/validation');

router.use(protect);

router.get('/', getVisionBoardItems);
router.post('/', validateVisionBoardItem, createVisionBoardItem);
router.put('/:id', validateId, validateVisionBoardItem, updateVisionBoardItem);
router.delete('/:id', validateId, deleteVisionBoardItem);

module.exports = router;
