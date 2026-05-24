import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { initSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color }) => (
  <motion.div whileHover={{ y: -4 }} className="card p-6">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl mb-3`}>{icon}</div>
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-3xl font-extrabold text-app-text mt-1">{value}</p>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/orders/admin/stats').then((res) => setStats(res.data.stats));

    const socket = initSocket();
    socket.emit('join-admin-room');

    socket.on('new-order', ({ order, notification }) => {
      toast.success(`New order from ${order.user?.name || 'customer'}! 🍕`);
      setNotifications((prev) => [notification, ...prev].slice(0, 5));
      // Refresh stats
      api.get('/orders/admin/stats').then((res) => setStats(res.data.stats));
    });

    socket.on('low-stock-alert', ({ item }) => {
      toast.error(`⚠️ Low stock: ${item.name} (${item.quantity} left)`);
    });

    return () => {
      socket.off('new-order');
      socket.off('low-stock-alert');
    };
  }, []);

  const statusColors = {
    'Order Received': 'bg-blue-100 text-blue-700',
    'In Kitchen': 'bg-yellow-100 text-yellow-700',
    'Sent to Delivery': 'bg-orange-100 text-orange-700',
    'Delivered': 'bg-green-100 text-green-700',
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-app-text">Admin Dashboard 🍕</h1>
            <p className="text-gray-500 mt-1">Welcome back, Admin!</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/orders" className="btn-primary text-sm">Manage Orders</Link>
            <Link to="/admin/inventory" className="btn-accent text-sm">Inventory</Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="📦" label="Total Orders" value={stats.totalOrders} color="bg-blue-100" />
            <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="bg-green-100" />
            <StatCard icon="💰" label="Revenue" value={`₹${stats.totalRevenue?.toLocaleString()}`} color="bg-accent/30" />
            <StatCard icon="🍕" label="Active Orders" value={stats.ordersByStatus?.find(s => s._id !== 'Delivered')?.count || 0} color="bg-secondary/10" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-app-text text-lg">Recent Orders</h3>
              <Link to="/admin/orders" className="text-primary text-sm hover:underline">View all →</Link>
            </div>
            <div className="space-y-3">
              {stats?.recentOrders?.map((order) => (
                <div key={order._id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-app-text text-sm">{order.user?.name}</p>
                    <p className="text-gray-500 text-xs">#{order._id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">₹{order.totalAmount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="card p-6">
            <h3 className="font-bold text-app-text text-lg mb-4">Order Status Breakdown</h3>
            <div className="space-y-3">
              {stats?.ordersByStatus?.map((s) => (
                <div key={s._id} className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${statusColors[s._id] || 'bg-gray-100 text-gray-600'}`}>
                    {s._id}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((s.count / (stats.totalOrders || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-app-text text-sm w-6">{s.count}</span>
                </div>
              ))}
            </div>

            {/* Live Notifications */}
            {notifications.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-app-text mb-3">🔔 Live Notifications</h4>
                {notifications.map((n, i) => (
                  <div key={i} className="text-sm text-gray-600 py-1 border-b last:border-0">
                    {n.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
