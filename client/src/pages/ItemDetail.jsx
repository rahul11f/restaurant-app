import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiStar, FiClock, FiPlus, FiMinus, FiHeart } from 'react-icons/fi';
import { GiChiliPepper } from 'react-icons/gi';
import toast from 'react-hot-toast';
import api from '../api/api';
import { useStore } from '../store/useStore';

export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState('');
  const [addons, setAddons] = useState([]);
  const [notes, setNotes] = useState('');
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useStore();

  useEffect(() => {
    Promise.all([api.get(`/menu/${id}`), api.get(`/reviews?menuItem=${id}`)]).then(([itemRes, reviewRes]) => {
      setItem(itemRes.data);
      setReviews(reviewRes.data);
      if (itemRes.data.variants?.length > 0) setVariant(itemRes.data.variants[0].name);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addToCart(item, qty, variant || null, addons, notes);
    setCartOpen(true);
    toast.success('Added to cart!', { icon: '🛒' });
  };

  const toggleAddon = (name) => setAddons(p => p.includes(name) ? p.filter(a => a !== name) : [...p, name]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-24"><div className="w-12 h-12 border-2 border-t-gold rounded-full animate-spin" /></div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center pt-24"><p className="text-cream/50">Item not found</p></div>;

  const wishlisted = isWishlisted(item._id);
  const displayPrice = variant ? (item.variants.find(v => v.name === variant)?.price || item.price) : (item.discountedPrice || item.price);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/menu" className="inline-flex items-center gap-2 text-cream/50 hover:text-gold transition-colors font-body text-sm mb-6"><FiArrowLeft /> Back to Menu</Link>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} alt={item.name} className="w-full h-full object-cover" />
            </div>
            {item.images?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {item.images.slice(1, 4).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-20 h-20 rounded-xl object-cover cursor-pointer opacity-70 hover:opacity-100 transition-opacity" />
                ))}
              </div>
            )}
            <button onClick={() => toggleWishlist(item._id)} className={`absolute top-4 right-4 p-3 rounded-full glass transition-colors ${wishlisted ? 'text-red-400' : 'text-cream/50 hover:text-red-400'}`}>
              <FiHeart className={wishlisted ? 'fill-current' : ''} />
            </button>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.tags?.includes('veg') ? 'border-green-500' : 'border-red-500'}`}>
                <div className={`w-2 h-2 rounded-full ${item.tags?.includes('veg') ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
              <span className="text-cream/40 text-xs font-body capitalize">{item.category}</span>
              {item.isSpecial && <span className="bg-gold text-dark text-[10px] font-bold px-2 py-0.5 rounded-full">Chef's Special</span>}
            </div>

            <h1 className="font-display text-4xl text-cream mb-3">{item.name}</h1>
            <p className="text-cream/60 font-body leading-relaxed mb-4">{item.description}</p>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-5 text-sm font-body">
              <div className="flex items-center gap-1"><FiStar className="text-gold fill-current" /><span className="text-cream">{item.rating?.toFixed(1)}</span><span className="text-cream/40">({item.reviewCount})</span></div>
              <div className="flex items-center gap-1 text-cream/60"><FiClock className="text-gold" />{item.preparationTime} min</div>
              {item.calories && <span className="text-cream/40">{item.calories} kcal</span>}
              {item.spiceLevel > 0 && (
                <div className="flex gap-0.5">{Array(item.spiceLevel).fill(0).map((_, i) => <GiChiliPepper key={i} className="text-red-500" />)}</div>
              )}
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {item.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-dark border border-dark-border text-cream/50 text-xs font-body rounded-full capitalize">{tag}</span>)}
              </div>
            )}

            {/* Allergens */}
            {item.allergens?.length > 0 && (
              <p className="text-amber-500/70 text-xs font-body mb-5">⚠️ Contains: {item.allergens.join(', ')}</p>
            )}

            {/* Variants */}
            {item.variants?.length > 0 && (
              <div className="mb-5">
                <p className="text-cream/50 text-xs font-body mb-2">Size / Variant</p>
                <div className="flex flex-wrap gap-2">
                  {item.variants.map(v => (
                    <button key={v.name} onClick={() => setVariant(v.name)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${variant === v.name ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-cream/50 hover:border-gold/30'}`}>
                      {v.name} · ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {item.addons?.length > 0 && (
              <div className="mb-5">
                <p className="text-cream/50 text-xs font-body mb-2">Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {item.addons.map(a => (
                    <button key={a.name} onClick={() => toggleAddon(a.name)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-body transition-all ${addons.includes(a.name) ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-cream/50 hover:border-gold/30'}`}>
                      +{a.name} · ₹{a.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions..." className="input-dark w-full min-h-[60px] resize-none text-sm mb-5" />

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border border-dark-border rounded-full px-4 py-2">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="text-cream/50 hover:text-gold transition-colors"><FiMinus /></button>
                <span className="font-display text-xl text-cream w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="text-cream/50 hover:text-gold transition-colors"><FiPlus /></button>
              </div>
              <div className="flex-1">
                <p className="text-cream/40 text-xs font-body">{qty} × ₹{displayPrice}</p>
                <p className="text-gold font-bold text-xl font-body">₹{(displayPrice * qty).toFixed(0)}</p>
              </div>
              <button onClick={handleAddToCart} disabled={!item.isAvailable} className="btn-gold py-3 px-6 disabled:opacity-50">
                <FiPlus /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-3xl text-cream mb-6">Reviews for this dish</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r._id} className="card-dark p-4">
                  <div className="flex gap-1 mb-2">{Array(5).fill(0).map((_, j) => <FiStar key={j} className={`text-xs ${j < r.rating ? 'text-gold fill-current' : 'text-dark-border'}`} />)}</div>
                  <p className="text-cream/70 text-sm font-body italic mb-2">"{r.comment}"</p>
                  <p className="text-cream/40 text-xs font-body">— {r.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
