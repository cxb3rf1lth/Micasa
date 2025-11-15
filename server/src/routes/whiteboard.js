const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');
const {
  getWhiteboardNotes,
  createWhiteboardNote,
  updateWhiteboardNote,
  deleteWhiteboardNote
} = require('../controllers/whiteboardController');

router.use(protect);

router.get('/', getWhiteboardNotes);
router.post('/', validators.whiteboardNote, validate, createWhiteboardNote);
router.put('/:id', validators.id, validate, updateWhiteboardNote);
router.delete('/:id', validators.id, validate, deleteWhiteboardNote);

module.exports = router;
