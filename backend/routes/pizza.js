const express = require('express');
const router = express.Router();
const { getPizzas, getPizza, createPizza, updatePizza, deletePizza } = require('../controllers/pizzaController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getPizzas);
router.get('/:id', getPizza);
router.post('/', protect, adminOnly, createPizza);
router.put('/:id', protect, adminOnly, updatePizza);
router.delete('/:id', protect, adminOnly, deletePizza);

module.exports = router;
