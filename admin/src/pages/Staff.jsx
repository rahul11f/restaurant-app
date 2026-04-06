import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiUser } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

const ROLES = ['manager', 'chef', 'waiter', 'delivery', 'cashier', 'cleaner'];
const SHIFTS = ['morning', 'evening', 'night', 'full'];
const ROLE_COLORS = { manager: 'badge-purple', chef: 'badge-yellow', waiter: 'badge-blue', delivery: 'badge-green', cashier: 'badge-gray', cleaner: 'badge-gray' };

function StaffModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? {
    name: item.user?.name, email: item.user?.email, phone: item.user?.phone,
    role: item.role, salary: item.salary, shift: item.shift,
    joiningDate: item.joiningDate?.split('T')[0] || ''
  } : { name: '', email: '', phone: '', password: 'Staff@123', role: 'waiter', salary: '', shift: 'full', joiningDate: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (item?._id) { await api.put(`/staff/${item._id}`, form); } else { await api.post('/staff', form); }
      toast.success(item?._id ? 'Staff updated' : 'Staff added'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold">{item ? 'Edit Staff' : 'Add Staff'}</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><FiX /></button></div>
        <div className="space-y-3">
          <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Full Name" className="admin-input" />
          <input value={form.email} onChange={e => f('email', e.target.value)} type="email" placeholder="Email" className="admin-input" />
          <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="Phone" className="admin-input" />
          {!item && <input value={form.password} onChange={e => f('password', e.target.value)} placeholder="Password" className="admin-input" />}
          <div className="grid grid-cols-2 gap-3">
            <select value={form.role} onChange={e => f('role', e.target.value)} className="admin-input">{ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}</select>
            <select value={form.shift} onChange={e => f('shift', e.target.value)} className="admin-input">{SHIFTS.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.salary} onChange={e => f('salary', e.target.value)} placeholder="Monthly Salary (₹)" className="admin-input" />
            <input type="date" value={form.joiningDate} onChange={e => f('joiningDate', e.target.value)} className="admin-input" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="admin-btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="admin-btn flex-1 justify-center">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchStaff(); }, []);
  const fetchStaff = async () => {
    try { const res = await api.get('/staff'); setStaff(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this staff member?')) return;
    try { await api.delete(`/staff/${id}`); setStaff(prev => prev.filter(s => s._id !== id)); toast.success('Staff deactivated'); } catch { toast.error('Failed'); }
  };

  const filtered = staff.filter(s => !search || s.user?.name?.toLowerCase().includes(search.toLowerCase()) || s.user?.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      {modal && <StaffModal item={modal === true ? null : modal} onSave={() => { setModal(false); fetchStaff(); }} onClose={() => setModal(false)} />}
      <div className="flex items-center gap-4">
        <div><h2 className="text-white font-bold text-lg">Staff</h2><p className="text-gray-500 text-xs">{staff.length} active members</p></div>
        <div className="ml-auto flex gap-3">
          <div className="relative"><FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="admin-input pl-8 py-1.5 w-44" /></div>
          <button onClick={() => setModal(true)} className="admin-btn"><FiPlus /> Add Staff</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => <div key={i} className="admin-card h-36 animate-pulse bg-surface-hover" />) :
          filtered.map(s => (
            <div key={s._id} className="admin-card hover:border-gray-600 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
                  {s.user?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{s.user?.name}</p>
                  <p className="text-gray-500 text-xs truncate">{s.user?.email}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={`badge ${ROLE_COLORS[s.role] || 'badge-gray'} capitalize`}>{s.role}</span>
                    <span className="badge badge-gray capitalize">{s.shift}</span>
                    <span className="badge badge-gray">{s.employeeId}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
                <p className="text-brand text-sm font-semibold">₹{s.salary?.toLocaleString('en-IN') || '—'}/mo</p>
                <div className="flex gap-1">
                  <button onClick={() => setModal(s)} className="text-gray-400 hover:text-white p-1"><FiEdit2 className="text-sm" /></button>
                  <button onClick={() => deactivate(s._id)} className="text-gray-400 hover:text-red-400 p-1"><FiTrash2 className="text-sm" /></button>
                </div>
              </div>
            </div>
          ))}
      </div>
      {!loading && filtered.length === 0 && <p className="text-center text-gray-500 text-sm py-12">No staff found</p>}
    </div>
  );
}
