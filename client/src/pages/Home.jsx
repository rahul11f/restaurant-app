import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiArrowRight, FiClock, FiTruck, FiAward, FiPhone } from 'react-icons/fi';
import { GiIndianPalace, GiChefToque, GiSpoon } from 'react-icons/gi';
import api from '../api/api';
import { MenuCard } from '../components/LoadingSpinner';
import { useStore } from '../store/useStore';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }) };

const stats = [
  { icon: GiChefToque, value: '25+', label: 'Expert Chefs' },
  { icon: FiAward, value: '12+', label: 'Awards Won' },
  { icon: FiStar, value: '4.9', label: 'Average Rating' },
  { icon: GiSpoon, value: '200+', label: 'Menu Items' },
];

const features = [
  { icon: FiTruck, title: 'Fast Delivery', desc: 'Hot food at your door in 45 minutes or less, every time.' },
  { icon: FiClock, title: 'Open Late', desc: 'Serving till 11:30 PM on weekends. Craving? We\'re here.' },
  { icon: FiAward, title: 'Award Winning', desc: 'Recognized as Jamshedpur\'s Best Indian Restaurant 2024.' },
  { icon: GiChefToque, title: 'Master Chefs', desc: 'Trained at India\'s finest culinary institutes.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/menu?featured=true&available=true'),
      api.get('/offers'),
      api.get('/reviews?type=restaurant&approved=true')
    ]).then(([menuRes, offersRes, reviewsRes]) => {
      setFeatured(menuRes.data.items?.slice(0, 6) || []);
      setOffers(offersRes.data?.slice(0, 3) || []);
      setReviews(reviewsRes.data?.slice(0, 6) || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&q=80"
            alt="Restaurant" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/70 to-dark" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-transparent to-dark/60" />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 border border-gold/5 rounded-full animate-spin-slow" />
        <div className="absolute top-1/3 right-1/3 w-40 h-40 border border-gold/10 rounded-full" style={{ animation: 'spin 15s linear infinite reverse' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center py-32">
          <motion.div initial="hidden" animate="visible">
            <motion.p variants={fadeUp} custom={0} className="section-subtitle mb-6">
              ✦ Fine Indian Cuisine Since 1998 ✦
            </motion.p>
            <motion.h1 variants={fadeUp} custom={1}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-cream leading-[0.95] mb-6">
              Where Spice<br />
              <span className="italic text-gradient">Meets Soul</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2}
              className="font-body text-cream/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Authentic flavours from the heart of India, crafted by master chefs using recipes passed down through generations. Every dish tells a story.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/menu" className="btn-gold text-base py-4 px-8">
                Order Now <FiArrowRight />
              </Link>
              <Link to="/reserve" className="btn-outline text-base py-4 px-8">
                Reserve a Table
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="text-gold text-2xl mx-auto mb-2" />
                <p className="font-display text-3xl font-semibold text-cream">{value}</p>
                <p className="text-cream/50 text-xs font-body mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-cream/30 text-xs font-body tracking-widest">SCROLL</span>
          <div className="w-px h-12 bg-gradient-to-b from-gold/50 to-transparent" />
        </div>
      </section>

      {/* ─── OFFER BANNER ──────────────────────────────────────────────────────── */}
      {offers.length > 0 && (
        <section className="bg-gold/10 border-y border-gold/20 py-4 overflow-hidden">
          <div className="flex gap-12 animate-[slide_20s_linear_infinite]" style={{ width: 'max-content', animation: 'marquee 20s linear infinite' }}>
            {[...offers, ...offers].map((offer, i) => (
              <div key={i} className="flex items-center gap-3 whitespace-nowrap px-6">
                <span className="text-gold text-lg">✦</span>
                <span className="font-display text-cream text-lg italic">{offer.title}</span>
                <span className="bg-gold text-dark text-xs font-bold px-2 py-0.5 rounded-full font-body">{offer.code}</span>
              </div>
            ))}
          </div>
          <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
        </section>
      )}

      {/* ─── FEATURED DISHES ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <p className="section-subtitle mb-3">✦ Chef's Selection ✦</p>
          <h2 className="section-title mb-4">Featured Dishes</h2>
          <p className="text-cream/50 font-body max-w-xl mx-auto">Our most celebrated recipes, prepared fresh daily with the finest ingredients sourced from across India.</p>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <div key={i} className="card-dark h-80 shimmer-bg" />)}
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {featured.map((item, i) => (
              <motion.div key={item._id} variants={fadeUp} custom={i * 0.05}>
                <MenuCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
        <div className="text-center mt-12">
          <Link to="/menu" className="btn-outline">View Full Menu <FiArrowRight /></Link>
        </div>
      </section>

      {/* ─── WHY US ──────────────────────────────────────────────────────────── */}
      <section className="bg-dark-card border-y border-dark-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="section-subtitle mb-3">✦ Our Promise ✦</p>
            <h2 className="section-title">Why Spice & Soul</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center group">
                <div className="w-16 h-16 rounded-2xl border border-gold/20 flex items-center justify-center mx-auto mb-5 group-hover:border-gold/60 group-hover:bg-gold/5 transition-all duration-300">
                  <Icon className="text-gold text-2xl" />
                </div>
                <h3 className="font-display text-xl text-cream mb-2">{title}</h3>
                <p className="text-cream/50 text-sm font-body leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT SECTION ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="section-subtitle mb-4">✦ Our Story ✦</p>
            <h2 className="section-title mb-6">A Legacy of<br /><span className="italic text-gradient">Flavour & Tradition</span></h2>
            <p className="text-cream/60 font-body leading-relaxed mb-4">Since 1998, Spice & Soul has been Jamshedpur's most beloved Indian restaurant, serving authentic recipes passed down through three generations of our family.</p>
            <p className="text-cream/60 font-body leading-relaxed mb-8">Our chefs travel across India each year to source the finest spices — from the saffron fields of Kashmir to the cardamom forests of Kerala — ensuring every dish is a true reflection of India's rich culinary heritage.</p>
            <div className="flex items-center gap-6">
              <Link to="/about" className="btn-outline">Our Story <FiArrowRight /></Link>
              <a href="tel:+919876543210" className="flex items-center gap-2 text-cream/60 hover:text-gold transition-colors font-body text-sm">
                <FiPhone className="text-gold" /> +91 98765 43210
              </a>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&q=80" alt="Chef" className="rounded-2xl aspect-square object-cover" />
              <img src="https://images.unsplash.com/photo-1567337710282-00832b415979?w=400&q=80" alt="Food" className="rounded-2xl aspect-square object-cover mt-8" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl border border-gold/20">
              <p className="font-display text-3xl text-gold font-semibold">26+</p>
              <p className="text-cream/60 text-xs font-body">Years of Excellence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── REVIEWS ─────────────────────────────────────────────────────────── */}
      {reviews.length > 0 && (
        <section className="bg-dark-card border-y border-dark-border py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <p className="section-subtitle mb-3">✦ Guest Experiences ✦</p>
              <h2 className="section-title">What Our Guests Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.slice(0, 6).map((review, i) => (
                <motion.div key={review._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="card-dark p-6 hover:border-gold/20 transition-all duration-300">
                  <div className="flex items-center gap-1 mb-3">
                    {Array(5).fill(0).map((_, j) => (
                      <FiStar key={j} className={`text-sm ${j < review.rating ? 'text-gold fill-current' : 'text-dark-border'}`} />
                    ))}
                  </div>
                  <p className="text-cream/70 font-body text-sm leading-relaxed mb-4 italic">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-display font-semibold">
                      {review.customerName?.[0] || 'G'}
                    </div>
                    <div>
                      <p className="text-cream text-sm font-medium font-body">{review.customerName || 'Guest'}</p>
                      <p className="text-cream/40 text-xs font-body">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/reviews" className="btn-outline">All Reviews <FiArrowRight /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA RESERVATION ─────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80" alt="Restaurant" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/80 to-dark" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <GiIndianPalace className="text-gold text-5xl mx-auto mb-6" />
          <h2 className="section-title mb-4">Reserve Your Table</h2>
          <p className="text-cream/60 font-body mb-8 text-lg">Celebrate your special moments with us. We create unforgettable dining experiences for every occasion.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/reserve" className="btn-gold text-base py-4 px-8">Book a Table <FiArrowRight /></Link>
            <a href="tel:+919876543210" className="btn-outline text-base py-4 px-8"><FiPhone /> Call Us</a>
          </div>
        </div>
      </section>
    </div>
  );
}
