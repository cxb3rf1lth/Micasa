const TodoList = require('../models/TodoList');
const { createCRUDController } = require('../utils/crudControllerFactory');
const { getHouseholdId, verifyHouseholdAccess, sendError } = require('../utils/controllerHelpers');

// Hook to set owner field
const beforeCreate = (itemData, req) => {
  itemData.items = itemData.items || [];
  itemData.owner = req.user._id;
  return itemData;
};

// Create CRUD operations using the factory
const crudController = createCRUDController(TodoList, {
  resourceName: 'Todo list',
  socketEvent: 'todo',
  beforeCreate
});

// Additional nested item operations
// @desc    Add item to todo list
// @route   POST /api/todos/:id/items
const addTodoItem = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    const { text } = req.body;

    const todo = TodoList.findById(id);

    if (!verifyHouseholdAccess(todo, householdId)) {
      return sendError(res, 404, 'Todo list not found');
    }

    const updatedTodo = TodoList.addItem(id, { text, isCompleted: false });
    res.json(updatedTodo);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

// @desc    Update todo item
// @route   PUT /api/todos/:id/items/:itemId
const updateTodoItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const householdId = getHouseholdId(req.user);

    const todo = TodoList.findById(id);

    if (!verifyHouseholdAccess(todo, householdId)) {
      return sendError(res, 404, 'Todo list not found');
    }

    const updateData = {};
    if (req.body.text !== undefined) updateData.text = req.body.text;
    if (req.body.isCompleted !== undefined) {
      updateData.isCompleted = req.body.isCompleted;
      updateData.completedAt = req.body.isCompleted ? new Date() : null;
    }

    const updatedTodo = TodoList.updateItem(id, itemId, updateData);
    res.json(updatedTodo);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

// @desc    Delete todo item
// @route   DELETE /api/todos/:id/items/:itemId
const deleteTodoItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const householdId = getHouseholdId(req.user);

    const todo = TodoList.findById(id);

    if (!verifyHouseholdAccess(todo, householdId)) {
      return sendError(res, 404, 'Todo list not found');
    }

    const updatedTodo = TodoList.deleteItem(id, itemId);
    res.json(updatedTodo);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

// Export with original naming for backward compatibility
module.exports = {
  getTodoLists: crudController.getAll,
  createTodoList: crudController.create,
  updateTodoList: crudController.update,
  deleteTodoList: crudController.remove,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem
};
