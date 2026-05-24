require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Pizza = require('./models/Pizza');
const Inventory = require('./models/Inventory');

const connectDB = require('./config/db');

const pizzas = [
  { name: 'Margherita Classic', description: 'Fresh tomato sauce, mozzarella, basil', category: 'veg', basePrice: 249, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500', isFeatured: true, tags: ['bestseller', 'classic'] },
  { name: 'Pepperoni Feast', description: 'Loaded with premium pepperoni and cheese', category: 'non-veg', basePrice: 349, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500', isFeatured: true, tags: ['bestseller'] },
  { name: 'BBQ Chicken', description: 'Smoky BBQ sauce with grilled chicken', category: 'non-veg', basePrice: 379, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500', tags: ['spicy'] },
  { name: 'Veggie Supreme', description: 'Bell peppers, mushrooms, olives, onions', category: 'veg', basePrice: 299, image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500', tags: ['healthy'] },
  { name: 'Paneer Tikka', description: 'Indian spiced paneer with tandoori sauce', category: 'veg', basePrice: 329, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500', isFeatured: true, tags: ['indian', 'spicy'] },
  { name: 'Farmhouse', description: 'Fresh veggies on a crispy thin crust', category: 'veg', basePrice: 279, image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500', tags: ['healthy'] },
  { name: 'Chicken Tikka', description: 'Spicy chicken tikka with mint chutney base', category: 'non-veg', basePrice: 369, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500', tags: ['spicy', 'indian'] },
  { name: 'Vegan Delight', description: 'Plant-based cheese with roasted veggies', category: 'vegan', basePrice: 319, image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=500', tags: ['vegan', 'healthy'] },
];

const inventory = [
  // Bases
  { category: 'base', name: 'Thin Crust', quantity: 100, unit: 'units', pricePerUnit: 30 },
  { category: 'base', name: 'Thick Crust', quantity: 80, unit: 'units', pricePerUnit: 40 },
  { category: 'base', name: 'Cheese Burst', quantity: 60, unit: 'units', pricePerUnit: 60 },
  { category: 'base', name: 'Whole Wheat', quantity: 50, unit: 'units', pricePerUnit: 45 },
  { category: 'base', name: 'Gluten Free', quantity: 15, unit: 'units', pricePerUnit: 70 },
  // Sauces
  { category: 'sauce', name: 'Tomato Basil', quantity: 90, unit: 'units', pricePerUnit: 20 },
  { category: 'sauce', name: 'BBQ Sauce', quantity: 75, unit: 'units', pricePerUnit: 25 },
  { category: 'sauce', name: 'Pesto', quantity: 40, unit: 'units', pricePerUnit: 35 },
  { category: 'sauce', name: 'Alfredo', quantity: 55, unit: 'units', pricePerUnit: 30 },
  { category: 'sauce', name: 'Spicy Arrabbiata', quantity: 10, unit: 'units', pricePerUnit: 25 },
  // Cheese
  { category: 'cheese', name: 'Mozzarella', quantity: 120, unit: 'units', pricePerUnit: 40 },
  { category: 'cheese', name: 'Cheddar', quantity: 80, unit: 'units', pricePerUnit: 45 },
  { category: 'cheese', name: 'Parmesan', quantity: 60, unit: 'units', pricePerUnit: 50 },
  { category: 'cheese', name: 'Vegan Cheese', quantity: 18, unit: 'units', pricePerUnit: 60 },
  // Veggies
  { category: 'veggie', name: 'Bell Peppers', quantity: 100, unit: 'units', pricePerUnit: 15 },
  { category: 'veggie', name: 'Mushrooms', quantity: 90, unit: 'units', pricePerUnit: 20 },
  { category: 'veggie', name: 'Olives', quantity: 70, unit: 'units', pricePerUnit: 25 },
  { category: 'veggie', name: 'Onions', quantity: 110, unit: 'units', pricePerUnit: 10 },
  { category: 'veggie', name: 'Jalapeños', quantity: 12, unit: 'units', pricePerUnit: 20 },
  // Meats
  { category: 'meat', name: 'Pepperoni', quantity: 80, unit: 'units', pricePerUnit: 50 },
  { category: 'meat', name: 'Chicken', quantity: 70, unit: 'units', pricePerUnit: 55 },
  { category: 'meat', name: 'Bacon', quantity: 50, unit: 'units', pricePerUnit: 60 },
  { category: 'meat', name: 'Sausage', quantity: 8, unit: 'units', pricePerUnit: 55 },
];

const seed = async () => {
  await connectDB();
  await User.deleteMany();
  await Pizza.deleteMany();
  await Inventory.deleteMany();

  // Create admin — plain password, pre('save') hook will hash it
  await User.create({
    name: 'Admin',
    email: 'admin@pizzahub.com',
    password: 'Admin@123',
    role: 'admin',
    isVerified: true,
  });

  // Create test user — plain password, pre('save') hook will hash it
  await User.create({
    name: 'Test User',
    email: 'user@pizzahub.com',
    password: 'User@123',
    role: 'user',
    isVerified: true,
  });

  await Pizza.insertMany(pizzas);
  await Inventory.insertMany(inventory);

  console.log('✅ Database seeded successfully!');
  console.log('Admin: admin@pizzahub.com / Admin@123');
  console.log('User:  user@pizzahub.com  / User@123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
