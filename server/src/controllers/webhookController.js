const Webhook = require('../models/Webhook');

const getWebhooks = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    
    const webhooks = Webhook.findByHousehold(householdId);
    res.json(webhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createWebhook = async (req, res) => {
  try {
    const userId = req.user.id;
    const householdId = `household_${userId}`;
    
    const webhookData = {
      ...req.body,
      householdId,
      createdBy: userId
    };
    
    const webhook = await Webhook.create(webhookData);
    res.status(201).json(webhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const webhook = Webhook.update(id, req.body);
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.json(webhook);
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = Webhook.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook
};
