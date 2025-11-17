/**
 * Custom Error Classes
 * Provides specific error types for better error handling
 */

const constants = require('../constants');

/**
 * Base Application Error
 */
class AppError extends Error {
  constructor(message, statusCode = constants.HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true; // Operational vs programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
  constructor(message = constants.ERRORS.VALIDATION_ERROR, errors = []) {
    super(message, constants.HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
  }
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends AppError {
  constructor(message = constants.ERRORS.AUTHENTICATION_ERROR) {
    super(message, constants.HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends AppError {
  constructor(message = constants.ERRORS.FORBIDDEN) {
    super(message, constants.HTTP_STATUS.FORBIDDEN);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, constants.HTTP_STATUS.NOT_FOUND);
    this.resource = resource;
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, constants.HTTP_STATUS.CONFLICT);
  }
}

/**
 * Database Error (500)
 */
class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', originalError = null) {
    super(message, constants.HTTP_STATUS.INTERNAL_SERVER_ERROR);
    this.originalError = originalError;
    this.isOperational = false; // Database errors are not operational
  }
}

/**
 * External Service Error (503)
 */
class ExternalServiceError extends AppError {
  constructor(service, message = 'External service unavailable') {
    super(message, constants.HTTP_STATUS.SERVICE_UNAVAILABLE);
    this.service = service;
  }
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  RateLimitError
};
