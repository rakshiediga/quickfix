import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Auth Pages
import SplashScreen from './pages/auth/SplashScreen';
import LoginPage from './pages/auth/LoginPage';
import OtpPage from './pages/auth/OtpPage';
import RoleSelectPage from './pages/auth/RoleSelectPage';
import ProviderSetupPage from './pages/auth/ProviderSetupPage';

// Customer Pages
import CustomerHome from './pages/customer/CustomerHome';
import SearchPage from './pages/customer/SearchPage';
import ProviderProfilePage from './pages/customer/ProviderProfilePage';
import BookServicePage from './pages/customer/BookServicePage';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingTrackerPage from './pages/customer/BookingTrackerPage';
import ChatPage from './pages/customer/ChatPage';
import PaymentPage from './pages/customer/PaymentPage';
import CustomerProfile from './pages/customer/CustomerProfile';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderBookings from './pages/provider/ProviderBookings';
import BookingRequestPage from './pages/provider/BookingRequestPage';
import ProviderEarnings from './pages/provider/ProviderEarnings';
import ProviderProfileSetup from './pages/provider/ProviderProfileSetup';
import ProviderReviews from './pages/provider/ProviderReviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProviders from './pages/admin/AdminProviders';
import AdminBookings from './pages/admin/AdminBookings';
import AdminCommissions from './pages/admin/AdminCommissions';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import ProviderLayout from './layouts/ProviderLayout';
import AdminLayout from './layouts/AdminLayout';

// Loading screen
const LoadingScreen = () => (
  <div className="loading-screen">
    <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>QuickFix</div>
    <div className="spinner spinner--lg" style={{ marginTop: 32 }} />
  </div>
);

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, profile } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'customer') return <Navigate to="/customer/home" replace />;
    if (role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuthStore();
  if (isAuthenticated) {
    if (role === 'customer') return <Navigate to="/customer/home" replace />;
    if (role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default function App() {
  const { initialize, isLoading } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <div className="app-container">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontFamily: 'var(--font-primary)',
            },
          }}
        />
        <Routes>
          {/* Public / Auth */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/otp" element={<PublicRoute><OtpPage /></PublicRoute>} />
          <Route path="/role-select" element={<PublicRoute><RoleSelectPage /></PublicRoute>} />
          <Route path="/provider-setup" element={<ProviderSetupPage />} />

          {/* Customer */}
          <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<CustomerHome />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="bookings" element={<CustomerBookings />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
          <Route path="/customer/provider/:id" element={<ProtectedRoute allowedRoles={['customer']}><ProviderProfilePage /></ProtectedRoute>} />
          <Route path="/customer/book/:providerId" element={<ProtectedRoute allowedRoles={['customer']}><BookServicePage /></ProtectedRoute>} />
          <Route path="/customer/tracking/:bookingId" element={<ProtectedRoute allowedRoles={['customer']}><BookingTrackerPage /></ProtectedRoute>} />
          <Route path="/customer/chat/:bookingId" element={<ProtectedRoute allowedRoles={['customer', 'provider']}><ChatPage /></ProtectedRoute>} />
          <Route path="/customer/payment/:bookingId" element={<ProtectedRoute allowedRoles={['customer']}><PaymentPage /></ProtectedRoute>} />

          {/* Provider */}
          <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider']}><ProviderLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="bookings" element={<ProviderBookings />} />
            <Route path="earnings" element={<ProviderEarnings />} />
            <Route path="profile" element={<ProviderProfileSetup />} />
            <Route path="reviews" element={<ProviderReviews />} />
          </Route>
          <Route path="/provider/booking/:bookingId" element={<ProtectedRoute allowedRoles={['provider']}><BookingRequestPage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="commissions" element={<AdminCommissions />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
