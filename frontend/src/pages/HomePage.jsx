import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CardSkeleton } from '../components/common/Spinner';

const categories = ['all', 'veg', 'non-veg', 'vegan'];

const HeroBanner = () => (
  <section className="relative overflow-hidden bg-gradient-to-br from-app-text via-primary to-secondary rounded-3xl mx-4 my-6 p-8 md:p-14 text-white">
    <div className="relative z-10 max-w-xl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="bg-accent text-app-text text-sm font-bold px-3 py-1 rounded-full mb-4 inline-block">
          🔥 Hot & Fresh Pizzas
        </span>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Craving a <span className="text-accent">Perfect</span> Pizza?
        </h1>

        <p className="text-lg text-white/80 mb-8">
          Handcrafted with love, delivered to your door in 30 minutes or less!
        </p>

        <div className="flex gap-4 flex-wrap">
          <Link to="/custom-pizza">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-accent text-app-text font-bold px-8 py-3 rounded-xl hover:bg-hover hover:text-white transition-all"
            >
              🍕 Build Your Pizza
            </motion.button>
          </Link>

          <a href="#menu">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 backdrop-blur text-white font-bold px-8 py-3 rounded-xl hover:bg-white/30 transition-all border border-white/30"
            >
              View Menu
            </motion.button>
          </a>
        </div>
      </motion.div>
    </div>

    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute -right-10 -top-10 text-[180px] opacity-20 select-none"
    >
      🍕
    </motion.div>

    <motion.div
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="absolute right-20 bottom-4 text-6xl opacity-40 select-none"
    >
      🍕
    </motion.div>
  </section>
);

const PromoStrip = () => (
  <div className="bg-secondary text-white py-3 overflow-hidden">
    <motion.div
      animate={{ x: [0, -1000] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="flex gap-16 whitespace-nowrap text-sm font-semibold"
    >
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <span key={i} className="flex gap-16">
            <span>🍕 Free delivery on orders above ₹499</span>
            <span>⚡ 30-minute delivery guarantee</span>
            <span>🎉 Use code PIZZA20 for 20% off</span>
            <span>🌟 Fresh ingredients daily</span>
          </span>
        ))}
    </motion.div>
  </div>
);

const HomePage = () => {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);

      try {
        const params = {};

        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }

        if (search) {
          params.search = search;
        }

        const res = await api.get('/pizzas', { params });

        console.log('FULL RESPONSE:', res);

        const pizzaData =
          res?.data?.pizzas ||
          res?.pizzas ||
          [];

        console.log('FINAL PIZZA DATA:', pizzaData);

        setPizzas(pizzaData);
      } catch (err) {
        console.error('Pizza Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchPizzas, 300);

    return () => clearTimeout(debounce);
  }, [activeCategory, search]);

  return (
    <div className="min-h-screen bg-background">
      <PromoStrip />
      <HeroBanner />

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {[
          { icon: '🚀', title: '30 Min Delivery', desc: 'Lightning fast' },
          { icon: '🌿', title: 'Fresh Ingredients', desc: 'Daily sourced' },
          { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Crafted with love' },
          { icon: '💳', title: 'Secure Payment', desc: 'Razorpay powered' },
        ].map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -4 }}
            className="card p-4 text-center"
          >
            <div className="text-3xl mb-2">{f.icon}</div>
            <p className="font-bold text-app-text text-sm">{f.title}</p>
            <p className="text-gray-500 text-xs">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Menu */}
      <section id="menu" className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-app-text">
              Our Menu 🍕
            </h2>

            <p className="text-gray-500 mt-1">
              Choose from our handcrafted selection
            </p>
          </div>

          <input
            type="text"
            placeholder="🔍 Search pizzas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-xs"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all capitalize ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-white text-app-text hover:bg-primary/10 border border-gray-200'
              }`}
            >
              {cat === 'all'
                ? '🍕 All'
                : cat === 'veg'
                ? '🟢 Veg'
                : cat === 'non-veg'
                ? '🔴 Non-Veg'
                : '🌿 Vegan'}
            </motion.button>
          ))}
        </div>

        {/* Pizza Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <CardSkeleton key={i} />
              ))}
          </div>
        ) : pizzas.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">🍕</div>

            <h3 className="text-2xl font-bold text-app-text mb-2">
              No pizzas found
            </h3>

            <p className="text-gray-500">
              Try a different category or search term
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {pizzas.map((pizza, i) => (
              <motion.div
                key={pizza._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden p-4"
              >
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />

                <h3 className="text-xl font-bold text-app-text mb-2">
                  {pizza.name}
                </h3>

                <p className="text-gray-500 text-sm mb-3">
                  {pizza.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    ₹{pizza.basePrice}
                  </span>

                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-all">
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default HomePage;