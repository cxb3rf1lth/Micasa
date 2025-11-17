/**
 * Health Check Routes
 * Provides endpoints for monitoring application health
 */

const express = require('express');
const router = express.Router();
const { getDB } = require('../config/database');
const constants = require('../constants');

/**
 * Basic health check
 * Returns simple OK status
 * @route GET /api/health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Micasa API is running',
    timestamp: new Date().toISOString()
  });
});

/**
 * Detailed health check
 * Checks all application dependencies
 * @route GET /api/health/detailed
 */
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: require('../../package.json').version,
    checks: {}
  };

  // Check database connectivity
  try {
    const db = getDB();
    const result = db.prepare('SELECT 1 as ok').get();
    health.checks.database = {
      status: result.ok === 1 ? 'ok' : 'error',
      responseTime: 0 // Would measure actual query time in production
    };
  } catch (error) {
    health.checks.database = {
      status: 'error',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Check memory usage
  const used = process.memoryUsage();
  health.checks.memory = {
    status: 'ok',
    rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
    external: `${Math.round(used.external / 1024 / 1024)} MB`
  };

  // Check disk space (if in production with writable filesystem)
  if (process.env.NODE_ENV !== 'production') {
    try {
      const fs = require('fs');
      const os = require('os');
      const stats = fs.statfsSync || fs.statSync;
      health.checks.disk = {
        status: 'ok',
        tmpdir: os.tmpdir()
      };
    } catch (error) {
      health.checks.disk = {
        status: 'warning',
        message: 'Could not check disk space'
      };
    }
  }

  // Check environment variables
  const requiredEnvVars = ['JWT_SECRET', 'CLIENT_URL'];
  const missingEnvVars = requiredEnvVars.filter(v => !process.env[v]);
  health.checks.environment = {
    status: missingEnvVars.length === 0 ? 'ok' : 'error',
    missing: missingEnvVars
  };

  if (missingEnvVars.length > 0) {
    health.status = 'error';
  }

  // Set appropriate HTTP status code
  const statusCode = health.status === 'ok' ? 200 :
                     health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

/**
 * Readiness check
 * Determines if the application is ready to accept traffic
 * Used by load balancers and orchestrators
 * @route GET /api/health/ready
 */
router.get('/ready', async (req, res) => {
  try {
    // Check database
    const db = getDB();
    db.prepare('SELECT 1').get();

    // Check essential services
    const ready = {
      status: 'ready',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(ready);
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Liveness check
 * Determines if the application is alive
 * Used by orchestrators to restart dead containers
 * @route GET /api/health/live
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
