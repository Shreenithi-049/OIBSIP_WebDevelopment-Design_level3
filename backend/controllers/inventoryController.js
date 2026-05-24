const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socket');

// @GET /api/inventory
exports.getInventory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await Inventory.find(filter).sort({ category: 1, name: 1 });
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

// @POST /api/inventory (admin)
exports.createInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
};

// @PUT /api/inventory/:id (admin)
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const io = getIO();

    // Always broadcast the updated item so all admin tabs refresh live
    io.to('admin-room').emit('inventory-updated', { items: [item] });

    // Also fire low-stock alert if applicable
    if (item.quantity <= item.threshold) {
      io.to('admin-room').emit('low-stock-alert', { item });
    }

    res.json({ success: true, item });
  } catch (err) { next(err); }
};

// @DELETE /api/inventory/:id (admin)
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) { next(err); }
};

// @GET /api/inventory/low-stock (admin)
exports.getLowStockItems = async (req, res, next) => {
  try {
    const items = await Inventory.find({ $expr: { $lte: ['$quantity', '$threshold'] } });
    res.json({ success: true, items });
  } catch (err) { next(err); }
};
