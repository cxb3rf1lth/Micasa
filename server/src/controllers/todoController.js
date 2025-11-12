const TodoList = require('../models/TodoList');

// Helper function to get household ID
const getHouseholdId = (user) => {
  return user.partnerId ? [user._id.toString(), user.partnerId.toString()].sort().join('-') : user._id.toString();
};

// @desc    Get all todo lists
// @route   GET /api/todos
// @access  Private
const getTodoLists = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const todos = TodoList.find({ householdId });
    
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create todo list
// @route   POST /api/todos
// @access  Private
const createTodoList = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const { title, description, items, isShared, sharedWith, category, priority, dueDate, color } = req.body;

    const todoList = TodoList.create({
      householdId,
      title,
      description,
      items: items || [],
      isShared,
      owner: req.user._id,
      sharedWith,
      category,
      priority,
      dueDate,
      color
    });

    res.status(201).json(todoList);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update todo list
// @route   PUT /api/todos/:id
// @access  Private
const updateTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const todo = TodoList.findById(id);
    
    if (!todo || todo.householdId !== householdId) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    const updatedTodo = TodoList.findByIdAndUpdate(id, req.body);

    res.json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to todo list
// @route   POST /api/todos/:id/items
// @access  Private
const addTodoItem = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    const { text } = req.body;
    
    const todo = TodoList.findById(id);
    
    if (!todo || todo.householdId !== householdId) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    const updatedTodo = TodoList.addItem(id, { text, isCompleted: false });

    res.json(updatedTodo);
  } catch (error) {
    console.error('Add todo item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update todo item
// @route   PUT /api/todos/:id/items/:itemId
// @access  Private
const updateTodoItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const todo = TodoList.findById(id);
    
    if (!todo || todo.householdId !== householdId) {
      return res.status(404).json({ message: 'Todo list not found' });
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
    console.error('Update todo item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete todo item
// @route   DELETE /api/todos/:id/items/:itemId
// @access  Private
const deleteTodoItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const todo = TodoList.findById(id);
    
    if (!todo || todo.householdId !== householdId) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    const updatedTodo = TodoList.deleteItem(id, itemId);

    res.json(updatedTodo);
  } catch (error) {
    console.error('Delete todo item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete todo list
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);
    
    const todo = TodoList.findById(id);
    
    if (!todo || todo.householdId !== householdId) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    TodoList.findByIdAndDelete(id);

    res.json({ message: 'Todo list deleted' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTodoLists,
  createTodoList,
  updateTodoList,
  addTodoItem,
  updateTodoItem,
  deleteTodoItem,
  deleteTodoList
};
