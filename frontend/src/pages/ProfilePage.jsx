import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateProfile } from '../store/slices/authSlice';
import Spinner from '../components/common/Spinner';

const ProfilePage = () => {
  const { user, loading } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfile(form));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-4xl">
                👤
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-app-text">{user?.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user?.role === 'admin' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                  {user?.role === 'admin' ? '🔑 Admin' : '👤 User'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">Email</label>
                <input type="email" value={user?.email} disabled className="input-field bg-gray-50 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-app-text mb-1">Default Delivery Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field resize-none" rows={3} placeholder="Your delivery address..." />
              </div>
              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Spinner size="sm" color="white" /> : '💾 Save Changes'}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
