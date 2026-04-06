import React, { useState, useEffect } from 'react';
import { FiSearch, FiUser, FiStar, FiAward, FiArrowRight, FiX } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);

  useEffect(() => { fetchCustomers(); }, [search, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}&page=${page}`);
      setCustomers(res.data.customers || []); setTotal(res.data.total || 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const viewCustomer = async (id) => {
    try { const res = await api.get(`/customers/${id}`); setCustomerDetail(res.data); setSelected(id); }
    catch { toast.error('Failed to load customer'); }
  };

  return (
    <div className="space-y-5">
      {/* Customer detail modal */}
      {selected && customerDetail && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Customer Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold text-lg">{customerDetail.customer?.name?.[0]}</div>
              <div><p className="text-white font-semibold">{customerDetail.customer?.name}</p><p className="text-gray-400 text-sm">{customerDetail.customer?.email}</p><p className="text-gray-500 text-xs">{customerDetail.customer?.phone}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[['Orders', customerDetail.orders?.length || 0, 'text-brand'], ['Spent', `₹${customerDetail.customer?.totalSpent?.toLocaleString('en-IN') || 0}`, 'text-green-400'], ['Points', customerDetail.customer?.loyaltyPoints || 0, 'text-yellow-400']].map(([l, v, c]) => (
                <div key={l} className="bg-surface rounded-xl p-3 text-center"><p className={`font-bold text-xl ${c}`}>{v}</p><p className="text-gray-500 text-xs">{l}</p></div>
              ))}
            </div>
            <h4 className="text-gray-400 text-sm font-medium mb-2">Recent Orders</h4>
            <div className="space-y-2">
              {customerDetail.orders?.slice(0, 5).map(o => (
                <div key={o._id} className="flex items-center justify-between p-2 bg-surface rounded-lg">
                  <div><p className="text-white text-sm">#{o.orderNumber}</p><p className="text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p></div>
                  <div className="text-right"><p className="text-brand font-semibold text-sm">₹{o.total}</p><span className={`text-xs ${o.status === 'delivered' ? 'text-green-400' : 'text-gray-400'}`}>{o.status}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div><h2 className="text-white font-bold text-lg">Customers</h2><p className="text-gray-500 text-xs">{total} registered customers</p></div>
        <div className="ml-auto relative"><FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" /><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search customers..." className="admin-input pl-8 py-1.5 w-56" /></div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-surface-border">{['Customer', 'Phone', 'Orders', 'Total Spent', 'Points', 'Joined', 'Action'].map(h => <th key={h} className="text-left text-gray-500 font-medium text-xs px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => <tr key={i} className="border-b border-surface-border">{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>) :
              customers.map(c => (
                <tr key={c._id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-xs">{c.name?.[0]}</div>
                      <div><p className="text-white font-medium">{c.name}</p><p className="text-gray-500 text-xs">{c.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-white font-medium">{c.totalOrders || 0}</td>
                  <td className="px-4 py-3 text-brand font-semibold">₹{c.totalSpent?.toLocaleString('en-IN') || 0}</td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1 text-yellow-400"><FiStar className="text-xs" />{c.loyaltyPoints || 0}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-4 py-3"><button onClick={() => viewCustomer(c._id)} className="text-brand text-xs hover:underline flex items-center gap-1">View <FiArrowRight className="text-xs" /></button></td>
                </tr>
              ))}
          </tbody>
        </table>
        {!loading && customers.length === 0 && <p className="text-center text-gray-500 text-sm py-12">No customers found</p>}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-xs">Showing {customers.length} of {total}</p>
        <div className="flex gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="admin-btn-ghost py-1.5 px-3 text-xs disabled:opacity-40">← Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={customers.length < 20} className="admin-btn-ghost py-1.5 px-3 text-xs disabled:opacity-40">Next →</button>
        </div>
      </div>
    </div>
  );
}
