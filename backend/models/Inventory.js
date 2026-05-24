const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'],
    required: true,
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 100 },
  unit: { type: String, default: 'units' },
  threshold: { type: Number, default: 20 }, // low stock alert threshold
  pricePerUnit: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
