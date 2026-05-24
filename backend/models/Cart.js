const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  pizzaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' },
  isCustom: { type: Boolean, default: false },
  customDetails: {
    base: String,
    sauce: String,
    cheese: String,
    veggies: [String],
    meat: String,
  },
  name: String,
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
  totalPrice: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate total
cartSchema.pre('save', function (next) {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
