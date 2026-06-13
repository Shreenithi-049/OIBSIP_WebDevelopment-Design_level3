// frontend/src/pages/AuthPages.jsx

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

// ======================================================
// FORGOT PASSWORD PAGE
// ======================================================
export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 w-full max-w-md"
      >
        {sent ? (
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-app-text mb-2">Email Sent!</h2>
            <p className="text-gray-500 mb-6">Check your inbox for the password reset link.</p>
            <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-app-text mb-2">Forgot Password?</h2>
            <p className="text-gray-500 mb-6">Enter your email address to receive a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Spinner size="sm" color="white" /> : 'Send Reset Link'}
              </button>
            </form>
            <Link to="/login" className="block text-center mt-4 text-primary text-sm hover:underline">
              Back to Login
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

// ======================================================
// RESET PASSWORD PAGE
// ======================================================
export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-app-text mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
            placeholder="New password"
          />
          <input
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="input-field"
            placeholder="Confirm password"
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? <Spinner size="sm" color="white" /> : 'Reset Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
