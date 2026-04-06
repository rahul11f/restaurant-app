import React, { useState, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiMail, FiBell, FiUsers } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('send');
  const [form, setForm] = useState({ channel: 'whatsapp', phone: '', message: '', subject: '', segment: 'all' });
  const [broadcastForm, setBroadcastForm] = useState({ channel: 'whatsapp', message: '', subject: 'Update from Spice & Soul', segment: 'all' });
  const [sending, setSending] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const bf = (k, v) => setBroadcastForm(p => ({ ...p, [k]: v }));

  useEffect(() => { fetchLogs(); }, []);
  const fetchLogs = async () => {
    try { const res = await api.get('/notifications'); setLogs(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const sendCustom = async () => {
    if (!form.message) return toast.error('Enter message');
    setSending(true);
    try {
      if (form.channel === 'whatsapp') {
        if (!form.phone) return toast.error('Enter phone');
        await api.post('/notifications/whatsapp/custom', { phone: form.phone, message: form.message });
      } else {
        if (!form.email) return toast.error('Enter email');
        await api.post('/notifications/email/custom', { to: form.email, subject: form.subject || 'Message from Spice & Soul', html: `<p>${form.message}</p>` });
      }
      toast.success('Message sent!'); fetchLogs();
    } catch { toast.error('Send failed'); } finally { setSending(false); }
  };

  const sendBroadcast = async () => {
    if (!broadcastForm.message) return toast.error('Enter message');
    if (!confirm(`Send to ALL customers via ${broadcastForm.channel}?`)) return;
    setSending(true);
    try {
      const res = await api.post('/notifications/broadcast', broadcastForm);
      toast.success(res.data.message); fetchLogs();
    } catch { toast.error('Broadcast failed'); } finally { setSending(false); }
  };

  const TABS = [{ id: 'send', label: 'Send Custom', icon: FiSend }, { id: 'broadcast', label: 'Broadcast', icon: FiUsers }, { id: 'logs', label: 'History', icon: FiBell }];

  return (
    <div className="space-y-5">
      <div><h2 className="text-white font-bold text-lg">Notifications</h2><p className="text-gray-500 text-xs">WhatsApp, email & push notifications center</p></div>

      <div className="flex gap-2 border-b border-surface-border pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === id ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-white'}`}>
            <Icon className="text-sm" />{label}
          </button>
        ))}
      </div>

      {tab === 'send' && (
        <div className="admin-card max-w-lg space-y-4">
          <h3 className="text-white font-semibold">Send Custom Message</h3>
          <div className="flex gap-2">
            {[['whatsapp', FiMessageSquare, 'WhatsApp'], ['email', FiMail, 'Email']].map(([val, Icon, label]) => (
              <button key={val} onClick={() => f('channel', val)} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-all ${form.channel === val ? 'border-brand bg-brand/10 text-brand' : 'border-surface-border text-gray-400 hover:text-white'}`}>
                <Icon className="text-sm" />{label}
              </button>
            ))}
          </div>
          {form.channel === 'whatsapp' ? (
            <input value={form.phone || ''} onChange={e => f('phone', e.target.value)} placeholder="Phone number (e.g. 9876543210)" className="admin-input" />
          ) : (
            <>
              <input value={form.email || ''} onChange={e => f('email', e.target.value)} placeholder="Email address" className="admin-input" type="email" />
              <input value={form.subject} onChange={e => f('subject', e.target.value)} placeholder="Email subject" className="admin-input" />
            </>
          )}
          <textarea value={form.message} onChange={e => f('message', e.target.value)} placeholder="Your message..." className="admin-input min-h-[120px] resize-none" />
          <button onClick={sendCustom} disabled={sending} className="admin-btn w-full justify-center disabled:opacity-60">
            <FiSend className="text-sm" />{sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      )}

      {tab === 'broadcast' && (
        <div className="admin-card max-w-lg space-y-4">
          <h3 className="text-white font-semibold">Broadcast to Customers</h3>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-yellow-400 text-xs">⚠️ This will send to ALL matching customers. Use responsibly.</p>
          </div>
          <div className="flex gap-2">
            {[['whatsapp', 'WhatsApp'], ['email', 'Email']].map(([val, label]) => (
              <button key={val} onClick={() => bf('channel', val)} className={`flex-1 py-2 rounded-lg border text-sm transition-all ${broadcastForm.channel === val ? 'border-brand bg-brand/10 text-brand' : 'border-surface-border text-gray-400'}`}>{label}</button>
            ))}
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Customer Segment</label>
            <select value={broadcastForm.segment} onChange={e => bf('segment', e.target.value)} className="admin-input">
              <option value="all">All Customers</option>
              <option value="vip">VIP (spent ₹5000+)</option>
              <option value="new">New (≤2 orders)</option>
            </select>
          </div>
          {broadcastForm.channel === 'email' && <input value={broadcastForm.subject} onChange={e => bf('subject', e.target.value)} placeholder="Email subject" className="admin-input" />}
          <textarea value={broadcastForm.message} onChange={e => bf('message', e.target.value)} placeholder="Broadcast message..." className="admin-input min-h-[120px] resize-none" />
          <button onClick={sendBroadcast} disabled={sending} className="admin-btn w-full justify-center bg-red-500 hover:bg-red-400 disabled:opacity-60">
            <FiUsers className="text-sm" />{sending ? 'Broadcasting...' : 'Send to All'}
          </button>
        </div>
      )}

      {tab === 'logs' && (
        <div className="admin-card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-border">{['Type', 'Recipient', 'Message', 'Status', 'Time'].map(h => <th key={h} className="text-left text-gray-500 font-medium text-xs px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {loading ? Array(6).fill(0).map((_, i) => <tr key={i} className="border-b border-surface-border">{Array(5).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>) :
                logs.map(log => (
                  <tr key={log._id} className="border-b border-surface-border hover:bg-surface-hover">
                    <td className="px-4 py-3"><span className={`badge ${log.type === 'whatsapp' ? 'badge-green' : log.type === 'email' ? 'badge-blue' : 'badge-gray'}`}>{log.type}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{log.recipient}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">{log.message?.slice(0, 60)}...</td>
                    <td className="px-4 py-3"><span className={`badge ${log.status === 'sent' ? 'badge-green' : 'badge-red'}`}>{log.status}</span></td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!loading && logs.length === 0 && <p className="text-center text-gray-500 text-sm py-12">No notifications sent yet</p>}
        </div>
      )}
    </div>
  );
}
