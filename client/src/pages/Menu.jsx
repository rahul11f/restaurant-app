import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList, FiX } from 'react-icons/fi';
import api from '../api/api';
import { MenuCard } from '../components/LoadingSpinner';

const TAGS = ['All', 'veg', 'non-veg', 'vegan', 'spicy', 'chef-special', 'bestseller', 'healthy'];
const SORTS = [
  { value: '', label: 'Default' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [view, setView] = useState('grid');
  const [vegOnly, setVegOnly] = useState(false);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set('category', activeCategory);
      if (activeTag !== 'All') params.set('tags', activeTag);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      params.set('available', 'true');
      const res = await api.get(`/menu?${params}`);
      let data = res.data.items || [];
      if (vegOnly) data = data.filter(i => i.tags?.includes('veg') || i.tags?.includes('vegan'));
      setItems(data);
      setCategories(res.data.categories || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [activeCategory, activeTag, search, sort, vegOnly]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // Group by category for display
  const grouped = activeCategory
    ? { [activeCategory]: items }
    : categories.reduce((acc, cat) => {
        const catItems = items.filter(i => i.category === cat);
        if (catItems.length) acc[cat] = catItems;
        return acc;
      }, {});

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <div className="relative bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
          <p className="section-subtitle mb-3">✦ Explore ✦</p>
          <h1 className="section-title mb-3">Our Menu</h1>
          <p className="text-cream/50 font-body max-w-xl mx-auto text-sm">Over 60 dishes crafted fresh daily. From classic tandoor to regional specials — there's something for every palate.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Controls */}
        <div className="sticky top-20 z-30 bg-dark/90 backdrop-blur-xl py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-dark-border/50 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search + Sort + View */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes..."
                  className="input-dark pl-9 py-2.5 text-sm" />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/30 hover:text-gold"><FiX /></button>}
              </div>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="input-dark py-2.5 text-sm w-44 cursor-pointer">
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => setVegOnly(!vegOnly)} className={`w-10 h-5 rounded-full transition-colors relative ${vegOnly ? 'bg-green-600' : 'bg-dark-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${vegOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-cream/60 text-xs font-body hidden sm:block">Veg Only</span>
              </label>
              <div className="flex border border-dark-border rounded-lg overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2.5 transition-colors ${view === 'grid' ? 'bg-gold text-dark' : 'text-cream/50 hover:text-gold'}`}><FiGrid /></button>
                <button onClick={() => setView('list')} className={`p-2.5 transition-colors ${view === 'list' ? 'bg-gold text-dark' : 'text-cream/50 hover:text-gold'}`}><FiList /></button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={() => setActiveCategory('')}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body transition-all ${activeCategory === '' ? 'bg-gold text-dark font-semibold' : 'border border-dark-border text-cream/60 hover:border-gold/50 hover:text-gold'}`}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-body transition-all ${activeCategory === cat ? 'bg-gold text-dark font-semibold' : 'border border-dark-border text-cream/60 hover:border-gold/50 hover:text-gold'}`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Tag filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {TAGS.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-body border transition-all ${activeTag === tag ? 'bg-gold/20 border-gold text-gold' : 'border-dark-border text-cream/40 hover:border-gold/30'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-cream/40 text-sm font-body mb-6">{items.length} dishes found</p>

        {/* Menu sections */}
        {loading ? (
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array(9).fill(0).map((_, i) => <div key={i} className={`card-dark shimmer-bg ${view === 'grid' ? 'h-80' : 'h-28'}`} />)}
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-cream/30 mb-3">No dishes found</p>
            <p className="text-cream/30 font-body text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, catItems]) => (
            <div key={category} className="mb-16">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-display text-3xl text-cream">{category}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-gold/30 to-transparent" />
                <span className="text-cream/30 text-sm font-body">{catItems.length} items</span>
              </div>
              <AnimatePresence mode="popLayout">
                <motion.div layout className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {catItems.map(item => (
                    <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <MenuCard item={item} view={view} />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
