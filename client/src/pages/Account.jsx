import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiHeart, FiLogOut, FiEdit, FiStar, FiGift, FiAward } from 'react-icons/fi';
import api from '../api/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function Account() {
  const { user, logout, setUser } = useStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('orders');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get('/orders/my').then(r => setOrders(r.data)).catch(console.error);
  }, [user, navigate]);

  const saveProfile = async () => {
    try {
      const { data } = await api.put('/auth/me', form);
      setUser(data, useStore.getState().token);
      setEditMode(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'loyalty', label: 'Rewards', icon: FiGift },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold font-display text-2xl font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="font-display text-3xl text-cream">{user?.name}</h1>
            <p className="text-cream/50 font-body text-sm">{user?.email}</p>
            <p className="text-gold text-xs font-body mt-0.5">⭐ {user?.loyaltyPoints || 0} loyalty points</p>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="ml-auto btn-outline text-sm py-2 px-4 text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-400">
            <FiLogOut /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-dark-border pb-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-body border-b-2 transition-all -mb-px ${tab === id ? 'border-gold text-gold' : 'border-transparent text-cream/50 hover:text-cream'}`}>
              <Icon className="text-sm" /> {label}
            </button>
          ))}
        </div>

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <FiShoppingBag className="text-4xl text-cream/20 mx-auto mb-3" />
                <p className="font-display text-2xl text-cream/40 mb-4">No orders yet</p>
                <Link to="/menu" className="btn-gold text-sm">Order Now</Link>
              </div>
            ) : orders.map(order => (
              <div key={order._id} className="card-dark p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-gold font-body font-semibold">#{order.orderNumber}</p>
                  <p className="text-cream/60 text-sm font-body">{order.items.map(i => i.name).join(', ')}</p>
                  <p className="text-cream/40 text-xs font-body mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-cream font-semibold">₹{order.total}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-body ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-gold/20 text-gold'}`}>
                    {order.status}
                  </span>
                  <Link to={`/track/${order._id}`} className="block text-gold/60 hover:text-gold text-xs mt-1 font-body">Track →</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card-dark p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-cream">My Profile</h2>
              <button onClick={() => editMode ? saveProfile() : setEditMode(true)} className="btn-outline text-sm py-2 px-4">
                <FiEdit /> {editMode ? 'Save' : 'Edit'}
              </button>
            </div>
            {editMode ? (
              <>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="input-dark" />
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="input-dark" />
              </>
            ) : (
              <div className="space-y-3 text-sm font-body">
                {[['Name', user?.name], ['Email', user?.email], ['Phone', user?.phone || 'Not set']].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-dark-border pb-2">
                    <span className="text-cream/50">{label}</span>
                    <span className="text-cream">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between border-b border-dark-border pb-2">
                  <span className="text-cream/50">Member Since</span>
                  <span className="text-cream">{new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cream/50">Total Orders</span>
                  <span className="text-cream">{orders.length}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loyalty tab */}
        {tab === 'loyalty' && (
          <div className="space-y-4">
            <div className="card-dark p-6 text-center border border-gold/20">
              <FiAward className="text-gold text-4xl mx-auto mb-3" />
              <p className="font-display text-5xl text-gold mb-2">{user?.loyaltyPoints || 0}</p>
              <p className="text-cream/50 font-body">Loyalty Points</p>
              <p className="text-cream/30 text-xs font-body mt-2">= ₹{Math.floor((user?.loyaltyPoints || 0) / 10)} redeemable value</p>
            </div>
            <div className="card-dark p-5">
              <h3 className="font-display text-lg text-cream mb-3">How to earn points</h3>
              <div className="space-y-2 text-sm font-body text-cream/60">
                <p>• Earn 1 point for every ₹10 spent</p>
                <p>• Bonus 50 points on your birthday</p>
                <p>• 25 points for leaving a review</p>
                <p>• Redeem 100 points = ₹10 off</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
