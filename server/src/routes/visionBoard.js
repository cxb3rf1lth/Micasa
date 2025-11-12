const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getVisionBoardItems,
  createVisionBoardItem,
  updateVisionBoardItem,
  deleteVisionBoardItem
} = require('../controllers/visionBoardController');

router.use(protect);

router.get('/', getVisionBoardItems);
router.post('/', createVisionBoardItem);
router.put('/:id', updateVisionBoardItem);
router.delete('/:id', deleteVisionBoardItem);

module.exports = router;
