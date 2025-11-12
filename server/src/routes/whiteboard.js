const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWhiteboardNotes,
  createWhiteboardNote,
  updateWhiteboardNote,
  deleteWhiteboardNote
} = require('../controllers/whiteboardController');

router.use(protect);

router.get('/', getWhiteboardNotes);
router.post('/', createWhiteboardNote);
router.put('/:id', updateWhiteboardNote);
router.delete('/:id', deleteWhiteboardNote);

module.exports = router;
