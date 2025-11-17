/**
 * Application Constants
 * Centralizes magic strings and numbers for consistency
 */

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },

  // Socket.IO Event Names
  SOCKET_EVENTS: {
    // Shopping
    SHOPPING_UPDATED: 'shopping-updated',

    // Chores
    CHORE_UPDATED: 'chore-updated',

    // Appointments
    APPOINTMENT_UPDATED: 'appointment-updated',

    // Todos
    TODO_UPDATED: 'todo-updated',

    // Reminders
    REMINDER_UPDATED: 'reminder-updated',

    // Whiteboard
    WHITEBOARD_UPDATED: 'whiteboard-updated',

    // Vision Board
    VISION_BOARD_UPDATED: 'vision-board-updated',

    // Messages
    MESSAGE_RECEIVED: 'message-received',
    MESSAGE_READ: 'message-read',

    // Connection
    ERROR: 'error',
    JOIN_HOUSEHOLD: 'join-household',
    DISCONNECT: 'disconnect'
  },

  // Rate Limiting
  RATE_LIMIT: {
    // General API rate limit (requests per window)
    API_MAX: 100,
    API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes

    // Authentication rate limit (more strict)
    AUTH_MAX: 5,
    AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutes

    // Static files rate limit
    STATIC_MAX: 100,
    STATIC_WINDOW_MS: 15 * 60 * 1000 // 15 minutes
  },

  // JWT Configuration
  JWT: {
    EXPIRES_IN: '30d',
    ALGORITHM: 'HS256'
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_NUMBER: true,
    REQUIRE_LETTER: true,
    BCRYPT_ROUNDS: 10
  },

  // Validation Limits
  VALIDATION: {
    USERNAME_MIN: 3,
    USERNAME_MAX: 30,
    DISPLAY_NAME_MAX: 50,
    TEXT_SHORT_MAX: 200,
    TEXT_MEDIUM_MAX: 500,
    TEXT_LONG_MAX: 2000,
    MESSAGE_MAX: 5000,
    WEBHOOK_NAME_MAX: 100,
    WEBHOOK_SECRET_MIN: 8,
    WEBHOOK_SECRET_MAX: 100
  },

  // Database
  DATABASE: {
    SQLITE_PATH: './data/micasa.db',
    // PostgreSQL pool settings (for AWS RDS)
    PG_POOL_MAX: 20,
    PG_IDLE_TIMEOUT_MS: 30000,
    PG_CONNECTION_TIMEOUT_MS: 2000
  },

  // Cache TTL (Time To Live) in seconds
  CACHE_TTL: {
    USER: 300, // 5 minutes
    HOUSEHOLD: 300, // 5 minutes
    SHOPPING: 60, // 1 minute
    CHORES: 60, // 1 minute
    APPOINTMENTS: 60, // 1 minute
    TODOS: 60, // 1 minute
    REMINDERS: 60 // 1 minute
  },

  // Webhook Configuration
  WEBHOOK: {
    TIMEOUT_MS: 5000,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000
  },

  // File Upload (for future file attachment feature)
  FILE_UPLOAD: {
    MAX_SIZE_MB: 10,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    MAX_FILES_PER_UPLOAD: 5
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // Household Roles
  ROLES: {
    HUSBAND: 'Husband',
    WIFE: 'Wife',
    PARTNER: 'Partner',
    PARENT: 'Parent',
    CHILD: 'Child',
    ROOMMATE: 'Roommate',
    OTHER: 'Other'
  },

  // Priority Levels
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  },

  // Categories
  CATEGORIES: {
    SHOPPING: ['groceries', 'household', 'personal', 'other'],
    CHORES: ['cleaning', 'cooking', 'laundry', 'maintenance', 'other'],
    APPOINTMENTS: ['medical', 'work', 'personal', 'household', 'other'],
    REMINDERS: ['bills', 'maintenance', 'personal', 'household', 'other']
  },

  // Frequencies
  FREQUENCIES: {
    ONCE: 'once',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
  },

  // Log Levels
  LOG_LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    HTTP: 'http',
    VERBOSE: 'verbose',
    DEBUG: 'debug',
    SILLY: 'silly'
  },

  // Environment
  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test'
  },

  // AWS Configuration
  AWS: {
    REGION: 'us-east-1',
    CLOUDWATCH_LOG_GROUP: 'micasa-app',
    S3_BUCKET_PREFIX: 'micasa',
    RDS_PORT: 5432
  },

  // Error Messages
  ERRORS: {
    SERVER_ERROR: 'Server error occurred',
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    AUTHENTICATION_ERROR: 'Authentication error',
    FORBIDDEN: 'Forbidden access'
  }
};
