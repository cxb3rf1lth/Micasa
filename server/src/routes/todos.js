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
const { validators, validate } = require('../middleware/validators');

router.route('/')
  .get(protect, getTodoLists)
  .post(protect, validators.todoList, validate, createTodoList);

router.route('/:id')
  .put(protect, validators.id, validate, updateTodoList)
  .delete(protect, validators.id, validate, deleteTodoList);

router.post('/:id/items', protect, validators.id, validators.todoItem, validate, addTodoItem);
router.put('/:id/items/:itemId', protect, validators.id, validators.itemId, validate, updateTodoItem);
router.delete('/:id/items/:itemId', protect, validators.id, validators.itemId, validate, deleteTodoItem);

module.exports = router;
