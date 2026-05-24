const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['veg', 'non-veg', 'vegan'], required: true },
  size: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
  basePrice: { type: Number, required: true },
  image: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  ratings: { type: Number, default: 4.5 },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('Pizza', pizzaSchema);
