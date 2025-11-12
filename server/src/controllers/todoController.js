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
    const todos = await TodoList.find({ householdId })
      .populate('owner', 'displayName username')
      .populate('sharedWith', 'displayName username')
      .sort({ createdAt: -1 });
    
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

    const todoList = await TodoList.create({
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

    const populatedTodo = await TodoList.findById(todoList._id)
      .populate('owner', 'displayName username')
      .populate('sharedWith', 'displayName username');

    res.status(201).json(populatedTodo);
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
    
    const todo = await TodoList.findOne({ _id: id, householdId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    const updatedTodo = await TodoList.findByIdAndUpdate(id, req.body, { new: true })
      .populate('owner', 'displayName username')
      .populate('sharedWith', 'displayName username');

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
    
    const todo = await TodoList.findOne({ _id: id, householdId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    todo.items.push({ text, isCompleted: false });
    await todo.save();

    const updatedTodo = await TodoList.findById(id)
      .populate('owner', 'displayName username')
      .populate('sharedWith', 'displayName username');

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
    
    const todo = await TodoList.findOne({ _id: id, householdId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    const item = todo.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Todo item not found' });
    }

    if (req.body.text !== undefined) item.text = req.body.text;
    if (req.body.isCompleted !== undefined) {
      item.isCompleted = req.body.isCompleted;
      item.completedAt = req.body.isCompleted ? new Date() : null;
    }

    await todo.save();

    const updatedTodo = await TodoList.findById(id)
      .populate('owner', 'displayName username')
      .populate('sharedWith', 'displayName username');

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
    
    const todo = await TodoList.findOne({ _id: id, householdId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

    todo.items.pull(itemId);
    await todo.save();

    const updatedTodo = await TodoList.findById(id)
      .populate('owner', 'displayName username')
      .populate('sharedWith', 'displayName username');

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
    
    const todo = await TodoList.findOneAndDelete({ _id: id, householdId });
    
    if (!todo) {
      return res.status(404).json({ message: 'Todo list not found' });
    }

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
