const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');

const isRazorpayConfigured = () => {
  const { RAZORPAY_KEY_ID: id, RAZORPAY_KEY_SECRET: secret } = process.env;
  return id && secret && !id.includes('your_key') && !secret.includes('your_razorpay');
};

// @POST /api/payment/create-order
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ success: false, message: 'Invalid amount' });

    // DEV BYPASS: if Razorpay keys are not set, return a mock order so the
    // full cart → order flow can be tested without real credentials.
    if (!isRazorpayConfigured()) {
      const mockOrderId = `mock_order_${Date.now()}`;
      await Payment.create({
        user: req.user._id,
        razorpayOrderId: mockOrderId,
        amount,
        status: 'pending',
      });
      return res.json({
        success: true,
        devMode: true, // frontend uses this to skip Razorpay modal
        order: { id: mockOrderId, amount: Math.round(amount * 100), currency: 'INR' },
        key: 'dev_mode',
      });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    await Payment.create({
      user: req.user._id,
      razorpayOrderId: order.id,
      amount,
      status: 'pending',
    });

    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { next(err); }
};

// @POST /api/payment/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // DEV BYPASS: skip signature check for mock orders
    if (razorpay_order_id?.startsWith('mock_order_')) {
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { razorpayPaymentId: razorpay_payment_id, razorpaySignature: 'dev_bypass', status: 'success' },
        { new: true }
      );
      return res.json({ success: true, payment });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Payment verification failed' });

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'success' },
      { new: true }
    );

    res.json({ success: true, payment });
  } catch (err) { next(err); }
};
