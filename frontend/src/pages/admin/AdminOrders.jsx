import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import OrderTracker from '../../components/common/OrderTracker';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

const statusColor = {
  'Order Received': 'bg-blue-100 text-blue-700',
  'In Kitchen': 'bg-yellow-100 text-yellow-700',
  'Sent to Delivery': 'bg-orange-100 text-orange-700',
  'Delivered': 'bg-green-100 text-green-700',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/orders/admin/all').then((res) => {
      setOrders(res.data.orders);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status } : o));
      toast.success(`Status updated to: ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-6xl animate-bounce">🍕</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-app-text mb-8">📦 Order Management</h1>

        {/* Filter */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {['all', ...STATUS_OPTIONS].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                filter === s ? 'bg-primary text-white' : 'bg-white text-app-text border border-gray-200 hover:border-primary'
              }`}
            >
              {s === 'all' ? '📋 All' : s}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((order) => (
            <motion.div key={order._id} layout className="card overflow-hidden">
              <div
                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-bold text-app-text">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-gray-500 text-sm">{order.user?.name} • {order.user?.email}</p>
                    <p className="text-gray-400 text-xs">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary text-lg">₹{order.totalAmount}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="text-gray-400">{expandedId === order._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expandedId === order._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-gray-100 p-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-app-text mb-3">Order Items</h4>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span className="font-semibold text-primary">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <p className="text-gray-500 text-sm mt-3">📍 {order.deliveryAddress}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-app-text mb-3">Update Status</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order._id, s)}
                            className={`text-xs py-2 px-3 rounded-lg font-semibold transition-all ${
                              order.status === s
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-primary/10'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <OrderTracker status={order.status} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
