import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, loading } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const [address, setAddress] = useState(user?.address || '');
  const [paying, setPaying] = useState(false);

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  // Consistent final amount used in both UI and payment
  const tax = Math.round(totalPrice * 0.05);
  const finalAmount = totalPrice + tax;

  const handlePayment = async () => {
    if (!address.trim()) return toast.error('Please enter delivery address');
    if (items.length === 0) return toast.error('Cart is empty');

    setPaying(true);
    try {
      const { data } = await api.post('/payment/create-order', { amount: finalAmount });
      const { order, key, devMode } = data;

      // DEV MODE: Razorpay keys not configured — skip modal, place order directly
      if (devMode) {
        toast('Dev mode: skipping Razorpay modal', { icon: '🛠️' });
        await api.post('/payment/verify', {
          razorpay_order_id: order.id,
          razorpay_payment_id: `dev_pay_${Date.now()}`,
          razorpay_signature: 'dev_bypass',
        });
        const orderRes = await api.post('/orders', {
          items,
          totalAmount: finalAmount,
          deliveryAddress: address,
          razorpayOrderId: order.id,
        });
        toast.success('Order placed! 🍕');
        navigate(`/order-confirmation/${orderRes.data.order._id}`);
        setPaying(false);
        return;
      }

      if (!window.Razorpay) {
        setPaying(false);
        return toast.error('Razorpay SDK not loaded. Refresh the page.');
      }

      const options = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'PizzaHub',
        description: 'Pizza Order Payment',
        order_id: order.id,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const orderRes = await api.post('/orders', {
              items,
              totalAmount: finalAmount,
              deliveryAddress: address,
              razorpayOrderId: response.razorpay_order_id,
            });
            toast.success('Order placed successfully! 🍕');
            navigate(`/order-confirmation/${orderRes.data.order._id}`);
          } catch (err) {
            toast.error(err.response?.data?.message || 'Order creation failed after payment');
          } finally {
            setPaying(false);
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone || '' },
        theme: { color: '#2A9D8F' },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setPaying(false);
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
      // setPaying(false) is handled inside handler / ondismiss / payment.failed
    } catch (err) {
      setPaying(false);
      toast.error(err.response?.data?.message || 'Could not initiate payment.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-app-text mb-8">🛒 Your Cart</h1>

        {items.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="text-8xl mb-4">🛒</div>
            <h3 className="text-2xl font-bold text-app-text mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some delicious pizzas!</p>
            <button onClick={() => navigate('/')} className="btn-primary">Browse Menu</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="card p-4 flex gap-4"
                  >
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200'}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200'; }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-app-text">{item.name}</h3>
                      {item.isCustom && item.customDetails && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.customDetails.base} • {item.customDetails.sauce} • {item.customDetails.cheese}
                        </p>
                      )}
                      <p className="text-primary font-bold mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => dispatch(removeFromCart(item._id))} className="text-secondary hover:text-red-700 text-sm">✕</button>
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                          className="w-6 h-6 flex items-center justify-center font-bold text-app-text hover:text-secondary"
                        >−</button>
                        <span className="font-bold text-app-text w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                          className="w-6 h-6 flex items-center justify-center font-bold text-app-text hover:text-primary"
                        >+</button>
                      </div>
                      <p className="text-sm font-semibold text-app-text">₹{item.price * item.quantity}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="card p-6">
                <h3 className="font-bold text-app-text text-lg mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span><span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span><span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Taxes (5%)</span><span>₹{tax}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-app-text text-lg">
                    <span>Total</span><span>₹{finalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-app-text mb-3">Delivery Address</h3>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Enter your full delivery address..."
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={paying}
                className="btn-secondary w-full flex items-center justify-center gap-2 py-4 text-lg"
              >
                {paying ? <Spinner size="sm" color="white" /> : '💳 Pay with Razorpay'}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
