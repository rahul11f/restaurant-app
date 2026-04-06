import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { GiSpoon } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api from '../api/api';
import { useStore } from '../store/useStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const navigate = useNavigate();
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setUser(data.user, data.token);
      toast.success(`Welcome to Spice & Soul, ${data.user.name}!`);
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <GiSpoon className="text-gold text-3xl mx-auto mb-3" />
          <h1 className="font-display text-4xl text-cream">Create Account</h1>
          <p className="text-cream/50 font-body text-sm mt-1">Join Spice & Soul for exclusive offers and loyalty rewards</p>
        </div>
        <div className="card-dark p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', type: 'text', placeholder: 'Full Name', icon: FiUser },
              { key: 'email', type: 'email', placeholder: 'Email Address', icon: FiMail },
              { key: 'phone', type: 'tel', placeholder: 'Phone Number', icon: FiPhone },
              { key: 'password', type: 'password', placeholder: 'Password', icon: FiLock },
            ].map(({ key, type, placeholder, icon: Icon }) => (
              <div key={key} className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
                <input type={type} value={form[key]} onChange={e => f(key, e.target.value)} placeholder={placeholder} className="input-dark pl-10" required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3.5 text-base disabled:opacity-70">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-cream/40 text-sm font-body mt-6">
          Already have an account? <Link to="/login" className="text-gold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
