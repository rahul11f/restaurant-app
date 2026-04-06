import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSend, FiTag } from 'react-icons/fi';
import api from '../store';
import toast from 'react-hot-toast';

const EMPTY = { title: '', description: '', code: '', type: 'percentage', value: 0, minOrderValue: 0, maxDiscount: 500, usageLimit: 100, validFrom: new Date().toISOString().split('T')[0], validTo: '', isActive: true, isFeatured: false };

function OfferModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { ...item, validFrom: item.validFrom?.split('T')[0], validTo: item.validTo?.split('T')[0] } : EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (item?._id) { await api.put(`/offers/${item._id}`, form); } else { await api.post('/offers', form); }
      toast.success(item?._id ? 'Offer updated' : 'Offer created'); onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5"><h3 className="text-white font-bold">{item ? 'Edit Offer' : 'New Offer'}</h3><button onClick={onClose} className="text-gray-400 hover:text-white"><FiX /></button></div>
        <div className="space-y-3">
          <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Offer title" className="admin-input" />
          <textarea value={form.description} onChange={e => f('description', e.target.value)} placeholder="Description" className="admin-input min-h-[60px] resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.code} onChange={e => f('code', e.target.value.toUpperCase())} placeholder="COUPON CODE" className="admin-input font-mono uppercase" />
            <select value={form.type} onChange={e => f('type', e.target.value)} className="admin-input">
              <option value="percentage">Percentage %</option>
              <option value="flat">Flat ₹</option>
              <option value="bogo">BOGO</option>
              <option value="free-delivery">Free Delivery</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="text-gray-500 text-xs mb-1 block">Value</label><input type="number" value={form.value} onChange={e => f('value', +e.target.value)} className="admin-input" /></div>
            <div><label className="text-gray-500 text-xs mb-1 block">Min Order ₹</label><input type="number" value={form.minOrderValue} onChange={e => f('minOrderValue', +e.target.value)} className="admin-input" /></div>
            <div><label className="text-gray-500 text-xs mb-1 block">Max Discount ₹</label><input type="number" value={form.maxDiscount} onChange={e => f('maxDiscount', +e.target.value)} className="admin-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-gray-500 text-xs mb-1 block">Valid From</label><input type="date" value={form.validFrom} onChange={e => f('validFrom', e.target.value)} className="admin-input" /></div>
            <div><label className="text-gray-500 text-xs mb-1 block">Valid To</label><input type="date" value={form.validTo} onChange={e => f('validTo', e.target.value)} className="admin-input" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-gray-500 text-xs mb-1 block">Usage Limit</label><input type="number" value={form.usageLimit} onChange={e => f('usageLimit', +e.target.value)} className="admin-input" /></div>
          </div>
          <div className="flex gap-4">
            {[['isActive', 'Active'], ['isFeatured', 'Featured']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => f(key, !form[key])} className={`w-9 h-5 rounded-full relative transition-colors ${form[key] ? 'bg-brand' : 'bg-surface-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-gray-400 text-xs">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-5"><button onClick={onClose} className="admin-btn-ghost flex-1 justify-center">Cancel</button><button onClick={handleSave} disabled={saving} className="admin-btn flex-1 justify-center">{saving ? 'Saving...' : 'Save Offer'}</button></div>
      </div>
    </div>
  );
}

export default function OffersManager() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [blasting, setBlasting] = useState('');

  useEffect(() => { fetchOffers(); }, []);
  const fetchOffers = async () => {
    try { const res = await api.get('/offers/admin'); setOffers(res.data); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const deleteOffer = async (id) => {
    if (!confirm('Delete this offer?')) return;
    try { await api.delete(`/offers/${id}`); setOffers(p => p.filter(o => o._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  const blast = async (id) => {
    setBlasting(id);
    try { const res = await api.post(`/offers/${id}/blast`); toast.success(res.data.message); } catch { toast.error('Blast failed'); } finally { setBlasting(''); }
  };

  const now = new Date();

  return (
    <div className="space-y-5">
      {modal && <OfferModal item={modal === true ? null : modal} onSave={() => { setModal(false); fetchOffers(); }} onClose={() => setModal(false)} />}
      <div className="flex items-center gap-4">
        <div><h2 className="text-white font-bold text-lg">Offers & Coupons</h2><p className="text-gray-500 text-xs">{offers.length} total offers</p></div>
        <button onClick={() => setModal(true)} className="admin-btn ml-auto"><FiPlus /> New Offer</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(4).fill(0).map((_, i) => <div key={i} className="admin-card h-48 animate-pulse bg-surface-hover" />) :
          offers.map(offer => {
            const active = offer.isActive && new Date(offer.validFrom) <= now && new Date(offer.validTo) >= now;
            return (
              <div key={offer._id} className={`admin-card ${active ? 'border-brand/20' : 'opacity-60'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold">{offer.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{offer.description}</p>
                  </div>
                  <span className={`badge ${active ? 'badge-green' : 'badge-gray'} flex-shrink-0 ml-2`}>{active ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-brand font-bold text-sm bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-lg"><FiTag className="inline text-xs mr-1" />{offer.code}</span>
                  <span className="badge badge-blue text-xs">{offer.type === 'percentage' ? `${offer.value}%` : offer.type === 'flat' ? `₹${offer.value}` : 'Free Del.'}</span>
                  {offer.isFeatured && <span className="badge badge-yellow text-xs">Featured</span>}
                </div>
                <div className="text-xs text-gray-500 space-y-0.5 mb-3">
                  <p>Min order: ₹{offer.minOrderValue} · Max: ₹{offer.maxDiscount || '∞'}</p>
                  <p>Used: {offer.usedCount}/{offer.usageLimit || '∞'}</p>
                  <p>Valid: {new Date(offer.validFrom).toLocaleDateString('en-IN')} – {new Date(offer.validTo).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="flex gap-2 border-t border-surface-border pt-3">
                  <button onClick={() => blast(offer._id)} disabled={blasting === offer._id || !active} className="admin-btn-ghost py-1.5 px-3 text-xs flex-1 justify-center disabled:opacity-40">
                    <FiSend className="text-xs" />{blasting === offer._id ? 'Sending...' : 'WhatsApp Blast'}
                  </button>
                  <button onClick={() => setModal(offer)} className="text-gray-400 hover:text-white p-1.5"><FiEdit2 className="text-sm" /></button>
                  <button onClick={() => deleteOffer(offer._id)} className="text-gray-400 hover:text-red-400 p-1.5"><FiTrash2 className="text-sm" /></button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
