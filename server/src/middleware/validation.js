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

// Auth validation with strong password policy
const validateRegister = [
  body('username')
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('displayName')
    .trim()
    .escape()
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
    .escape()
    .isLength({ min: 1, max: 200 })
    .withMessage('Item must be between 1 and 200 characters'),
  body('category')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('quantity')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 20 })
    .withMessage('Quantity must be less than 20 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('notes')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
  handleValidationErrors
];

// Chores validation
const validateChore = [
  body('title')
    .trim()
    .escape()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('assignedTo')
    .optional()
    .isInt()
    .withMessage('Assigned user must be a valid ID'),
  handleValidationErrors
];

// Messages validation
const validateMessage = [
  body('recipientId')
    .isInt()
    .withMessage('Recipient ID must be valid'),
  body('content')
    .trim()
    .escape()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
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
  validateMessage,
  validateId,
  handleValidationErrors
};
