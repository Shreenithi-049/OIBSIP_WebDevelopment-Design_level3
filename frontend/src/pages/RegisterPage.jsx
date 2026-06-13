import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { registerUser } from '../store/slices/authSlice';
import Spinner from '../components/common/Spinner';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    const result = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (registerUser.fulfilled.match(result)) {
      navigate('/verify-otp', { state: { email: form.email } });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🍕</div>
            <h1 className="text-3xl font-extrabold text-app-text">Join PizzaHub!</h1>
            <p className="text-gray-500 mt-1">Create your account and start ordering</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',         key: 'name',            type: 'text',     placeholder: 'John Doe' },
              { label: 'Email',             key: 'email',           type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',          key: 'password',        type: 'password', placeholder: '••••••••' },
              { label: 'Confirm Password',  key: 'confirmPassword', type: 'password', placeholder: '••••••••' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-app-text mb-1">{field.label}</label>
                <input
                  type={field.type}
                  required
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="input-field"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? <Spinner size="sm" color="white" /> : '🚀 Create Account'}
            </motion.button>
          </form>

          <p className="text-center mt-6 text-gray-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
