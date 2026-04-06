import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiPhone, FiMail } from 'react-icons/fi';
import api from '../api/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(console.error); }, [id]);
  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="text-green-500 text-3xl" />
        </div>
        <h1 className="font-display text-4xl text-cream mb-3">Order Placed!</h1>
        {order && <p className="font-display text-2xl text-gold mb-2">#{order.orderNumber}</p>}
        <p className="text-cream/60 font-body mb-2">Your order is confirmed. We'll notify you via WhatsApp at every step.</p>
        <p className="text-gold font-body text-sm mb-8">Estimated delivery: ~45 minutes</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={`/track/${id}`} className="btn-gold">Track Order <FiArrowRight /></Link>
          <Link to="/menu" className="btn-outline">Order More</Link>
        </div>
      </motion.div>
    </div>
  );
}
