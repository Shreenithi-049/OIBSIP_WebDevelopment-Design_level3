import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Meat'];

const OPTIONS = {
  Base: [
    { name: 'Thin Crust', price: 30, icon: '🫓' },
    { name: 'Thick Crust', price: 40, icon: '🍞' },
    { name: 'Cheese Burst', price: 60, icon: '🧀' },
    { name: 'Whole Wheat', price: 45, icon: '🌾' },
    { name: 'Gluten Free', price: 70, icon: '🌿' },
  ],
  Sauce: [
    { name: 'Tomato Basil', price: 20, icon: '🍅' },
    { name: 'BBQ Sauce', price: 25, icon: '🔥' },
    { name: 'Pesto', price: 35, icon: '🌿' },
    { name: 'Alfredo', price: 30, icon: '🤍' },
    { name: 'Spicy Arrabbiata', price: 25, icon: '🌶️' },
  ],
  Cheese: [
    { name: 'Mozzarella', price: 40, icon: '🧀' },
    { name: 'Cheddar', price: 45, icon: '🟡' },
    { name: 'Parmesan', price: 50, icon: '✨' },
    { name: 'Vegan Cheese', price: 60, icon: '🌱' },
  ],
  Veggies: [
    { name: 'Bell Peppers', price: 15, icon: '🫑' },
    { name: 'Mushrooms', price: 20, icon: '🍄' },
    { name: 'Olives', price: 25, icon: '🫒' },
    { name: 'Onions', price: 10, icon: '🧅' },
    { name: 'Jalapeños', price: 20, icon: '🌶️' },
  ],
  Meat: [
    { name: 'None', price: 0, icon: '🚫' },
    { name: 'Pepperoni', price: 50, icon: '🍖' },
    { name: 'Chicken', price: 55, icon: '🍗' },
    { name: 'Bacon', price: 60, icon: '🥓' },
    { name: 'Sausage', price: 55, icon: '🌭' },
  ],
};

const BASE_PIZZA_PRICE = 149;

const CustomPizzaPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({
    Base: null, Sauce: null, Cheese: null, Veggies: [], Meat: null,
  });

  const calcPrice = () => {
    let price = BASE_PIZZA_PRICE;
    if (selections.Base) price += selections.Base.price;
    if (selections.Sauce) price += selections.Sauce.price;
    if (selections.Cheese) price += selections.Cheese.price;
    selections.Veggies.forEach((v) => (price += v.price));
    if (selections.Meat && selections.Meat.name !== 'None') price += selections.Meat.price;
    return price;
  };

  const handleSelect = (option) => {
    const currentStep = STEPS[step];
    if (currentStep === 'Veggies') {
      const exists = selections.Veggies.find((v) => v.name === option.name);
      setSelections((prev) => ({
        ...prev,
        Veggies: exists
          ? prev.Veggies.filter((v) => v.name !== option.name)
          : [...prev.Veggies, option],
      }));
    } else {
      setSelections((prev) => ({ ...prev, [currentStep]: option }));
    }
  };

  const isSelected = (option) => {
    const currentStep = STEPS[step];
    if (currentStep === 'Veggies') return selections.Veggies.some((v) => v.name === option.name);
    return selections[currentStep]?.name === option.name;
  };

  const canProceed = () => {
    const currentStep = STEPS[step];
    if (currentStep === 'Veggies') return true; // optional
    return selections[currentStep] !== null;
  };

  const handleAddToCart = () => {
    if (!selections.Base || !selections.Sauce || !selections.Cheese) {
      return toast.error('Please complete all required steps');
    }
    const name = `Custom Pizza (${selections.Base.name})`;
    dispatch(addToCart({
      isCustom: true,
      customDetails: {
        base: selections.Base.name,
        sauce: selections.Sauce.name,
        cheese: selections.Cheese.name,
        veggies: selections.Veggies.map((v) => v.name),
        meat: selections.Meat?.name || 'None',
      },
      name,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
      price: calcPrice(),
      quantity: 1,
    }));
    navigate('/cart');
  };

  const currentStep = STEPS[step];
  const options = OPTIONS[currentStep];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-app-text">🍕 Build Your Pizza</h1>
          <p className="text-gray-500 mt-2">Customize every layer of your perfect pizza</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  i === step ? 'bg-primary text-white shadow-lg' :
                  i < step ? 'bg-green-500 text-white cursor-pointer' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {i < step ? '✓' : i + 1} {s}
              </button>
              {i < STEPS.length - 1 && <div className={`w-6 h-0.5 ${i < step ? 'bg-green-500' : 'bg-gray-300'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Options */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-app-text mb-1">
                  Choose {currentStep}
                  {currentStep === 'Veggies' && <span className="text-sm font-normal text-gray-500 ml-2">(Select multiple)</span>}
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  {currentStep === 'Meat' ? 'Optional - skip if vegetarian' : 'Required'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {options.map((option) => (
                    <motion.button
                      key={option.name}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelect(option)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        isSelected(option)
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <p className="font-semibold text-app-text text-sm">{option.name}</p>
                      <p className="text-primary text-xs font-bold mt-1">
                        {option.price > 0 ? `+₹${option.price}` : 'Free'}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="btn-accent flex-1">← Back</button>
              )}
              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  disabled={!canProceed()}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  className="btn-secondary flex-1"
                >
                  🛒 Add to Cart
                </motion.button>
              )}
            </div>
          </div>

          {/* Live Preview */}
          <div className="card p-6 h-fit sticky top-24">
            <h3 className="font-bold text-app-text text-lg mb-4">🍕 Your Pizza</h3>
            <div className="relative mb-4">
              <img
                src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400"
                alt="Pizza"
                className="w-full rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-xl" />
            </div>

            <div className="space-y-2 text-sm">
              {['Base', 'Sauce', 'Cheese'].map((key) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-500">{key}:</span>
                  <span className={`font-semibold ${selections[key] ? 'text-app-text' : 'text-gray-300'}`}>
                    {selections[key]?.name || 'Not selected'}
                  </span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-500">Veggies:</span>
                <span className="font-semibold text-app-text text-right max-w-[120px]">
                  {selections.Veggies.length > 0 ? selections.Veggies.map((v) => v.name).join(', ') : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Meat:</span>
                <span className="font-semibold text-app-text">{selections.Meat?.name || 'None'}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-app-text">Total Price</span>
                <motion.span
                  key={calcPrice()}
                  initial={{ scale: 1.3, color: '#E63946' }}
                  animate={{ scale: 1, color: '#2A9D8F' }}
                  className="text-2xl font-extrabold text-primary"
                >
                  ₹{calcPrice()}
                </motion.span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPizzaPage;
