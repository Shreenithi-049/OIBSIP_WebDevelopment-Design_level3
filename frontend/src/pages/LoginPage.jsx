import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { loginUser } from '../store/slices/authSlice';
import Spinner from '../components/common/Spinner';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [unverified, setUnverified] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      navigate(role === 'admin' ? '/admin' : '/');
    } else if (result.payload?.notVerified) {
      setUnverified(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🍕</div>
            <h1 className="text-3xl font-extrabold text-app-text">Welcome Back!</h1>
            <p className="text-gray-500 mt-1">Sign in to your PizzaHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {unverified && (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
                ⚠️ Please verify your email before logging in. Check your inbox for the verification link.
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" color="white" /> : '🍕 Sign In'}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-primary/5 rounded-xl text-sm text-gray-600">
            <p className="font-semibold mb-1">Test Credentials:</p>
            <p>👤 User: user@pizzahub.com / User@123</p>
            <p>🔑 Admin: admin@pizzahub.com / Admin@123</p>
          </div>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
