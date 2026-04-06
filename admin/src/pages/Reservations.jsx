import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUsers, FiCheck, FiX, FiClock, FiSearch } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';
import { format, addDays, startOfToday } from 'date-fns';

const STATUS_STYLES = {
  pending:   'badge-yellow', confirmed: 'badge-green', seated: 'badge-blue',
  completed: 'badge-gray',  cancelled: 'badge-red',   'no-show': 'badge-red'
};

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState('');

  useEffect(() => { fetchReservations(); }, [date]);

  const fetchReservations = async () => {
    setLoading(true);
    try { const res = await api.get(`/reservations/admin?date=${date}`); setReservations(res.data); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateStatus = async (id, status, tableNumber) => {
    setUpdating(id);
    try {
      await api.patch(`/reservations/${id}/status`, { status, tableNumber });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status, tableNumber: tableNumber || r.tableNumber } : r));
      toast.success(`Reservation ${status}`);
    } catch { toast.error('Update failed'); } finally { setUpdating(''); }
  };

  const filtered = reservations.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return r.customerInfo?.name?.toLowerCase().includes(s) || r.customerInfo?.phone?.includes(s) || r.reservationNumber?.toLowerCase().includes(s);
  });

  // Quick date navigation
  const quickDates = Array.from({ length: 7 }, (_, i) => addDays(startOfToday(), i));

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    pending: reservations.filter(r => r.status === 'pending').length,
    seated: reservations.filter(r => r.status === 'seated').length,
    totalGuests: reservations.reduce((s, r) => s + (r.guests || 0), 0),
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div><h2 className="text-white font-bold text-lg">Reservations</h2><p className="text-gray-500 text-xs">{stats.total} bookings · {stats.totalGuests} guests for {format(new Date(date + 'T00:00:00'), 'dd MMM yyyy')}</p></div>
        <div className="ml-auto flex gap-3 items-center flex-wrap">
          <div className="relative"><FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="admin-input pl-8 py-1.5 w-44" /></div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="admin-input py-1.5 w-40" />
        </div>
      </div>

      {/* Quick date tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {quickDates.map(d => {
          const key = format(d, 'yyyy-MM-dd');
          const isToday = key === format(new Date(), 'yyyy-MM-dd');
          const isSelected = key === date;
          return (
            <button key={key} onClick={() => setDate(key)} className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${isSelected ? 'bg-brand text-gray-900 border-brand' : 'bg-surface-card border-surface-border text-gray-400 hover:text-white'}`}>
              <div>{isToday ? 'Today' : format(d, 'EEE')}</div>
              <div className="font-bold">{format(d, 'd')}</div>
            </button>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[['Total', stats.total, 'text-white'], ['Pending', stats.pending, 'text-yellow-400'], ['Confirmed', stats.confirmed, 'text-green-400'], ['Seated', stats.seated, 'text-blue-400'], ['Guests', stats.totalGuests, 'text-brand']].map(([label, val, color]) => (
          <div key={label} className="admin-card text-center py-3">
            <p className={`font-bold text-2xl ${color}`}>{val}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Reservations list */}
      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-surface-border">{['#', 'Guest', 'Contact', 'Time', 'Guests', 'Section', 'Table', 'Occasion', 'Status', 'Actions'].map(h => <th key={h} className="text-left text-gray-500 font-medium text-xs px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => <tr key={i} className="border-b border-surface-border">{Array(10).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>) :
              filtered.map(r => (
                <tr key={r._id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 text-brand text-xs font-medium">{r.reservationNumber}</td>
                  <td className="px-4 py-3 text-white font-medium">{r.customerInfo?.name}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{r.customerInfo?.phone}</td>
                  <td className="px-4 py-3 text-gray-300 flex items-center gap-1"><FiClock className="text-gray-600 text-xs" />{r.time}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-gray-300"><FiUsers className="text-gray-600 text-xs" />{r.guests}</span></td>
                  <td className="px-4 py-3 text-gray-400 capitalize">{r.section}</td>
                  <td className="px-4 py-3 text-gray-400">{r.tableNumber || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.occasion || '—'}</td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_STYLES[r.status] || 'badge-gray'}`}>{r.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {r.status === 'pending' && <>
                        <button onClick={() => updateStatus(r._id, 'confirmed')} disabled={updating === r._id} className="admin-btn py-1 px-2 text-xs"><FiCheck className="text-xs" /></button>
                        <button onClick={() => updateStatus(r._id, 'cancelled')} disabled={updating === r._id} className="admin-btn-ghost py-1 px-2 text-xs text-red-400 hover:text-red-300"><FiX className="text-xs" /></button>
                      </>}
                      {r.status === 'confirmed' && <button onClick={() => updateStatus(r._id, 'seated')} disabled={updating === r._id} className="admin-btn py-1 px-2 text-xs">Seat</button>}
                      {r.status === 'seated' && <button onClick={() => updateStatus(r._id, 'completed')} disabled={updating === r._id} className="admin-btn py-1 px-2 text-xs">Done</button>}
                      {['pending', 'confirmed'].includes(r.status) && <button onClick={() => updateStatus(r._id, 'no-show')} disabled={updating === r._id} className="text-gray-600 hover:text-gray-400 text-xs px-1">No-show</button>}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="text-center text-gray-500 text-sm py-12">No reservations for this date</p>}
      </div>
    </div>
  );
}
