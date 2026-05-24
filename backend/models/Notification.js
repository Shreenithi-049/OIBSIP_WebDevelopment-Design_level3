const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ['low_stock', 'new_order', 'order_update'], required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
