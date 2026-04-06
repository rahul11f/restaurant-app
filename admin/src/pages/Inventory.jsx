import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiAlertTriangle, FiArrowUp, FiArrowDown, FiSearch, FiX } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

function InventoryModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item || { name: '', category: '', unit: 'kg', currentStock: 0, minThreshold: 10, costPerUnit: 0, supplier: { name: '', contact: '' } });
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (item?._id) { await api.put(`/inventory/${item._id}`, form); } else { await api.post('/inventory', form); }
      toast.success(item?._id ? 'Updated' : 'Added');
      onSave();
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4"><h3 className="text-white font-bold">{item?._id ? 'Edit Item' : 'Add Inventory'}</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><FiX /></button></div>
        <div className="space-y-3">
          <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Item name" className="admin-input" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.category} onChange={e => f('category', e.target.value)} placeholder="Category" className="admin-input" />
            <select value={form.unit} onChange={e => f('unit', e.target.value)} className="admin-input">
              {['kg', 'g', 'litre', 'ml', 'piece', 'dozen', 'box'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-gray-500 text-xs mb-1 block">Current Stock</label><input type="number" value={form.currentStock} onChange={e => f('currentStock', +e.target.value)} className="admin-input" /></div>
            <div><label className="text-gray-500 text-xs mb-1 block">Min Threshold</label><input type="number" value={form.minThreshold} onChange={e => f('minThreshold', +e.target.value)} className="admin-input" /></div>
            <div><label className="text-gray-500 text-xs mb-1 block">Cost/Unit (₹)</label><input type="number" value={form.costPerUnit} onChange={e => f('costPerUnit', +e.target.value)} className="admin-input" /></div>
          </div>
          <input value={form.supplier?.name || ''} onChange={e => f('supplier', { ...form.supplier, name: e.target.value })} placeholder="Supplier name" className="admin-input" />
          <input value={form.supplier?.contact || ''} onChange={e => f('supplier', { ...form.supplier, contact: e.target.value })} placeholder="Supplier phone" className="admin-input" />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="admin-btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="admin-btn flex-1 justify-center">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState(10);

  useEffect(() => { fetchInventory(); }, []);

  const fetchInventory = async () => {
    try { const res = await api.get('/inventory'); setItems(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const restock = async (id) => {
    try {
      await api.post(`/inventory/${id}/restock`, { quantity: restockQty, reason: 'Manual restock' });
      toast.success(`Added ${restockQty} units`); setRestockId(null); fetchInventory();
    } catch { toast.error('Failed'); }
  };

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.currentStock <= i.minThreshold);

  return (
    <div className="space-y-5">
      {modal && <InventoryModal item={modal === true ? null : modal} onSave={() => { setModal(false); fetchInventory(); }} onClose={() => setModal(false)} />}

      {lowStock.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-400 font-medium text-sm flex items-center gap-2"><FiAlertTriangle /> {lowStock.length} item{lowStock.length > 1 ? 's' : ''} below minimum threshold</p>
          <p className="text-yellow-400/60 text-xs mt-1">{lowStock.map(i => i.name).join(', ')}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div><h2 className="text-white font-bold text-lg">Inventory</h2><p className="text-gray-500 text-xs">{items.length} ingredients tracked</p></div>
        <div className="ml-auto flex gap-3">
          <div className="relative"><FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="admin-input pl-8 py-1.5 w-44" /></div>
          <button onClick={() => setModal(true)} className="admin-btn"><FiPlus /> Add Item</button>
        </div>
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-surface-border">{['Item', 'Category', 'Unit', 'Stock', 'Min', 'Cost/Unit', 'Supplier', 'Actions'].map(h => <th key={h} className="text-left text-gray-500 font-medium text-xs px-4 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? Array(8).fill(0).map((_, i) => <tr key={i} className="border-b border-surface-border">{Array(8).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}</tr>) :
              filtered.map(item => {
                const low = item.currentStock <= item.minThreshold;
                return (
                  <tr key={item._id} className={`border-b border-surface-border hover:bg-surface-hover transition-colors ${low ? 'bg-yellow-500/5' : ''}`}>
                    <td className="px-4 py-3"><p className="text-white font-medium">{item.name}</p>{low && <span className="badge badge-yellow text-xs">Low Stock</span>}</td>
                    <td className="px-4 py-3 text-gray-400">{item.category}</td>
                    <td className="px-4 py-3 text-gray-400">{item.unit}</td>
                    <td className="px-4 py-3"><span className={`font-bold ${low ? 'text-yellow-400' : 'text-white'}`}>{item.currentStock}</span></td>
                    <td className="px-4 py-3 text-gray-500">{item.minThreshold}</td>
                    <td className="px-4 py-3 text-gray-400">₹{item.costPerUnit || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.supplier?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {restockId === item._id ? (
                          <div className="flex items-center gap-1">
                            <input type="number" value={restockQty} onChange={e => setRestockQty(+e.target.value)} className="admin-input w-16 py-1 text-xs" min="1" />
                            <button onClick={() => restock(item._id)} className="admin-btn py-1 px-2 text-xs">Add</button>
                            <button onClick={() => setRestockId(null)} className="text-gray-500 hover:text-white px-1"><FiX className="text-xs" /></button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setRestockId(item._id); setRestockQty(10); }} className="admin-btn-ghost py-1 px-2 text-xs"><FiArrowUp className="text-xs" /> Restock</button>
                            <button onClick={() => setModal(item)} className="text-gray-400 hover:text-white p-1"><FiEdit2 className="text-sm" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="text-center text-gray-500 text-sm py-12">No inventory items found</p>}
      </div>
    </div>
  );
}
