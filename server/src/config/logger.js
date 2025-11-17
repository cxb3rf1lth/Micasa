/**
 * Winston Logger Configuration
 * Supports local file logging and AWS CloudWatch
 */

const winston = require('winston');
const path = require('path');
const constants = require('../constants');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      msg += `\n${meta.stack}`;
    }
    return msg;
  })
);

// Create transports array
const transports = [];

// Console transport (always active)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    level: process.env.LOG_LEVEL || 'info'
  })
);

// File transports for non-AWS environments
if (process.env.NODE_ENV !== 'production' || !process.env.AWS_REGION) {
  const logDir = path.join(__dirname, '../../logs');
  const fs = require('fs');

  // Create logs directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  );
}

// CloudWatch transport for AWS production environment
if (process.env.NODE_ENV === 'production' && process.env.AWS_REGION) {
  try {
    const WinstonCloudWatch = require('winston-cloudwatch');
    const date = new Date().toISOString().split('T')[0];

    transports.push(
      new WinstonCloudWatch({
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME || constants.AWS.CLOUDWATCH_LOG_GROUP,
        logStreamName: `${process.env.NODE_ENV}-${date}-${process.env.HOSTNAME || 'unknown'}`,
        awsRegion: process.env.AWS_REGION || constants.AWS.REGION,
        jsonMessage: true,
        retentionInDays: 14,
        level: process.env.LOG_LEVEL || 'info',
        awsOptions: {
          // Will use IAM role credentials in AWS environment
          credentials: process.env.AWS_ACCESS_KEY_ID ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          } : undefined
        }
      })
    );
  } catch (error) {
    console.error('Failed to initialize CloudWatch logging:', error.message);
  }
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'micasa-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log')
    })
  ]
});

// Create stream for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Add helper methods for common logging scenarios
logger.logRequest = (req, message) => {
  logger.info(message, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id
  });
};

logger.logError = (error, context = {}) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  });
};

logger.logDatabaseQuery = (query, duration) => {
  if (process.env.LOG_LEVEL === 'debug') {
    logger.debug('Database query executed', {
      query,
      duration: `${duration}ms`
    });
  }
};

logger.logAuthentication = (userId, action, success, details = {}) => {
  logger.info(`Authentication ${action}`, {
    userId,
    success,
    action,
    ...details
  });
};

module.exports = logger;
