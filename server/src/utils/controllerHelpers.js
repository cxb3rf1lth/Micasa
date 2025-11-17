/**
 * Common helper functions for controllers
 */

/**
 * Get household ID for a user
 * If user has a partner, creates a consistent household ID from both user IDs
 * Otherwise returns just the user ID
 *
 * @param {Object} user - User object with _id and optional partnerId
 * @returns {string} Household ID
 */
const getHouseholdId = (user) => {
  return user.partnerId
    ? [user._id.toString(), user.partnerId.toString()].sort().join('-')
    : user._id.toString();
};

/**
 * Verify that an item belongs to the user's household
 *
 * @param {Object} item - Item to verify
 * @param {string} householdId - Expected household ID
 * @returns {boolean} True if item belongs to household
 */
const verifyHouseholdAccess = (item, householdId) => {
  return item && item.householdId === householdId;
};

/**
 * Send standardized error response
 *
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Error} error - Optional error object for logging
 */
const sendError = (res, status, message, error = null) => {
  if (error) {
    console.error(message, error);
  }
  res.status(status).json({ message });
};

/**
 * Emit socket event for real-time updates
 *
 * @param {Object} req - Express request object (must have app with 'io' set)
 * @param {string} householdId - Household ID to emit to
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const emitSocketEvent = (req, householdId, event, data) => {
  const io = req.app.get('io');
  if (io) {
    io.to(householdId).emit(event, { ...data, householdId });
  }
};

module.exports = {
  getHouseholdId,
  verifyHouseholdAccess,
  sendError,
  emitSocketEvent
};
