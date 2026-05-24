const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
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
    price: Number,
    quantity: Number,
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'],
    default: 'Order Received',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
  }],
  paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  razorpayOrderId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
