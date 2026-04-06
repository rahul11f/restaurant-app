import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiSearch, FiStar, FiImage, FiX } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', category: '', price: '', discountedPrice: '', images: [''], tags: [], spiceLevel: 0, calories: '', preparationTime: 20, allergens: [], isAvailable: true, isFeatured: false, isSpecial: false };
const TAG_OPTIONS = ['veg', 'non-veg', 'vegan', 'spicy', 'chef-special', 'bestseller', 'healthy', 'gluten-free', 'seafood'];

function Modal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState(item || EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (item?._id) { await api.put(`/menu/${item._id}`, form); toast.success('Item updated'); }
      else { await api.post('/menu', form); toast.success('Item created'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const toggleTag = (tag) => f('tags', form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-surface-border sticky top-0 bg-surface-card z-10">
          <h2 className="text-white font-bold">{item?._id ? 'Edit Item' : 'New Menu Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><FiX /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Item Name *</label>
              <input value={form.name} onChange={e => f('name', e.target.value)} className="admin-input" placeholder="e.g. Butter Chicken" required />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Description *</label>
              <textarea value={form.description} onChange={e => f('description', e.target.value)} className="admin-input min-h-[80px] resize-none" placeholder="Describe the dish..." />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Category *</label>
              <div className="flex gap-2">
                <select value={form.category} onChange={e => f('category', e.target.value)} className="admin-input flex-1">
                  <option value="">Select</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__new__">+ New Category</option>
                </select>
              </div>
              {form.category === '__new__' && <input placeholder="Category name" className="admin-input mt-2" onChange={e => f('category', e.target.value)} />}
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Prep Time (min)</label>
              <input type="number" value={form.preparationTime} onChange={e => f('preparationTime', e.target.value)} className="admin-input" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => f('price', e.target.value)} className="admin-input" placeholder="299" required />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Discounted Price (₹)</label>
              <input type="number" value={form.discountedPrice} onChange={e => f('discountedPrice', e.target.value)} className="admin-input" placeholder="Optional" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Calories</label>
              <input type="number" value={form.calories} onChange={e => f('calories', e.target.value)} className="admin-input" placeholder="Optional" />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">Spice Level (0–5)</label>
              <input type="range" min="0" max="5" value={form.spiceLevel} onChange={e => f('spiceLevel', +e.target.value)} className="w-full accent-brand mt-2" />
              <div className="flex justify-between text-gray-600 text-xs mt-1"><span>Mild</span><span>🌶️ {form.spiceLevel}</span><span>Very Hot</span></div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 text-xs mb-1 block">Image URL</label>
              <input value={form.images?.[0] || ''} onChange={e => f('images', [e.target.value])} className="admin-input" placeholder="https://..." />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-gray-400 text-xs mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${form.tags.includes(tag) ? 'bg-brand/20 border-brand text-brand' : 'border-surface-border text-gray-500 hover:border-gray-400'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-4">
            {[['isAvailable', 'Available'], ['isFeatured', 'Featured'], ['isSpecial', 'Special']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => f(key, !form[key])} className={`w-10 h-5 rounded-full relative transition-colors ${form[key] ? 'bg-brand' : 'bg-surface-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-gray-400 text-xs">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="admin-btn-ghost flex-1 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="admin-btn flex-1 justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setItems(res.data.items || []);
      setCategories(res.data.categories || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleItem = async (id) => {
    try {
      const res = await api.patch(`/menu/${id}/toggle`);
      setItems(prev => prev.map(i => i._id === id ? res.data : i));
      toast.success(res.data.isAvailable ? 'Item enabled' : 'Item disabled');
    } catch { toast.error('Failed'); }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this item?')) return;
    setDeleting(id);
    try {
      await api.delete(`/menu/${id}`);
      setItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(''); }
  };

  const filtered = items.filter(item => {
    const matchCat = !activeCategory || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-5">
      {modal !== undefined && modal !== false && (
        <Modal item={modal === true ? null : modal} categories={categories} onSave={() => { setModal(false); fetchMenu(); }} onClose={() => setModal(false)} />
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div><h2 className="text-white font-bold text-lg">Menu Manager</h2><p className="text-gray-500 text-xs">{items.length} items across {categories.length} categories</p></div>
        <div className="ml-auto flex gap-3">
          <div className="relative"><FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="admin-input pl-8 py-1.5 w-48" /></div>
          <button onClick={() => setModal(true)} className="admin-btn"><FiPlus /> Add Item</button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory('')} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!activeCategory ? 'bg-brand text-gray-900' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'}`}>All ({items.length})</button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-brand text-gray-900' : 'bg-surface-card border border-surface-border text-gray-400 hover:text-white'}`}>
            {cat} ({items.filter(i => i.category === cat).length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border">
                {['Item', 'Category', 'Price', 'Rating', 'Orders', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium text-xs px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-surface-border">
                  {Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-hover rounded animate-pulse" /></td>)}
                </tr>
              )) : filtered.map(item => (
                <tr key={item._id} className="border-b border-surface-border hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {item.images?.[0] ? <img src={item.images[0]} alt={item.name} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" /> : <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center"><FiImage className="text-gray-600" /></div>}
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <div className="flex gap-1 mt-0.5">{item.tags?.slice(0, 2).map(t => <span key={t} className="badge badge-gray">{t}</span>)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.category}</td>
                  <td className="px-4 py-3">
                    <p className="text-brand font-semibold">₹{item.discountedPrice || item.price}</p>
                    {item.discountedPrice && <p className="text-gray-600 text-xs line-through">₹{item.price}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1"><FiStar className="text-brand text-xs" /><span className="text-gray-300 text-xs">{item.rating?.toFixed(1) || '-'}</span><span className="text-gray-600 text-xs">({item.reviewCount || 0})</span></div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{item.orderCount || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleItem(item._id)} className={`flex items-center gap-1 text-xs ${item.isAvailable ? 'text-green-400' : 'text-gray-600'}`}>
                      {item.isAvailable ? <FiToggleRight className="text-lg" /> : <FiToggleLeft className="text-lg" />}
                      {item.isAvailable ? 'On' : 'Off'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setModal(item)} className="text-gray-400 hover:text-white transition-colors p-1"><FiEdit2 className="text-sm" /></button>
                      <button onClick={() => deleteItem(item._id)} disabled={deleting === item._id} className="text-gray-400 hover:text-red-400 transition-colors p-1 disabled:opacity-40">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <p className="text-center text-gray-500 text-sm py-12">No items found</p>}
        </div>
      </div>
    </div>
  );
}
