import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { GiSpoon } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api from '../api/api';
import { useStore } from '../store/useStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setUser(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(data.user.role === 'customer' ? '/' : '/admin');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <GiSpoon className="text-gold text-3xl mx-auto mb-3" />
          <h1 className="font-display text-4xl text-cream">Welcome Back</h1>
          <p className="text-cream/50 font-body text-sm mt-1">Sign in to your Spice & Soul account</p>
        </div>

        <div className="card-dark p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Email Address" className="input-dark pl-10" required />
            </div>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
              <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Password" className="input-dark pl-10 pr-10" required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-gold">
                {show ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3.5 text-base disabled:opacity-70">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-dark-border">
            <p className="text-center text-cream/50 text-sm font-body mb-3">Demo credentials</p>
            <button onClick={() => setForm({ email: 'admin@spiceandsoul.com', password: 'Admin@123' })}
              className="w-full text-xs text-gold/60 hover:text-gold transition-colors font-body">
              Fill admin credentials →
            </button>
          </div>
        </div>

        <p className="text-center text-cream/40 text-sm font-body mt-6">
          Don't have an account? <Link to="/register" className="text-gold hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
