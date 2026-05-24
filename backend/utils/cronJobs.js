const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const { sendEmail, lowStockTemplate } = require('../utils/email');

// Run every day at 8 AM
const startLowStockCron = () => {
  cron.schedule('0 8 * * *', async () => {
    try {
      const lowItems = await Inventory.find({ $expr: { $lte: ['$quantity', '$threshold'] } });
      if (lowItems.length > 0) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: '⚠️ PizzaHub Low Stock Alert',
          html: lowStockTemplate(lowItems),
        });
        console.log(`Low stock alert sent for ${lowItems.length} items`);
      }
    } catch (err) {
      console.error('Cron job error:', err.message);
    }
  });
  console.log('Low stock cron job started');
};

module.exports = startLowStockCron;
