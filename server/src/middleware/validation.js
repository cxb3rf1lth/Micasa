const { body, param, validationResult } = require('express-validator');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Auth validation
const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateLinkPartner = [
  body('partnerUsername')
    .trim()
    .notEmpty()
    .withMessage('Partner username is required'),
  handleValidationErrors
];

const validateUpdateRole = [
  body('role')
    .trim()
    .isIn(['Husband', 'Wife', 'Partner', 'Roommate', 'Parent', 'Child', 'Other'])
    .withMessage('Invalid role'),
  handleValidationErrors
];

// Shopping notes validation
const validateShoppingNote = [
  body('item')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item must be between 1 and 200 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

// Chores validation
const validateChore = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('assignedTo')
    .optional()
    .isInt()
    .withMessage('Assigned user must be a valid ID'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('recurrence')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly'])
    .withMessage('Invalid recurrence type'),
  handleValidationErrors
];

// Appointments validation
const validateAppointment = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
  handleValidationErrors
];

// Todo lists validation
const validateTodoList = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  body('items.*.text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 300 })
    .withMessage('Item text must be between 1 and 300 characters'),
  handleValidationErrors
];

// Reminders validation
const validateReminder = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('reminderDate')
    .isISO8601()
    .withMessage('Reminder date must be a valid date'),
  body('recurrence')
    .optional()
    .isIn(['none', 'daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Invalid recurrence type'),
  handleValidationErrors
];

// Whiteboard validation
const validateWhiteboardItem = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Color must be a valid hex color'),
  body('position')
    .optional()
    .isObject()
    .withMessage('Position must be an object'),
  handleValidationErrors
];

// Vision board validation
const validateVisionBoardItem = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('targetDate')
    .optional()
    .isISO8601()
    .withMessage('Target date must be a valid date'),
  body('category')
    .optional()
    .isIn(['travel', 'career', 'health', 'financial', 'personal', 'relationship', 'other'])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Messages validation
const validateMessage = [
  body('recipientId')
    .isInt()
    .withMessage('Recipient ID must be valid'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  handleValidationErrors
];

// Webhooks validation
const validateWebhook = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('url')
    .isURL()
    .withMessage('URL must be valid'),
  body('events')
    .isArray()
    .withMessage('Events must be an array'),
  body('secret')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Secret must be less than 200 characters'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a valid positive integer'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateLinkPartner,
  validateUpdateRole,
  validateShoppingNote,
  validateChore,
  validateAppointment,
  validateTodoList,
  validateReminder,
  validateWhiteboardItem,
  validateVisionBoardItem,
  validateMessage,
  validateWebhook,
  validateId,
  handleValidationErrors
};
