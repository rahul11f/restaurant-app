import React, { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../api/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 0, comment: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    api.get('/reviews?type=restaurant').then(r => { setReviews(r.data); setLoading(false); });
  }, []);

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    if (!form.rating) return toast.error('Select a rating');
    try {
      const res = await api.post('/reviews', { ...form, type: 'restaurant' });
      toast.success('Review submitted! It will appear after approval.');
      setForm({ rating: 0, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">✦ Testimonials ✦</p>
          <h1 className="section-title mb-2">Guest Reviews</h1>
          <div className="flex items-center justify-center gap-2 mt-4">
            <FiStar className="text-gold fill-current text-2xl" />
            <span className="font-display text-4xl text-gold">{avg}</span>
            <div className="text-left ml-2"><p className="text-cream/70 font-body text-sm">{reviews.length} reviews</p></div>
          </div>
        </div>

        {/* Write a review */}
        <div className="card-dark p-6 mb-10">
          <h3 className="font-display text-xl text-cream mb-4">Write a Review</h3>
          <form onSubmit={submitReview} className="space-y-4">
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setForm(p => ({ ...p, rating: s }))} className={`text-3xl transition-all ${s <= form.rating ? 'text-gold' : 'text-dark-border hover:text-gold/40'}`}>★</button>
              ))}
            </div>
            <textarea value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} placeholder="Share your experience..." className="input-dark w-full min-h-[100px] resize-none" required />
            <button type="submit" className="btn-gold text-sm py-2.5 px-6">Submit Review</button>
          </form>
        </div>

        {/* Reviews grid */}
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="card-dark h-36 shimmer-bg" />)}</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review, i) => (
              <motion.div key={review._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="card-dark p-5 hover:border-gold/20 transition-all">
                <div className="flex gap-1 mb-2">
                  {Array(5).fill(0).map((_, j) => <FiStar key={j} className={`text-sm ${j < review.rating ? 'text-gold fill-current' : 'text-dark-border'}`} />)}
                </div>
                <p className="text-cream/70 text-sm font-body italic mb-3">"{review.comment}"</p>
                {review.reply && <div className="bg-gold/5 border-l-2 border-gold p-3 rounded-r-lg mb-3 text-xs text-cream/60 font-body">Owner: {review.reply.text}</div>}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xs font-bold">{review.customerName?.[0] || 'G'}</div>
                  <div><p className="text-cream text-xs font-semibold font-body">{review.customerName || 'Guest'}</p><p className="text-cream/30 text-[10px] font-body">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Gallery() {
  const images = [
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=600',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600', 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=600',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600',
    'https://images.unsplash.com/photo-1570145820259-b5b80c5c8bd6?w=600', 'https://images.unsplash.com/photo-1571167366136-b57e97da57ef?w=600',
    'https://images.unsplash.com/photo-1554979944-0dc51b11b3f8?w=600', 'https://images.unsplash.com/photo-1523920290228-4f321a939b4c?w=600',
  ];
  const [active, setActive] = useState(null);
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12"><p className="section-subtitle mb-3">✦ Visual Journey ✦</p><h1 className="section-title">Our Gallery</h1></div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {images.map((src, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="break-inside-avoid cursor-pointer group overflow-hidden rounded-xl" onClick={() => setActive(src)}>
              <img src={src} alt={`Gallery ${i+1}`} className="w-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
      {active && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <img src={active} alt="Gallery" className="max-w-full max-h-full object-contain rounded-xl" />
        </div>
      )}
    </div>
  );
}

export function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState('');
  useEffect(() => { api.get('/offers').then(r => { setOffers(r.data); setLoading(false); }); }, []);
  const copy = (code) => { navigator.clipboard.writeText(code); setCopied(code); toast.success('Coupon copied!'); setTimeout(() => setCopied(''), 2000); };
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12"><p className="section-subtitle mb-3">✦ Save More ✦</p><h1 className="section-title">Special Offers</h1></div>
        {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{Array(4).fill(0).map((_, i) => <div key={i} className="card-dark h-40 shimmer-bg" />)}</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer, i) => (
              <motion.div key={offer._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`card-dark p-6 hover:border-gold/30 transition-all ${offer.isFeatured ? 'border-gold/20' : ''}`}>
                {offer.isFeatured && <span className="bg-gold text-dark text-[10px] font-bold px-2 py-0.5 rounded-full font-body mb-3 inline-block">FEATURED</span>}
                <h3 className="font-display text-2xl text-cream mb-1">{offer.title}</h3>
                <p className="text-cream/60 font-body text-sm mb-4">{offer.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gold font-bold text-2xl font-body">{offer.type === 'percentage' ? `${offer.value}% OFF` : offer.type === 'flat' ? `₹${offer.value} OFF` : 'FREE DELIVERY'}</p>
                    {offer.minOrderValue > 0 && <p className="text-cream/40 text-xs font-body">Min. order ₹{offer.minOrderValue}</p>}
                  </div>
                  <button onClick={() => copy(offer.code)} className={`px-4 py-2 rounded-lg border font-body font-bold text-sm tracking-widest transition-all ${copied === offer.code ? 'bg-green-500/20 border-green-500 text-green-400' : 'border-gold/50 text-gold hover:bg-gold/10'}`}>
                    {copied === offer.code ? '✓ COPIED' : offer.code}
                  </button>
                </div>
                <p className="text-cream/30 text-[10px] font-body mt-3">Valid till {new Date(offer.validTo).toLocaleDateString('en-IN')}</p>
              </motion.div>
            ))}
          </div>
        )}
        {offers.length === 0 && !loading && <p className="text-center text-cream/40 font-body py-16">No active offers right now. Check back soon!</p>}
      </div>
    </div>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); toast.success('Message sent! We\'ll reply within 24 hours.'); };
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12"><p className="section-subtitle mb-3">✦ Get In Touch ✦</p><h1 className="section-title">Contact Us</h1></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="card-dark p-6 mb-6">
              <h3 className="font-display text-xl text-cream mb-4">Visit Us</h3>
              <div className="space-y-3 text-sm font-body text-cream/60">
                <p>📍 12, Sakchi Main Road, Jamshedpur, Jharkhand 831001</p>
                <p>📞 +91 98765 43210</p>
                <p>📧 hello@spiceandsoul.com</p>
                <p>🕐 Mon–Thu: 12:00–23:00 | Fri–Sat: 12:00–23:30 | Sun: 11:00–23:00</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-dark-border h-64">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.8!2d86.1948!3d22.8046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDQ4JzE2LjYiTiA4NsKwMTEnNDEuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Restaurant Location" />
            </div>
          </div>
          <div className="card-dark p-6">
            <h3 className="font-display text-xl text-cream mb-4">Send a Message</h3>
            {sent ? (
              <div className="text-center py-10"><p className="font-display text-2xl text-gold mb-2">Message Sent!</p><p className="text-cream/50 font-body text-sm">We'll get back to you within 24 hours.</p></div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your Name" className="input-dark" required />
                <input value={form.email} onChange={e => f('email', e.target.value)} type="email" placeholder="Email Address" className="input-dark" required />
                <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="Phone Number" className="input-dark" />
                <textarea value={form.message} onChange={e => f('message', e.target.value)} placeholder="Your message..." className="input-dark min-h-[120px] resize-none w-full" required />
                <button type="submit" className="btn-gold w-full justify-center py-3">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="relative h-80 flex items-center justify-center overflow-hidden mb-16">
        <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=70" alt="Restaurant" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark/50 to-dark" />
        <div className="relative text-center"><p className="section-subtitle mb-3">✦ Our Heritage ✦</p><h1 className="section-title">Our Story</h1></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="space-y-12">
          {[
            { year: '1998', title: 'The Beginning', text: 'Spice & Soul was born in a modest kitchen in Jamshedpur, where Chef Ramesh Sharma began cooking the recipes his mother had taught him — rich curries, hand-pulled naans, and biryanis slow-cooked over wood fires.' },
            { year: '2005', title: 'Growing Roots', text: 'Demand grew beyond our small kitchen. We opened our first standalone restaurant, earning recognition from local food critics and becoming the go-to destination for special occasions in Jamshedpur.' },
            { year: '2015', title: 'National Recognition', text: 'Spice & Soul was featured in Times Food Guide and won its first national award for Best Traditional Indian Restaurant. Our Hyderabadi Dum Biryani became legendary across the city.' },
            { year: '2024', title: 'Modern & Timeless', text: 'Today, under the leadership of Chef Arjun Sharma, we have embraced modern techniques while preserving the soul of our traditional recipes. Online ordering, live tracking, and new dining experiences — all while keeping the flavours exactly as they were in 1998.' },
          ].map((item, i) => (
            <motion.div key={item.year} initial={{ opacity: 0, x: i % 2 ? 30 : -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className={`flex gap-8 items-start ${i % 2 ? 'flex-row-reverse text-right' : ''}`}>
              <div className="flex-shrink-0 text-center"><p className="font-display text-5xl text-gold font-bold">{item.year}</p><div className="w-px h-full bg-gold/20 mx-auto mt-2" /></div>
              <div className="card-dark p-6 flex-1">
                <h3 className="font-display text-2xl text-cream mb-2">{item.title}</h3>
                <p className="text-cream/60 font-body text-sm leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Re-export for router
import React_def from 'react';
export default Reviews;
