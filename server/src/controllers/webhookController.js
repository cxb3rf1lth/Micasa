const Webhook = require('../models/Webhook');
const { getHouseholdId, verifyHouseholdAccess, sendError } = require('../utils/controllerHelpers');

const getWebhooks = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);
    const webhooks = Webhook.findByHousehold(householdId);
    res.json(webhooks);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const createWebhook = async (req, res) => {
  try {
    const householdId = getHouseholdId(req.user);

    const webhookData = {
      ...req.body,
      householdId,
      createdBy: req.user._id
    };

    const webhook = await Webhook.create(webhookData);
    res.status(201).json(webhook);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);

    // Verify webhook belongs to household
    const existingWebhook = Webhook.findById(id);
    if (!verifyHouseholdAccess(existingWebhook, householdId)) {
      return sendError(res, 404, 'Webhook not found');
    }

    const webhook = Webhook.update(id, req.body);

    if (!webhook) {
      return sendError(res, 404, 'Webhook not found');
    }

    res.json(webhook);
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const householdId = getHouseholdId(req.user);

    // Verify webhook belongs to household
    const existingWebhook = Webhook.findById(id);
    if (!verifyHouseholdAccess(existingWebhook, householdId)) {
      return sendError(res, 404, 'Webhook not found');
    }

    const deleted = Webhook.delete(id);

    if (!deleted) {
      return sendError(res, 404, 'Webhook not found');
    }

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    sendError(res, 500, 'Server error', error);
  }
};

module.exports = {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook
};
