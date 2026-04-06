import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiSpoon } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api, { useAdminStore } from '../store';

export default function Login() {
  const [form, setForm] = useState({ email: 'admin@spiceandsoul.com', password: 'Admin@123' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAdminStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.user.role === 'customer') return toast.error('Access denied. Admin only.');
      setUser(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand/10 border border-brand/30 rounded-2xl mb-4">
            <GiSpoon className="text-brand text-2xl" />
          </div>
          <h1 className="font-display text-3xl text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Spice & Soul Restaurant</p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="admin-input pl-9" required />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
              <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" className="admin-input pl-9 pr-9" required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {show ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="admin-btn w-full justify-center py-2.5 text-sm disabled:opacity-60">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600 mt-5">admin@spiceandsoul.com / Admin@123</p>
        </div>
      </motion.div>
    </div>
  );
}
