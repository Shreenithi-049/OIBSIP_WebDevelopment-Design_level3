import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { addToCart } from '../store/slices/cartSlice';
import Spinner from '../components/common/Spinner';

const PizzaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const [pizza, setPizza] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    api.get(`/pizzas/${id}`).then((res) => setPizza(res.data.pizza)).catch(() => navigate('/'));
  }, [id]);

  if (!pizza) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const handleAdd = () => {
    if (!token) return navigate('/login');
    dispatch(addToCart({ pizzaId: pizza._id, name: pizza.name, image: pizza.image, price: pizza.basePrice, quantity: qty }));
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-primary font-semibold mb-6 hover:underline">← Back</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <img src={pizza.image} alt={pizza.name} className="w-full rounded-3xl shadow-2xl object-cover h-80 md:h-96"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600'; }} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              {pizza.isFeatured && <span className="bg-accent text-app-text text-xs font-bold px-2 py-1 rounded-full">⭐ Featured</span>}
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${pizza.category === 'veg' ? 'bg-green-100 text-green-700' : pizza.category === 'non-veg' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {pizza.category === 'veg' ? '🟢 Veg' : pizza.category === 'non-veg' ? '🔴 Non-Veg' : '🌿 Vegan'}
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-app-text mb-3">{pizza.name}</h1>
            <p className="text-gray-500 text-lg mb-4">{pizza.description}</p>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-accent text-xl">★</span>
              <span className="font-bold text-app-text">{pizza.ratings}</span>
              <span className="text-gray-400 text-sm">rating</span>
            </div>
            <div className="text-4xl font-extrabold text-primary mb-8">₹{pizza.basePrice}</div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-xl font-bold text-app-text hover:text-secondary">−</button>
                <span className="font-bold text-app-text text-lg w-8 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="text-xl font-bold text-app-text hover:text-primary">+</button>
              </div>
              <span className="text-gray-500 text-sm">Total: <strong className="text-primary">₹{pizza.basePrice * qty}</strong></span>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} className="btn-secondary text-lg py-4">
              🛒 Add to Cart
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetailPage;
