const Cart = require('../models/Cart');

// @GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.pizzaId', 'name image');
    res.json({ success: true, cart: cart || { items: [], totalPrice: 0 } });
  } catch (err) { next(err); }
};

// @POST /api/cart/add
exports.addToCart = async (req, res, next) => {
  try {
    const { pizzaId, isCustom, customDetails, name, image, price, quantity = 1 } = req.body;

    if (!price) {
      return res.status(400).json({ success: false, message: 'Price is required.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    if (!isCustom && pizzaId) {
      const existingIdx = cart.items.findIndex(i => i.pizzaId?.toString() === pizzaId && !i.isCustom);
      if (existingIdx > -1) {
        cart.items[existingIdx].quantity += quantity;
      } else {
        cart.items.push({ pizzaId, isCustom: false, name, image, price, quantity });
      }
    } else {
      cart.items.push({ isCustom: true, customDetails, name, image, price, quantity });
    }

    await cart.save();
    // Re-fetch with populated pizzaId so frontend gets full data
    const populated = await Cart.findById(cart._id);
    res.json({ success: true, cart: populated });
  } catch (err) { next(err); }
};

// @PUT /api/cart/update/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    if (quantity <= 0) {
      cart.items.pull(req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// @DELETE /api/cart/remove/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

// @DELETE /api/cart/clear
exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], totalPrice: 0 });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) { next(err); }
};
