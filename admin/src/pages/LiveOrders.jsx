import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiPrinter, FiPhone, FiClock, FiTruck, FiCoffee, FiShoppingBag } from 'react-icons/fi';
import { io } from 'socket.io-client';
import api from '../store';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'pending',          label: 'New Orders',    color: 'yellow', next: 'confirmed' },
  { key: 'confirmed',        label: 'Confirmed',     color: 'blue',   next: 'preparing' },
  { key: 'preparing',        label: 'Preparing',     color: 'purple', next: 'ready' },
  { key: 'ready',            label: 'Ready',         color: 'green',  next: 'out-for-delivery' },
  { key: 'out-for-delivery', label: 'Out',           color: 'indigo', next: 'delivered' },
  { key: 'delivered',        label: 'Delivered',     color: 'gray',   next: null },
];

const COL_STYLES = {
  yellow: 'border-yellow-500/30 bg-yellow-500/5',
  blue:   'border-blue-500/30 bg-blue-500/5',
  purple: 'border-purple-500/30 bg-purple-500/5',
  green:  'border-green-500/30 bg-green-500/5',
  indigo: 'border-indigo-500/30 bg-indigo-500/5',
  gray:   'border-gray-700 bg-gray-800/20',
};

const HEADER_STYLES = {
  yellow: 'text-yellow-400', blue: 'text-blue-400', purple: 'text-purple-400',
  green: 'text-green-400', indigo: 'text-indigo-400', gray: 'text-gray-400',
};

const TYPE_ICON = { delivery: FiTruck, 'dine-in': FiCoffee, pickup: FiShoppingBag };

function OrderCard({ order, onStatusUpdate, loading }) {
  const elapsed = Math.floor((Date.now() - new Date(order.createdAt)) / 60000);
  const urgent = elapsed > 30 && !['delivered', 'cancelled'].includes(order.status);
  const col = COLUMNS.find(c => c.key === order.status);
  const TypeIcon = TYPE_ICON[order.type] || FiShoppingBag;

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-surface-card border rounded-xl p-3 mb-2 ${urgent ? 'border-red-500/40' : 'border-surface-border'}`}>
      {urgent && <div className="text-red-400 text-[10px] font-medium mb-1 flex items-center gap-1"><FiClock className="text-xs" /> Waiting {elapsed} min</div>}

      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-white text-sm font-bold">#{order.orderNumber}</span>
          <span className="text-gray-500 text-[10px] ml-2">{elapsed}m ago</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TypeIcon className="text-gray-400 text-xs" />
          <span className="text-brand font-semibold text-sm">₹{order.total}</span>
        </div>
      </div>

      <div className="mb-2">
        {order.items?.slice(0, 3).map((item, i) => (
          <div key={i} className="text-gray-400 text-xs flex justify-between">
            <span className="truncate mr-2">{item.name}</span>
            <span className="flex-shrink-0">×{item.quantity}</span>
          </div>
        ))}
        {order.items?.length > 3 && <p className="text-gray-600 text-xs">+{order.items.length - 3} more</p>}
      </div>

      <div className="flex items-center justify-between text-[10px] mb-2.5">
        <span className="text-gray-500 capitalize">{order.type}{order.tableNumber ? ` · T${order.tableNumber}` : ''}</span>
        <span className={`${order.payment?.status === 'paid' ? 'text-green-400' : 'text-red-400'}`}>
          {order.payment?.status === 'paid' ? '✓ Paid' : '○ Unpaid'}
        </span>
      </div>

      <div className="flex gap-1.5">
        {col?.next && (
          <button onClick={() => onStatusUpdate(order._id, col.next)} disabled={loading}
            className="flex-1 bg-brand/10 text-brand border border-brand/30 rounded-lg py-1.5 text-[11px] font-medium hover:bg-brand/20 transition-colors disabled:opacity-50">
            → {COLUMNS.find(c => c.key === col.next)?.label}
          </button>
        )}
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button onClick={() => onStatusUpdate(order._id, 'cancelled')} disabled={loading}
            className="px-2 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-[11px] hover:bg-red-500/20 transition-colors disabled:opacity-50">
            ✕
          </button>
        )}
        <button onClick={() => window.print()} className="px-2 py-1.5 bg-surface-hover border border-surface-border rounded-lg text-gray-400 hover:text-white transition-colors">
          <FiPrinter className="text-xs" />
        </button>
      </div>
    </motion.div>
  );
}

export default function LiveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sound, setSound] = useState(true);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch();
    socketRef.current = io(import.meta.env.VITE_API_URL || '');
    socketRef.current.emit('join_admin');
    socketRef.current.emit('join_kitchen');
    socketRef.current.on('new_order', ({ order }) => {
      setOrders(prev => [order, ...prev]);
      toast.success(`New order #${order.orderNumber}!`, { icon: '🛎️', duration: 5000 });
      if (sound) { try { new Audio('/notification.mp3').play(); } catch {} }
    });
    socketRef.current.on('order_status_changed', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    });
    return () => socketRef.current?.disconnect();
  }, []);

  const fetch = async () => {
    try {
      const res = await api.get('/orders/admin?limit=100');
      setOrders(res.data.orders || []);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    setLoading(true);
    try {
      await api.patch(`/orders/${id}/status`, { status });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      toast.success(`Order ${status}`);
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.type === filter);
  const getColumnOrders = (status) => filteredOrders.filter(o => o.status === status);

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5 flex-shrink-0">
        <div>
          <h2 className="text-white font-bold text-lg">Live Orders</h2>
          <p className="text-gray-500 text-xs">{activeOrders} active · {orders.length} total</p>
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {['all', 'delivery', 'dine-in', 'pickup'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-brand text-gray-900' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'}`}>{f}</button>
          ))}
          <button onClick={fetch} className="admin-btn-ghost py-1 px-3"><FiRefreshCw className="text-xs" /> Refresh</button>
          <button onClick={() => setSound(!sound)} className={`admin-btn-ghost py-1 px-3 ${!sound ? 'text-gray-600' : ''}`}>🔔 Sound {sound ? 'On' : 'Off'}</button>
        </div>
      </div>

      {/* KDS Board */}
      <div className="flex gap-3 overflow-x-auto pb-2 flex-1">
        {COLUMNS.map(col => {
          const colOrders = getColumnOrders(col.key);
          return (
            <div key={col.key} className={`flex-shrink-0 w-60 rounded-xl border ${COL_STYLES[col.color]} p-3 flex flex-col max-h-full`}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className={`font-semibold text-sm ${HEADER_STYLES[col.color]}`}>{col.label}</h3>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${col.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' : col.color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-surface-hover text-gray-400'}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Orders */}
              <div className="overflow-y-auto flex-1">
                <AnimatePresence>
                  {colOrders.length === 0 ? (
                    <p className="text-gray-600 text-xs text-center py-8">No orders</p>
                  ) : colOrders.map(order => (
                    <OrderCard key={order._id} order={order} onStatusUpdate={updateStatus} loading={loading} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {/* Cancelled column */}
        <div className="flex-shrink-0 w-60 rounded-xl border border-red-500/10 bg-red-500/5 p-3 flex flex-col max-h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-red-400">Cancelled</h3>
            <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">
              {filteredOrders.filter(o => o.status === 'cancelled').length}
            </span>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOrders.filter(o => o.status === 'cancelled').slice(0, 8).map(order => (
              <div key={order._id} className="bg-surface-card border border-surface-border rounded-xl p-3 mb-2 opacity-60">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400 text-sm font-medium">#{order.orderNumber}</span>
                  <span className="text-brand text-sm">₹{order.total}</span>
                </div>
                <p className="text-gray-600 text-xs truncate">{order.items?.map(i => i.name).join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
