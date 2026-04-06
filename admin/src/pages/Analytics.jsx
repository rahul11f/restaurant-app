import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import api from '../store';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [menuPerf, setMenuPerf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get(`/analytics/revenue?period=${period}`),
      api.get('/analytics/peak-hours'),
      api.get('/analytics/menu-performance'),
    ]).then(([dash, rev, peak, menu]) => {
      setDashboard(dash.data);
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      setRevenue(rev.data.map(d => ({ ...d, month: MONTHS[(d._id || 1) - 1] || `W${d._id}`, revenue: Math.round(d.revenue) })));
      const HOURS = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0, revenue: 0 }));
      peak.data.forEach(d => { if (d._id >= 0 && d._id < 24) { HOURS[d._id].count = d.count; HOURS[d._id].revenue = d.revenue; } });
      setPeakHours(HOURS.filter(h => h.count > 0));
      setMenuPerf(menu.data.slice(0, 10));
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  const TOOLTIP_STYLE = { contentStyle: { background: '#1F2937', border: '1px solid #374151', borderRadius: 8 }, labelStyle: { color: '#F9FAFB' } };

  if (loading) return <div className="space-y-4"><div className="grid grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="admin-card h-48 animate-pulse bg-surface-hover" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-white font-bold text-lg">Analytics</h2><p className="text-gray-500 text-xs">Performance insights for your restaurant</p></div>
        <div className="flex gap-2">
          {['monthly', 'weekly'].map(p => <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-colors ${period === p ? 'bg-brand text-gray-900' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'}`}>{p}</button>)}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `₹${(dashboard?.today?.revenue || 0).toLocaleString('en-IN')}`, sub: `${dashboard?.today?.orders || 0} orders`, color: 'text-brand' },
          { label: 'Month Revenue', value: `₹${((dashboard?.month?.revenue || 0) / 1000).toFixed(1)}k`, sub: `${dashboard?.month?.orders || 0} orders`, color: 'text-green-400' },
          { label: 'Avg Order Value', value: `₹${dashboard?.today?.avgOrderValue || 0}`, sub: 'Today', color: 'text-blue-400' },
          { label: 'Total Customers', value: (dashboard?.totalCustomers || 0).toLocaleString(), sub: 'Registered', color: 'text-purple-400' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="admin-card"><p className="text-gray-500 text-xs mb-1">{label}</p><p className={`font-bold text-2xl ${color}`}>{value}</p><p className="text-gray-600 text-xs mt-0.5">{sub}</p></div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="admin-card">
        <h3 className="text-white font-semibold mb-4">Revenue Trend ({period})</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenue}>
            <defs><linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} /><stop offset="95%" stopColor="#D4AF37" stopOpacity={0} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#6B7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#rGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak hours */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#6B7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
              <Tooltip {...TOOLTIP_STYLE} formatter={v => [v, 'Orders']} />
              <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top menu items */}
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4">Top Performing Items</h3>
          <div className="space-y-2">
            {menuPerf.slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-gray-600 text-xs w-4">{i + 1}.</span>
                <p className="text-gray-300 text-sm flex-1 truncate">{item._id}</p>
                <div className="text-right">
                  <p className="text-brand text-sm font-semibold">₹{Math.round(item.totalRevenue || 0).toLocaleString('en-IN')}</p>
                  <p className="text-gray-600 text-xs">{item.totalQuantity} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      {dashboard?.statusBreakdown?.length > 0 && (
        <div className="admin-card">
          <h3 className="text-white font-semibold mb-4">Today's Order Status</h3>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width={180} height={180}>
              <PieChart><Pie data={dashboard.statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {dashboard.statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie></PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {dashboard.statusBreakdown.map((s, i) => (
                <div key={s._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} /><span className="text-gray-400 text-sm capitalize">{s._id}</span></div>
                  <span className="text-white font-semibold text-sm">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
