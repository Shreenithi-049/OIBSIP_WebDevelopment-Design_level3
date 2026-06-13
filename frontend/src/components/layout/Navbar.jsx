import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const { user, token } = useSelector((s) => s.auth);
  const { items } = useSelector((s) => s.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = token
    ? user?.role === 'admin'
      ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/orders', label: 'Orders' }, { to: '/admin/inventory', label: 'Inventory' }]
      : [{ to: '/', label: 'Menu' }, { to: '/custom-pizza', label: 'Build Pizza' }, { to: '/orders', label: 'My Orders' }]
    : [
        { to: '/', label: 'Menu' },
        ...(location.pathname !== '/login'    ? [{ to: '/login',    label: 'Login'    }] : []),
        ...(location.pathname !== '/register' ? [{ to: '/register', label: 'Register' }] : []),
      ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <motion.span whileHover={{ rotate: 20 }} className="text-3xl">🍕</motion.span>
            <span className="font-extrabold text-xl text-app-text">Pizza<span className="text-primary">Hub</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium transition-colors hover:text-primary ${
                  location.pathname === link.to ? 'text-primary' : 'text-app-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {token && user?.role !== 'admin' && (
              <Link to="/cart" className="relative p-2">
                <span className="text-2xl">🛒</span>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-secondary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>
            )}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-xl transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span className="text-sm font-semibold text-app-text hidden sm:block">{user?.name?.split(' ')[0]}</span>
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 text-app-text" onClick={() => setProfileOpen(false)}>👤 Profile</Link>
                      {user?.role !== 'admin' && <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 text-app-text" onClick={() => setProfileOpen(false)}>📦 My Orders</Link>}
                      <hr className="my-1" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-red-50">🚪 Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              location.pathname !== '/login' && (
                <Link to="/login" className="btn-primary text-sm">Login</Link>
              )
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              <div className="w-5 h-0.5 bg-app-text mb-1" />
              <div className="w-5 h-0.5 bg-app-text mb-1" />
              <div className="w-5 h-0.5 bg-app-text" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden pb-4"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-2 text-app-text hover:text-primary font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {token && (
                <button onClick={handleLogout} className="block py-2 text-secondary font-medium">
                  🚪 Logout
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
