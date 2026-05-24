import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../services/api';
import OrderTracker from '../components/common/OrderTracker';
import { initSocket } from '../services/socket';
import toast from 'react-hot-toast';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.order));

    // Setup socket for live updates
    const socket = initSocket();
    socket.emit('join-user-room', user?._id);
    socket.on('order-status-update', ({ orderId: id, status }) => {
      if (id === orderId) {
        setOrder((prev) => prev ? { ...prev, status } : prev);
        toast.success(`Order status: ${status} 🍕`);
      }
    });
    return () => socket.off('order-status-update');
  }, [orderId, user]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-6xl animate-bounce">🍕</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-8">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-3xl font-extrabold text-app-text">Order Confirmed!</h1>
          <p className="text-gray-500 mt-2">Order #{order._id.slice(-8).toUpperCase()}</p>
        </motion.div>

        <div className="card p-6 mb-6">
          <h3 className="font-bold text-app-text text-lg mb-4">Live Order Tracking</h3>
          <OrderTracker status={order.status} />
        </div>

        <div className="card p-6 mb-6">
          <h3 className="font-bold text-app-text mb-4">Order Items</h3>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-semibold text-app-text">{item.name}</p>
                <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
              </div>
              <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
            </div>
          ))}
          <div className="flex justify-between mt-4 pt-4 border-t font-bold text-app-text text-lg">
            <span>Total</span>
            <span className="text-primary">₹{order.totalAmount}</span>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <h3 className="font-bold text-app-text mb-2">Delivery Address</h3>
          <p className="text-gray-600">📍 {order.deliveryAddress}</p>
        </div>

        <div className="flex gap-4">
          <Link to="/orders" className="btn-primary flex-1 text-center">View All Orders</Link>
          <Link to="/" className="btn-accent flex-1 text-center">Order More</Link>
        </div>
      </div>
    </div>
  );
};

export const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    api.get('/orders/my').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    });

    const socket = initSocket();
    socket.emit('join-user-room', user?._id);
    socket.on('order-status-update', ({ orderId, status }) => {
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
    });
    return () => socket.off('order-status-update');
  }, [user]);

  const statusColor = {
    'Order Received': 'bg-blue-100 text-blue-700',
    'In Kitchen': 'bg-yellow-100 text-yellow-700',
    'Sent to Delivery': 'bg-orange-100 text-orange-700',
    'Delivered': 'bg-green-100 text-green-700',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-6xl animate-bounce">🍕</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-app-text mb-8">📦 My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-app-text mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">Start ordering some delicious pizzas!</p>
            <Link to="/" className="btn-primary inline-block">Browse Menu</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div key={order._id} whileHover={{ y: -2 }} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-app-text">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {order.items.map((i) => i.name).join(', ')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary text-lg">₹{order.totalAmount}</span>
                  <Link to={`/order-confirmation/${order._id}`} className="text-primary text-sm font-semibold hover:underline">
                    Track Order →
                  </Link>
                </div>
                {order.status !== 'Delivered' && (
                  <div className="mt-4">
                    <OrderTracker status={order.status} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
