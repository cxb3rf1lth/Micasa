const express = require('express');
const router = express.Router();
const {
  getTodoLists,
  createTodoList,
  updateTodoList,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  deleteTodoList
} = require('../controllers/todoController');
const { protect } = require('../middleware/auth');
const { validateTodoList, validateId } = require('../middleware/validation');

router.route('/')
  .get(protect, getTodoLists)
  .post(protect, validateTodoList, createTodoList);

router.route('/:id')
  .put(protect, validateId, validateTodoList, updateTodoList)
  .delete(protect, validateId, deleteTodoList);

router.post('/:id/items', protect, validateId, addTodoItem);
router.put('/:id/items/:itemId', protect, validateId, updateTodoItem);
router.delete('/:id/items/:itemId', protect, validateId, deleteTodoItem);

module.exports = router;
