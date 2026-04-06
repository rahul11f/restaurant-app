import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiShoppingBag, FiGrid, FiPackage, FiCalendar, FiUsers,
  FiTag, FiStar, FiBarChart2, FiBell, FiSettings, FiLogOut,
  FiMenu, FiX, FiChevronRight, FiExternalLink
} from 'react-icons/fi';
import { GiSpoon } from 'react-icons/gi';
import { useAdminStore } from '../store';
import toast from 'react-hot-toast';

const NAV = [
  { to: '/', icon: FiHome, label: 'Dashboard' },
  { to: '/orders', icon: FiShoppingBag, label: 'Live Orders', badge: 'live' },
  { to: '/menu', icon: FiGrid, label: 'Menu' },
  { to: '/inventory', icon: FiPackage, label: 'Inventory' },
  { to: '/reservations', icon: FiCalendar, label: 'Reservations' },
  { to: '/staff', icon: FiUsers, label: 'Staff' },
  { to: '/customers', icon: FiUsers, label: 'Customers' },
  { to: '/offers', icon: FiTag, label: 'Offers' },
  { to: '/reviews', icon: FiStar, label: 'Reviews' },
  { to: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { to: '/notifications', icon: FiBell, label: 'Notifications' },
  { to: '/settings', icon: FiSettings, label: 'Settings' },
];

export default function AdminLayout({ children }) {
  const { user, logout, sidebarOpen, setSidebarOpen } = useAdminStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Logged out'); };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-surface-border ${collapsed ? 'justify-center' : ''}`}>
          <GiSpoon className="text-brand text-xl flex-shrink-0" />
          {!collapsed && (
            <div>
              <p className="font-display text-base font-semibold text-white leading-none">Spice & Soul</p>
              <p className="text-gray-500 text-[10px] mt-0.5">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {NAV.map(({ to, icon: Icon, label, badge }) => {
            const active = location.pathname === to;
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-150 group ${active ? 'bg-brand/10 text-brand' : 'text-gray-400 hover:bg-surface-hover hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? label : ''}>
                <Icon className={`text-base flex-shrink-0 ${active ? 'text-brand' : ''}`} />
                {!collapsed && (
                  <span className="text-sm font-medium flex-1">{label}</span>
                )}
                {!collapsed && badge === 'live' && (
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-surface-border p-3">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-xs font-bold flex-shrink-0">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <div className={`flex gap-1 ${collapsed ? 'flex-col items-center' : ''}`}>
            <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors text-xs" title="View Website">
              <FiExternalLink className="text-sm flex-shrink-0" />
              {!collapsed && 'Website'}
            </a>
            <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-surface-hover transition-colors text-xs" title="Toggle sidebar">
              <FiMenu className="text-sm flex-shrink-0" />
              {!collapsed && 'Collapse'}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/5 transition-colors text-xs" title="Logout">
              <FiLogOut className="text-sm flex-shrink-0" />
              {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-surface-card border-b border-surface-border px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-white">
              {NAV.find(n => n.to === location.pathname)?.label || 'Admin'}
            </h1>
            <p className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer"
              className="admin-btn-ghost text-xs py-1.5 px-3">
              <FiExternalLink className="text-xs" /> View Site
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
