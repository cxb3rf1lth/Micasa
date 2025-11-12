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

router.route('/')
  .get(protect, getTodoLists)
  .post(protect, createTodoList);

router.route('/:id')
  .put(protect, updateTodoList)
  .delete(protect, deleteTodoList);

router.post('/:id/items', protect, addTodoItem);
router.put('/:id/items/:itemId', protect, updateTodoItem);
router.delete('/:id/items/:itemId', protect, deleteTodoItem);

module.exports = router;
