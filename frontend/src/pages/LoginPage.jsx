import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';

import { motion } from 'framer-motion';

import toast from 'react-hot-toast';

import { loginUser } from '../store/slices/authSlice';

import Spinner from '../components/common/Spinner';

const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [unverified, setUnverified] =
    useState(false);

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { loading } = useSelector(
    (state) => state.auth
  );

  // ======================================================
  // HANDLE LOGIN
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setUnverified(false);

    const result = await dispatch(
      loginUser(form)
    );

    // SUCCESS
    if (
      loginUser.fulfilled.match(result)
    ) {
      toast.success(
        `Welcome back, ${result.payload.user.name}! 🍕`
      );

      navigate(
        result.payload.user.role ===
          'admin'
          ? '/admin'
          : '/'
      );
    }

    // EMAIL NOT VERIFIED
    else if (
      result.payload?.notVerified
    ) {
      setUnverified(true);

      toast.error(
        'Please verify your email before logging in.'
      );
    }

    // OTHER ERRORS
    else {
      toast.error(
        result.payload?.message ||
          'Login failed'
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="w-full max-w-md"
      >
        <div className="card p-8 shadow-xl rounded-3xl">
          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">
              🍕
            </div>

            <h1 className="text-3xl font-extrabold text-app-text">
              Welcome Back!
            </h1>

            <p className="text-gray-500 mt-1">
              Sign in to your PizzaHub
              account
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* EMAIL VERIFICATION WARNING */}
            {unverified && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="p-4 bg-yellow-50 border border-yellow-300 rounded-xl text-sm text-yellow-800"
              >
                <p className="font-semibold mb-1">
                  ⚠️ Email Not Verified
                </p>

                <p>
                  Please verify your
                  email before logging
                  in. Check your inbox
                  and spam folder for
                  the verification
                  email.
                </p>
              </motion.div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">
                Email Address
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email:
                      e.target.value,
                  })
                }
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-sm font-semibold text-app-text mb-1">
                Password
              </label>

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password:
                      e.target.value,
                  })
                }
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* SUBMIT */}
            <motion.button
              whileTap={{
                scale: 0.98,
              }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Spinner
                  size="sm"
                  color="white"
                />
              ) : (
                '🍕 Sign In'
              )}
            </motion.button>
          </form>

          {/* DEMO ACCOUNTS */}
          <div className="mt-6 p-4 bg-primary/5 rounded-xl text-sm text-gray-600">
            <p className="font-semibold mb-2 text-app-text">
              Demo Credentials
            </p>

            <p>
              👤 User:
              user@pizzahub.com /
              User@123
            </p>

            <p className="mt-1">
              🔑 Admin:
              admin@pizzahub.com /
              Admin@123
            </p>
          </div>

          {/* REGISTER LINK */}
          <p className="text-center mt-6 text-gray-500 text-sm">
            Don&apos;t have an
            account?{' '}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;