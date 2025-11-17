/**
 * Global Error Handling Middleware
 * Catches and processes all errors in a consistent way
 */

const logger = require('../config/logger');
const { AppError } = require('../utils/errors');
const constants = require('../constants');

/**
 * Error handler middleware
 * Should be the last middleware added to Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log the error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
    body: process.env.NODE_ENV === 'development' ? req.body : undefined
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, constants.HTTP_STATUS.NOT_FOUND);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, constants.HTTP_STATUS.CONFLICT);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message);
    error = new AppError(message, constants.HTTP_STATUS.BAD_REQUEST);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, constants.HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, constants.HTTP_STATUS.UNAUTHORIZED);
  }

  // Prepare response
  const statusCode = error.statusCode || constants.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || constants.ERRORS.SERVER_ERROR;

  // Build error response
  const response = {
    success: false,
    error: {
      message,
      statusCode
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack;
  }

  // Add validation errors if present
  if (error.errors) {
    response.error.details = error.errors;
  }

  // Send response
  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 * Catches routes that don't exist
 */
const notFound = (req, res, next) => {
  const error = new AppError(
    `Route not found - ${req.originalUrl}`,
    constants.HTTP_STATUS.NOT_FOUND
  );
  next(error);
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
