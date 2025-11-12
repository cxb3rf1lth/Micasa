const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWhiteboardNotes,
  createWhiteboardNote,
  updateWhiteboardNote,
  deleteWhiteboardNote
} = require('../controllers/whiteboardController');
const { validateWhiteboardItem, validateId } = require('../middleware/validation');

router.use(protect);

router.get('/', getWhiteboardNotes);
router.post('/', validateWhiteboardItem, createWhiteboardNote);
router.put('/:id', validateId, validateWhiteboardItem, updateWhiteboardNote);
router.delete('/:id', validateId, deleteWhiteboardNote);

module.exports = router;
