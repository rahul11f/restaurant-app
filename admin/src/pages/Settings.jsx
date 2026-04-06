import React, { useState, useEffect } from 'react';
import { FiSave, FiGlobe, FiClock, FiTruck, FiDollarSign, FiToggleRight, FiToggleLeft } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const res = await api.get('/settings'); setSettings(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const saveSettings = async () => {
    setSaving(true);
    try { await api.put('/settings', settings); toast.success('Settings saved!'); } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const s = (key, value) => setSettings(p => ({ ...p, [key]: value }));
  const sh = (key) => (e) => s(key, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  if (loading) return <div className="admin-card h-64 animate-pulse bg-surface-hover" />;
  if (!settings) return <p className="text-gray-500">Failed to load settings</p>;

  const TABS = [
    { id: 'general', label: 'General', icon: FiGlobe },
    { id: 'hours', label: 'Hours', icon: FiClock },
    { id: 'delivery', label: 'Delivery', icon: FiTruck },
    { id: 'features', label: 'Features', icon: FiToggleRight },
    { id: 'payment', label: 'Payment', icon: FiDollarSign },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div><h2 className="text-white font-bold text-lg">Website Settings</h2><p className="text-gray-500 text-xs">Configure your restaurant's online presence</p></div>
        <button onClick={saveSettings} disabled={saving} className="admin-btn ml-auto disabled:opacity-60"><FiSave className="text-sm" />{saving ? 'Saving...' : 'Save All Settings'}</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === id ? 'bg-brand text-gray-900' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'}`}>
            <Icon className="text-sm" />{label}
          </button>
        ))}
      </div>

      {/* General settings */}
      {tab === 'general' && (
        <div className="admin-card max-w-2xl space-y-4">
          <h3 className="text-white font-semibold">Restaurant Information</h3>
          {[
            { key: 'restaurant_name', label: 'Restaurant Name', type: 'text' },
            { key: 'restaurant_tagline', label: 'Tagline', type: 'text' },
            { key: 'restaurant_phone', label: 'Phone Number', type: 'tel' },
            { key: 'restaurant_email', label: 'Email', type: 'email' },
            { key: 'restaurant_address', label: 'Address', type: 'text' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-gray-400 text-xs mb-1 block">{label}</label>
              <input type={type} value={settings[key] || ''} onChange={sh(key)} className="admin-input" />
            </div>
          ))}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Theme Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.theme_color || '#D4AF37'} onChange={sh('theme_color')} className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-surface-border" />
              <input value={settings.theme_color || '#D4AF37'} onChange={sh('theme_color')} className="admin-input flex-1" placeholder="#D4AF37" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Social Links</label>
            {['instagram', 'facebook', 'twitter'].map(platform => (
              <div key={platform} className="flex items-center gap-2 mb-2">
                <span className="text-gray-600 text-xs w-20 capitalize">{platform}</span>
                <input value={settings.social_links?.[platform] || ''} onChange={e => s('social_links', { ...settings.social_links, [platform]: e.target.value })} placeholder={`https://${platform}.com/...`} className="admin-input flex-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hours */}
      {tab === 'hours' && (
        <div className="admin-card max-w-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Opening Hours</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => s('is_open', !settings.is_open)} className={`w-10 h-5 rounded-full relative transition-colors ${settings.is_open ? 'bg-green-500' : 'bg-gray-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings.is_open ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className={`text-sm font-medium ${settings.is_open ? 'text-green-400' : 'text-gray-500'}`}>{settings.is_open ? 'Open Now' : 'Closed'}</span>
            </label>
          </div>
          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-gray-400 text-sm w-24">{DAY_LABELS[day]}</span>
                <input value={settings.opening_hours?.[day] || ''} onChange={e => s('opening_hours', { ...settings.opening_hours, [day]: e.target.value })} placeholder="12:00-23:00" className="admin-input flex-1 text-sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery */}
      {tab === 'delivery' && (
        <div className="admin-card max-w-md space-y-4">
          <h3 className="text-white font-semibold">Delivery Settings</h3>
          {[
            { key: 'delivery_fee', label: 'Delivery Fee (₹)', type: 'number' },
            { key: 'min_order_amount', label: 'Minimum Order Amount (₹)', type: 'number' },
            { key: 'delivery_radius', label: 'Delivery Radius (km)', type: 'number' },
            { key: 'estimated_delivery_time', label: 'Estimated Delivery Time (min)', type: 'number' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="text-gray-400 text-xs mb-1 block">{label}</label>
              <input type={type} value={settings[key] || ''} onChange={sh(key)} className="admin-input" />
            </div>
          ))}
        </div>
      )}

      {/* Features */}
      {tab === 'features' && (
        <div className="admin-card max-w-md">
          <h3 className="text-white font-semibold mb-5">Feature Toggles</h3>
          <div className="space-y-4">
            {[
              { key: 'delivery_enabled', label: 'Delivery Orders', desc: 'Allow customers to place delivery orders' },
              { key: 'pickup_enabled', label: 'Pickup Orders', desc: 'Allow customers to place pickup orders' },
              { key: 'reservation_enabled', label: 'Table Reservations', desc: 'Show reservation system to customers' },
              { key: 'reviews_enabled', label: 'Customer Reviews', desc: 'Allow customers to leave reviews' },
              { key: 'loyalty_enabled', label: 'Loyalty Program', desc: 'Enable points accumulation for orders' },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-start gap-3 py-3 border-b border-surface-border last:border-0">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
                <div onClick={() => s(key, !settings[key])} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors flex-shrink-0 mt-0.5 ${settings[key] ? 'bg-brand' : 'bg-surface-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment */}
      {tab === 'payment' && (
        <div className="admin-card max-w-md space-y-4">
          <h3 className="text-white font-semibold">Payment Settings</h3>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Tax Rate (%)</label>
            <input type="number" value={settings.tax_rate || 5} onChange={sh('tax_rate')} className="admin-input" />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Currency</label>
            <select value={settings.currency || 'INR'} onChange={sh('currency')} className="admin-input">
              <option value="INR">INR — Indian Rupee (₹)</option>
              <option value="USD">USD — US Dollar ($)</option>
              <option value="GBP">GBP — British Pound (£)</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Loyalty Points Rate</label>
            <p className="text-gray-500 text-xs mb-1">Earn 1 point per ₹<input type="number" value={settings.loyalty_rate || 10} onChange={sh('loyalty_rate')} className="admin-input inline-block w-16 mx-1 py-0.5" /> spent</p>
          </div>
          <div className="bg-surface rounded-xl p-4">
            <p className="text-gray-400 text-xs mb-1">Razorpay Keys</p>
            <p className="text-gray-600 text-xs">Configure in server/.env file:</p>
            <code className="text-brand text-xs block mt-2">RAZORPAY_KEY_ID=your_key<br/>RAZORPAY_KEY_SECRET=your_secret</code>
          </div>
        </div>
      )}
    </div>
  );
}
