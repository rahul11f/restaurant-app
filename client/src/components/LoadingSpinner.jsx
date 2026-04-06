import React from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiPlus, FiStar, FiClock } from 'react-icons/fi';
import { GiChiliPepper } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-dark-border rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-2 border-t-gold rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default LoadingSpinner;

export function MenuCard({ item, view = 'grid' }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const wishlisted = isWishlisted(item._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(item);
    toast.success(`${item.name} added to cart!`, { icon: '🛒' });
  };

  const spiceIcons = Array.from({ length: Math.min(item.spiceLevel || 0, 5) }, (_, i) => i);

  if (view === 'list') {
    return (
      <Link to={`/menu/${item._id}`} className="card-dark flex gap-4 p-4 hover:border-gold/30 transition-all duration-300 group">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
          <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {item.isSpecial && <span className="absolute top-1 left-1 bg-gold text-dark text-[9px] font-bold px-1.5 py-0.5 rounded">Special</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className={`w-3 h-3 border-2 rounded-sm flex items-center justify-center ${item.tags?.includes('veg') || item.tags?.includes('vegan') ? 'border-green-500' : 'border-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${item.tags?.includes('veg') || item.tags?.includes('vegan') ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <h3 className="font-body font-semibold text-cream text-sm">{item.name}</h3>
              </div>
              <p className="text-cream/50 text-xs leading-relaxed line-clamp-2">{item.description}</p>
            </div>
            <button onClick={(e) => { e.preventDefault(); toggleWishlist(item._id); }} className={`p-1.5 rounded-full flex-shrink-0 transition-colors ${wishlisted ? 'text-red-400' : 'text-cream/30 hover:text-red-400'}`}>
              <FiHeart className={wishlisted ? 'fill-current' : ''} />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <FiStar className="text-gold text-xs fill-current" />
                <span className="text-cream/60 text-xs">{item.rating?.toFixed(1) || '4.5'}</span>
              </div>
              <div className="flex items-center gap-1 text-cream/40">
                <FiClock className="text-xs" />
                <span className="text-xs">{item.preparationTime}m</span>
              </div>
              {spiceIcons.length > 0 && (
                <div className="flex items-center gap-0.5">
                  {spiceIcons.map(i => <GiChiliPepper key={i} className="text-red-500 text-xs" />)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div>
                {item.discountedPrice && <span className="text-cream/30 text-xs line-through mr-1">₹{item.price}</span>}
                <span className="text-gold font-bold">₹{item.discountedPrice || item.price}</span>
              </div>
              <button onClick={handleAddToCart} disabled={!item.isAvailable}
                className="btn-gold text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed">
                <FiPlus /> Add
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/menu/${item._id}`} className="card-dark hover:border-gold/30 transition-all duration-300 group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
          alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <div className={`w-5 h-5 border-2 rounded bg-dark/80 flex items-center justify-center ${item.tags?.includes('veg') || item.tags?.includes('vegan') ? 'border-green-500' : 'border-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${item.tags?.includes('veg') || item.tags?.includes('vegan') ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          {item.isSpecial && <span className="bg-gold text-dark text-[10px] font-bold px-2 py-0.5 rounded-full">Special</span>}
          {item.isFeatured && <span className="bg-dark/80 border border-gold/50 text-gold text-[10px] px-2 py-0.5 rounded-full">Featured</span>}
        </div>

        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); toggleWishlist(item._id); }}
          className={`absolute top-3 right-3 p-2 rounded-full bg-dark/60 backdrop-blur-sm transition-colors ${wishlisted ? 'text-red-400' : 'text-cream/50 hover:text-red-400'}`}>
          <FiHeart className={`text-sm ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
            <span className="bg-dark border border-dark-border text-cream/60 text-xs px-3 py-1.5 rounded-full">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-body font-semibold text-cream mb-1 leading-tight">{item.name}</h3>
        <p className="text-cream/50 text-xs leading-relaxed line-clamp-2 flex-1">{item.description}</p>

        <div className="flex items-center gap-3 my-3">
          <div className="flex items-center gap-1">
            <FiStar className="text-gold text-xs fill-current" />
            <span className="text-cream/60 text-xs">{item.rating?.toFixed(1) || '4.5'}</span>
            <span className="text-cream/30 text-xs">({item.reviewCount || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-cream/40">
            <FiClock className="text-xs" />
            <span className="text-xs">{item.preparationTime}m</span>
          </div>
          {item.calories && <span className="text-cream/30 text-xs">{item.calories} cal</span>}
          {spiceIcons.length > 0 && (
            <div className="flex items-center gap-0.5">
              {spiceIcons.map(i => <GiChiliPepper key={i} className="text-red-500 text-xs" />)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            {item.discountedPrice && <span className="text-cream/30 text-xs line-through mr-1">₹{item.price}</span>}
            <span className="text-gold font-bold text-lg">₹{item.discountedPrice || item.price}</span>
          </div>
          <button onClick={handleAddToCart} disabled={!item.isAvailable}
            className="btn-gold text-sm py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed">
            <FiPlus /> Add
          </button>
        </div>
      </div>
    </Link>
  );
}
