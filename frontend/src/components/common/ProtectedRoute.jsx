import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children }) => {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user && !user) return null; // loading
  return children;
};

export const AdminRoute = ({ children }) => {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { token } = useSelector((s) => s.auth);
  if (token) return <Navigate to="/" replace />;
  return children;
};
