const Pizza = require('../models/Pizza');

// @GET /api/pizzas
exports.getPizzas = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = { isAvailable: true };
    if (category && category !== 'all') filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const pizzas = await Pizza.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    res.json({ success: true, pizzas });
  } catch (err) { next(err); }
};

// @GET /api/pizzas/:id
exports.getPizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findById(req.params.id);
    if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found' });
    res.json({ success: true, pizza });
  } catch (err) { next(err); }
};

// @POST /api/pizzas (admin)
exports.createPizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.create(req.body);
    res.status(201).json({ success: true, pizza });
  } catch (err) { next(err); }
};

// @PUT /api/pizzas/:id (admin)
exports.updatePizza = async (req, res, next) => {
  try {
    const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!pizza) return res.status(404).json({ success: false, message: 'Pizza not found' });
    res.json({ success: true, pizza });
  } catch (err) { next(err); }
};

// @DELETE /api/pizzas/:id (admin)
exports.deletePizza = async (req, res, next) => {
  try {
    await Pizza.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pizza deleted' });
  } catch (err) { next(err); }
};
