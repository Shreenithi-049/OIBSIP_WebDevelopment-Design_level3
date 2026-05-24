import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { fetchMe } from './store/slices/authSlice';
import { fetchCart } from './store/slices/cartSlice';
import { PageLoader } from './components/common/Spinner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthPages';
import CartPage from './pages/CartPage';
import CustomPizzaPage from './pages/CustomPizzaPage';
import { OrderConfirmationPage, MyOrdersPage } from './pages/OrderPages';
import ProfilePage from './pages/ProfilePage';
import PizzaDetailPage from './pages/PizzaDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminInventory from './pages/admin/AdminInventory';

const AppContent = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((s) => s.auth);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (token) {
        await dispatch(fetchMe());
        await dispatch(fetchCart());
      }
      setInitializing(false);
    };
    init();
  }, [token, dispatch]);

  if (initializing) return <PageLoader />;

  const isAdmin = user?.role === 'admin';

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pizza/:id" element={<PizzaDetailPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* Guest only */}
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

            {/* User protected */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/custom-pizza" element={<ProtectedRoute><CustomPizzaPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Admin protected */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
            <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center text-center">
                <div>
                  <div className="text-8xl mb-4">🍕</div>
                  <h2 className="text-3xl font-bold text-app-text mb-2">Page Not Found</h2>
                  <a href="/" className="btn-primary inline-block mt-4">Go Home</a>
                </div>
              </div>
            } />
          </Routes>
        </main>
        {!isAdmin && <Footer />}
      </div>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#FFF8E7', color: '#264653', border: '1px solid #2A9D8F' },
        success: { iconTheme: { primary: '#2A9D8F', secondary: 'white' } },
        error: { iconTheme: { primary: '#E63946', secondary: 'white' } },
      }} />
    </BrowserRouter>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
