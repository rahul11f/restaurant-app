import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAdminStore } from './store';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveOrders = lazy(() => import('./pages/LiveOrders'));
const MenuManager = lazy(() => import('./pages/MenuManager'));
const InventoryPage = lazy(() => import('./pages/Inventory'));
const ReservationsPage = lazy(() => import('./pages/Reservations'));
const StaffPage = lazy(() => import('./pages/Staff'));
const CustomersPage = lazy(() => import('./pages/Customers'));
const OffersPage = lazy(() => import('./pages/OffersManager'));
const ReviewsPage = lazy(() => import('./pages/ReviewsManager'));
const AnalyticsPage = lazy(() => import('./pages/Analytics'));
const NotificationsPage = lazy(() => import('./pages/Notifications'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function ProtectedRoute({ children }) {
  const { token, user } = useAdminStore();
  if (!token) return <Navigate to="/login" replace />;
  if (user && user.role === 'customer') return <Navigate to="/login" replace />;
  return children;
}

const Loading = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-t-brand border-surface-border rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1F2937', color: '#F9FAFB', border: '1px solid #374151' } }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/orders" element={<LiveOrders />} />
                  <Route path="/menu" element={<MenuManager />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/reservations" element={<ReservationsPage />} />
                  <Route path="/staff" element={<StaffPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
