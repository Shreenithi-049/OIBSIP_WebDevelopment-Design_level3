import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const categoryBadge = (cat) => {
  if (cat === 'veg') return <span className="badge-veg">🟢 Veg</span>;
  if (cat === 'non-veg') return <span className="badge-nonveg">🔴 Non-Veg</span>;
  return <span className="badge-vegan">🌿 Vegan</span>;
};

const PizzaCard = ({ pizza }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!token) { navigate('/login'); return; }
    const result = await dispatch(addToCart({
      pizzaId: pizza._id,
      name: pizza.name,
      image: pizza.image,
      price: pizza.basePrice,
      quantity: 1,
    }));
    if (addToCart.rejected.match(result)) {
      toast.error(result.payload || 'Failed to add to cart. Please try again.');
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="card overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/pizza/${pizza._id}`)}
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={pizza.image}
          alt={pizza.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500'; }}
        />
        {pizza.isFeatured && (
          <span className="absolute top-2 left-2 bg-accent text-app-text text-xs font-bold px-2 py-1 rounded-full">
            ⭐ Featured
          </span>
        )}
        <div className="absolute top-2 right-2">{categoryBadge(pizza.category)}</div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-app-text text-lg mb-1 truncate">{pizza.name}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{pizza.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-primary font-bold text-xl">₹{pizza.basePrice}</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-accent text-sm">★</span>
              <span className="text-gray-500 text-xs">{pizza.ratings}</span>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="btn-secondary text-sm px-4 py-2"
          >
            Add +
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default PizzaCard;
