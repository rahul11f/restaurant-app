import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiClock, FiTruck, FiStar, FiPhone } from 'react-icons/fi';
import { GiChefToque } from 'react-icons/gi';
import { io } from 'socket.io-client';
import api from '../api/api';

const STEPS = [
  { key: 'pending',           label: 'Order Placed',      icon: FiCheck,      desc: 'We received your order' },
  { key: 'confirmed',         label: 'Confirmed',         icon: FiCheck,      desc: 'Order confirmed by restaurant' },
  { key: 'preparing',         label: 'Preparing',         icon: GiChefToque,  desc: 'Our chefs are cooking your meal' },
  { key: 'ready',             label: 'Ready',             icon: FiCheck,      desc: 'Your order is ready' },
  { key: 'out-for-delivery',  label: 'On the Way',        icon: FiTruck,      desc: 'Your order is out for delivery' },
  { key: 'delivered',         label: 'Delivered',         icon: FiStar,       desc: 'Enjoy your meal!' },
];

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => { setOrder(r.data); setLoading(false); }).catch(() => setLoading(false));

    socketRef.current = io(import.meta.env.VITE_API_URL || '');
    socketRef.current.emit('join_order', id);
    socketRef.current.on('order_status_changed', ({ orderId, status, order: updated }) => {
      if (orderId === id || orderId === id) setOrder(updated);
    });
    return () => socketRef.current?.disconnect();
  }, [id]);

  const currentStep = STEPS.findIndex(s => s.key === order?.status);
  const elapsed = order ? Math.floor((Date.now() - new Date(order.createdAt)) / 60000) : 0;

  const submitRating = async () => {
    try {
      await api.post('/reviews', { order: id, rating, comment: feedback || 'Great experience!', type: 'restaurant', customerName: order.customerInfo?.name });
      setRatingSubmitted(true);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-12 h-12 border-2 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="text-center">
        <p className="font-display text-2xl text-cream/50">Order not found</p>
        <Link to="/" className="btn-gold mt-4 inline-flex">Go Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="section-subtitle mb-2">✦ Live Tracking ✦</p>
          <h1 className="font-display text-4xl text-cream mb-1">Order #{order.orderNumber}</h1>
          <p className="text-cream/50 font-body text-sm">{elapsed} minutes ago · ₹{order.total}</p>
        </div>

        {/* Status card */}
        <div className="card-dark p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gold font-body font-semibold text-lg capitalize">{order.status?.replace(/-/g, ' ')}</p>
              <p className="text-cream/50 text-sm font-body">{STEPS.find(s => s.key === order.status)?.desc}</p>
            </div>
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="text-right">
                <p className="text-cream/40 text-xs font-body">Est. time</p>
                <p className="text-cream font-body font-semibold flex items-center gap-1"><FiClock className="text-gold" />~{Math.max(5, 45 - elapsed)}m</p>
              </div>
            )}
          </div>

          {/* Progress steps */}
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-5 left-5 right-5 h-0.5 bg-dark-border" />
            <div className="absolute top-5 left-5 h-0.5 bg-gold transition-all duration-700"
              style={{ width: currentStep < 0 ? '0%' : `${(currentStep / (STEPS.length - 1)) * 100}%` }} />

            <div className="relative flex justify-between">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2" style={{ flex: 1 }}>
                    <motion.div
                      animate={{ scale: active ? [1, 1.15, 1] : 1 }}
                      transition={{ repeat: active ? Infinity : 0, duration: 2 }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500 ${done ? 'bg-gold border-gold' : 'bg-dark border-dark-border'}`}>
                      <Icon className={`text-sm ${done ? 'text-dark' : 'text-cream/20'}`} />
                    </motion.div>
                    <span className={`text-[10px] font-body text-center leading-tight hidden sm:block ${done ? 'text-gold' : 'text-cream/30'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order items */}
        <div className="card-dark p-5 mb-6">
          <h3 className="font-display text-xl text-cream mb-4">Your Order</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="text-cream text-sm font-body">{item.name}</p>
                  {item.variant && <p className="text-cream/40 text-xs">{item.variant}</p>}
                </div>
                <p className="text-cream/60 text-sm">×{item.quantity}</p>
                <p className="text-gold text-sm font-semibold">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-border mt-4 pt-4 space-y-1 text-sm font-body">
            <div className="flex justify-between text-cream/50"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
            {order.couponDiscount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{order.couponDiscount}</span></div>}
            <div className="flex justify-between text-cream/50"><span>Delivery</span><span>₹{order.deliveryFee || 0}</span></div>
            <div className="flex justify-between text-cream/50"><span>GST</span><span>₹{order.taxes}</span></div>
            <div className="flex justify-between text-cream font-bold pt-2 border-t border-dark-border"><span>Total</span><span className="text-gold">₹{order.total}</span></div>
          </div>
        </div>

        {/* Delivery info */}
        {order.type === 'delivery' && order.deliveryAddress && (
          <div className="card-dark p-5 mb-6">
            <h3 className="font-display text-xl text-cream mb-2">Delivery Address</h3>
            <p className="text-cream/60 font-body text-sm">{order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} — {order.deliveryAddress.pincode}</p>
          </div>
        )}

        {/* Rating (after delivery) */}
        {order.status === 'delivered' && !ratingSubmitted && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-dark p-6 mb-6 border border-gold/20">
            <h3 className="font-display text-2xl text-cream mb-2">How was your experience?</h3>
            <p className="text-cream/50 text-sm font-body mb-4">Your feedback helps us serve you better.</p>
            <div className="flex gap-2 mb-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className={`text-3xl transition-all ${s <= rating ? 'text-gold scale-110' : 'text-dark-border hover:text-gold/50'}`}>★</button>
              ))}
            </div>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Tell us more... (optional)" className="input-dark min-h-[80px] resize-none mb-4 w-full" />
            <button onClick={submitRating} disabled={!rating} className="btn-gold disabled:opacity-50">Submit Review</button>
          </motion.div>
        )}
        {ratingSubmitted && (
          <div className="card-dark p-6 mb-6 text-center border border-green-500/20">
            <FiCheck className="text-green-500 text-3xl mx-auto mb-2" />
            <p className="font-display text-xl text-cream">Thank you for your review!</p>
          </div>
        )}

        {/* Help */}
        <div className="flex gap-3">
          <a href="tel:+919876543210" className="flex-1 btn-outline justify-center text-sm py-3"><FiPhone /> Call Restaurant</a>
          <Link to="/menu" className="flex-1 btn-gold justify-center text-sm py-3">Order Again</Link>
        </div>
      </div>
    </div>
  );
}
