const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socket');

// Map custom pizza ingredient names → inventory names (case-insensitive match)
const deductInventory = async (items, io) => {
  const updatedItems = [];
  const lowStockItems = [];

  for (const item of items) {
    const qty = item.quantity || 1;

    if (item.isCustom && item.customDetails) {
      // Deduct each ingredient used in the custom pizza
      const { base, sauce, cheese, veggies = [], meat } = item.customDetails;
      const ingredients = [
        { category: 'base',   name: base },
        { category: 'sauce',  name: sauce },
        { category: 'cheese', name: cheese },
        ...veggies.map((v) => ({ category: 'veggie', name: v })),
        ...(meat && meat !== 'None' ? [{ category: 'meat', name: meat }] : []),
      ];

      for (const ing of ingredients) {
        if (!ing.name) continue;
        const inv = await Inventory.findOneAndUpdate(
          { name: { $regex: new RegExp(`^${ing.name}$`, 'i') }, category: ing.category },
          { $inc: { quantity: -qty } },
          { new: true }
        );
        if (inv) {
          updatedItems.push(inv);
          if (inv.quantity <= inv.threshold) lowStockItems.push(inv);
        }
      }
    } else {
      // For regular pizzas deduct 1 unit of each base ingredient per pizza ordered
      // (uses a generic 'base' deduction — adjust to your business logic)
      const inv = await Inventory.findOneAndUpdate(
        { category: 'base', isAvailable: true },
        { $inc: { quantity: -qty } },
        { new: true, sort: { quantity: -1 } } // deduct from highest stock first
      );
      if (inv) {
        updatedItems.push(inv);
        if (inv.quantity <= inv.threshold) lowStockItems.push(inv);
      }
    }
  }

  // Emit live inventory update to admin
  if (updatedItems.length > 0) {
    io.to('admin-room').emit('inventory-updated', { items: updatedItems });
  }

  // Emit low stock alerts
  for (const item of lowStockItems) {
    io.to('admin-room').emit('low-stock-alert', { item });
  }
};

// @POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, totalAmount, deliveryAddress, razorpayOrderId } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      razorpayOrderId,
      statusHistory: [{ status: 'Order Received' }],
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });

    const io = getIO();

    // Deduct inventory and emit live updates
    await deductInventory(items, io);

    // Create notification for admin
    const notification = await Notification.create({
      type: 'new_order',
      message: `New order #${order._id.toString().slice(-6)} from ${req.user.name}`,
      relatedId: order._id,
    });

    io.to('admin-room').emit('new-order', { order, notification });

    res.status(201).json({ success: true, order });
  } catch (err) { next(err); }
};

// @GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @GET /api/orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) { next(err); }
};

// @PUT /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    // Emit real-time update to user
    const io = getIO();
    io.to(`user-${order.user.toString()}`).emit('order-status-update', {
      orderId: order._id,
      status,
      timestamp: new Date(),
    });

    res.json({ success: true, order });
  } catch (err) { next(err); }
};

// @GET /api/orders/admin/stats (admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalOrders, totalUsers, revenueData, recentOrders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalUsers,
        totalRevenue: revenueData[0]?.total || 0,
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (err) { next(err); }
};
