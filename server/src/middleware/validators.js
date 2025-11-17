/**
 * Input validation middleware using express-validator
 * Provides validation rules for common request types
 */

const { body, param, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Common validation rules
 */
const validators = {
  // ID parameter validation
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),

  // Shopping note validation
  shoppingNote: [
    body('item')
      .trim()
      .notEmpty()
      .withMessage('Item is required')
      .isLength({ max: 200 })
      .withMessage('Item must be less than 200 characters'),
    body('quantity')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Quantity must be less than 50 characters'),
    body('category')
      .optional()
      .isIn(['groceries', 'household', 'personal', 'other'])
      .withMessage('Invalid category'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority')
  ],

  // Chore validation
  chore: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('dueDate')
      .notEmpty()
      .withMessage('Due date is required')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('estimatedTime')
      .optional()
      .isInt({ min: 1, max: 1440 })
      .withMessage('Estimated time must be between 1 and 1440 minutes')
  ],

  // Appointment validation
  appointment: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('startTime')
      .notEmpty()
      .withMessage('Start time is required')
      .isISO8601()
      .withMessage('Invalid start time format'),
    body('endTime')
      .notEmpty()
      .withMessage('End time is required')
      .isISO8601()
      .withMessage('Invalid end time format')
      .custom((endTime, { req }) => {
        if (new Date(endTime) <= new Date(req.body.startTime)) {
          throw new Error('End time must be after start time');
        }
        return true;
      })
  ],

  // Reminder validation
  reminder: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('reminderDate')
      .notEmpty()
      .withMessage('Reminder date is required')
      .isISO8601()
      .withMessage('Invalid date format')
  ],

  // Todo list validation
  todoList: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters')
  ],

  // Message validation
  message: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 5000 })
      .withMessage('Message must be less than 5000 characters')
  ],

  // Whiteboard note validation
  whiteboardNote: [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 2000 })
      .withMessage('Content must be less than 2000 characters'),
    body('positionX')
      .optional()
      .isNumeric()
      .withMessage('Position X must be a number'),
    body('positionY')
      .optional()
      .isNumeric()
      .withMessage('Position Y must be a number')
  ],

  // Vision board item validation
  visionBoardItem: [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title must be less than 200 characters'),
    body('targetDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid target date format')
  ],

  // Webhook validation
  webhook: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Webhook name is required')
      .isLength({ max: 100 })
      .withMessage('Webhook name must be less than 100 characters'),
    body('url')
      .notEmpty()
      .withMessage('Webhook URL is required')
      .isURL({ require_protocol: true })
      .withMessage('Invalid URL format')
      .custom((url) => {
        if (process.env.NODE_ENV === 'production' && !url.startsWith('https://')) {
          throw new Error('Webhook URL must use HTTPS in production');
        }
        return true;
      }),
    body('events')
      .isArray({ min: 1 })
      .withMessage('At least one event must be selected'),
    body('events.*')
      .isIn(['shopping', 'chore', 'appointment', 'todo', 'reminder', 'message', 'whiteboard', 'vision-board', '*'])
      .withMessage('Invalid event type'),
    body('secret')
      .optional()
      .isLength({ min: 8, max: 100 })
      .withMessage('Secret must be between 8 and 100 characters')
  ],

  // Todo item validation
  todoItem: [
    body('text')
      .trim()
      .notEmpty()
      .withMessage('Todo item text is required')
      .isLength({ max: 500 })
      .withMessage('Todo item must be less than 500 characters')
  ],

  // Parameter validation for conversation partner ID
  partnerId: param('partnerId')
    .isInt({ min: 1 })
    .withMessage('Partner ID must be a positive integer'),

  // Parameter validation for item ID (used in nested routes)
  itemId: param('itemId')
    .isInt({ min: 1 })
    .withMessage('Item ID must be a positive integer')
};

module.exports = {
  validate,
  validators
};
