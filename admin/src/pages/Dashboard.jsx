import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiShoppingBag, FiUsers, FiTrendingUp, FiAlertTriangle, FiArrowRight, FiCalendar, FiPackage, FiStar } from 'react-icons/fi';
import { io } from 'socket.io-client';
import api from '../store';
import { format } from 'date-fns';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-blue', preparing: 'badge-purple',
  ready: 'badge-green', 'out-for-delivery': 'badge-blue', delivered: 'badge-green',
  cancelled: 'badge-red'
};

function StatCard({ icon: Icon, label, value, sub, color = 'brand', trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="admin-card flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color === 'brand' ? 'bg-brand/10' : color === 'green' ? 'bg-green-500/10' : color === 'blue' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
        <Icon className={`text-lg ${color === 'brand' ? 'text-brand' : color === 'green' ? 'text-green-400' : color === 'blue' ? 'text-blue-400' : 'text-purple-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs mb-0.5">{label}</p>
        <p className="text-white font-bold text-2xl leading-none">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
      {trend && <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>{trend > 0 ? '+' : ''}{trend}%</span>}
    </motion.div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchAll();
    socketRef.current = io(import.meta.env.VITE_API_URL || '');
    socketRef.current.emit('join_admin');
    socketRef.current.on('new_order', () => { setLiveCount(c => c + 1); fetchAll(); });
    socketRef.current.on('order_status_changed', () => fetchAll());
    return () => socketRef.current?.disconnect();
  }, []);

  const fetchAll = async () => {
    try {
      const [analyticsRes, ordersRes, stockRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/orders/admin?limit=8'),
        api.get('/inventory?lowStock=true'),
      ]);
      setData(analyticsRes.data);
      setRecentOrders(ordersRes.data.orders || []);
      setLowStock(stockRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="admin-card h-24 bg-surface-hover animate-pulse" />)}</div>
    </div>
  );

  const todayRevenue = data?.today?.revenue || 0;
  const monthRevenue = data?.month?.revenue || 0;

  // Pie data for order types
  const orderTypeData = [
    { name: 'Delivery', value: 55 }, { name: 'Dine-in', value: 30 }, { name: 'Pickup', value: 15 }
  ];

  return (
    <div className="space-y-6">
      {/* Live alert */}
      {liveCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">{liveCount} new order{liveCount > 1 ? 's' : ''} received since you loaded!</span>
          <Link to="/orders" className="ml-auto text-green-400 text-sm hover:underline flex items-center gap-1">View <FiArrowRight /></Link>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiShoppingBag} label="Today's Orders" value={data?.today?.orders || 0} sub={`₹${todayRevenue.toLocaleString('en-IN')} revenue`} color="brand" />
        <StatCard icon={FiTrendingUp} label="Month Revenue" value={`₹${(monthRevenue / 1000).toFixed(1)}k`} sub={`${data?.month?.orders || 0} orders`} color="green" trend={12} />
        <StatCard icon={FiUsers} label="Total Customers" value={(data?.totalCustomers || 0).toLocaleString()} sub="Registered accounts" color="blue" />
        <StatCard icon={FiCalendar} label="Pending Bookings" value={data?.pendingReservations || 0} sub="Reservations to confirm" color="purple" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="admin-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="text-white font-semibold">Revenue — Last 7 Days</h3><p className="text-gray-500 text-xs">Daily revenue trend</p></div>
            <span className="badge badge-green text-xs">+12% vs last week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.dailyRevenue || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} labelStyle={{ color: '#F9FAFB' }} formatter={v => [`₹${v}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order types pie */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-1">Order Types</h3>
          <p className="text-gray-500 text-xs mb-4">Distribution today</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={orderTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {orderTypeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {orderTypeData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} /><span className="text-gray-400">{item.name}</span></div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="admin-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Orders</h3>
            <Link to="/orders" className="text-brand text-xs hover:underline flex items-center gap-1">View All <FiArrowRight /></Link>
          </div>
          <div className="space-y-2">
            {recentOrders.length === 0 ? <p className="text-gray-500 text-sm text-center py-6">No orders yet today</p> : recentOrders.slice(0, 6).map(order => (
              <div key={order._id} className="flex items-center gap-3 p-2.5 bg-surface rounded-lg hover:bg-surface-hover transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">#{order.orderNumber}</span>
                    <span className={`badge ${STATUS_COLORS[order.status] || 'badge-gray'}`}>{order.status}</span>
                  </div>
                  <p className="text-gray-500 text-xs truncate">{order.items?.map(i => i.name).join(', ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-brand font-semibold text-sm">₹{order.total}</p>
                  <p className="text-gray-600 text-xs capitalize">{order.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock + top items */}
        <div className="space-y-6">
          {/* Low stock */}
          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2"><FiAlertTriangle className="text-yellow-400 text-sm" /> Low Stock</h3>
              <Link to="/inventory" className="text-brand text-xs">Manage</Link>
            </div>
            {lowStock.length === 0 ? <p className="text-gray-500 text-xs">All stock levels OK ✓</p> : lowStock.slice(0, 5).map(item => (
              <div key={item._id} className="flex items-center justify-between py-1.5 border-b border-surface-border last:border-0">
                <p className="text-gray-300 text-xs">{item.name}</p>
                <div className="text-right">
                  <span className="badge badge-red text-xs">{item.currentStock} {item.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top dishes */}
          <div className="admin-card">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><FiStar className="text-brand text-sm" /> Top Dishes</h3>
            {(data?.topItems || []).slice(0, 4).map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-surface-border last:border-0">
                <span className="text-gray-600 text-xs w-4">{i + 1}.</span>
                <p className="text-gray-300 text-xs flex-1 truncate">{item._id}</p>
                <span className="text-brand text-xs font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
