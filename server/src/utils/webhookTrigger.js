const axios = require('axios');
const crypto = require('crypto');
const Webhook = require('../models/Webhook');

const triggerWebhooks = async (householdId, event, data) => {
  try {
    const webhooks = Webhook.findActiveByHouseholdAndEvent(householdId, event);
    
    if (webhooks.length === 0) {
      return;
    }
    
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Trigger all matching webhooks
    const promises = webhooks.map(async (webhook) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'X-Micasa-Event': event
        };
        
        // Add signature if secret is set
        if (webhook.secret) {
          const signature = crypto
            .createHmac('sha256', webhook.secret)
            .update(JSON.stringify(payload))
            .digest('hex');
          headers['X-Micasa-Signature'] = `sha256=${signature}`;
        }
        
        await axios.post(webhook.url, payload, {
          headers,
          timeout: 5000 // 5 second timeout
        });
        
        console.log(`Webhook ${webhook.id} triggered successfully for event: ${event}`);
      } catch (error) {
        console.error(`Failed to trigger webhook ${webhook.id}:`, error.message);
      }
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
};

module.exports = { triggerWebhooks };
