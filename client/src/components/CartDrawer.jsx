import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useStore } from '../store/useStore';

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, updateQuantity, removeFromCart, getCartTotal } = useStore();
  const total = getCartTotal();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" />

          {/* Drawer */}
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] flex flex-col"
            style={{ background: '#0D0B06', borderLeft: '1px solid #2A2518' }}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-border">
              <div>
                <h2 className="font-display text-2xl text-cream">Your Order</h2>
                <p className="text-cream/50 text-xs font-body mt-0.5">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-2 text-cream/50 hover:text-gold transition-colors rounded-lg hover:bg-gold/5">
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FiShoppingBag className="text-5xl text-gold/30 mb-4" />
                  <p className="font-display text-2xl text-cream/50 mb-2">Your cart is empty</p>
                  <p className="text-cream/30 text-sm font-body mb-6">Add some delicious items from our menu</p>
                  <button onClick={() => setCartOpen(false)}>
                    <Link to="/menu" className="btn-gold text-sm">Browse Menu</Link>
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map(item => (
                    <motion.div key={item.key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }}
                      className="flex gap-3 p-3 bg-dark rounded-xl border border-dark-border">
                      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-medium text-cream text-sm truncate">{item.name}</p>
                        {item.variant && <p className="text-cream/40 text-xs">{item.variant}</p>}
                        {item.addons?.length > 0 && <p className="text-cream/40 text-xs truncate">+{item.addons.join(', ')}</p>}
                        <p className="text-gold font-semibold text-sm mt-1">₹{(item.price * item.quantity).toFixed(0)}</p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button onClick={() => removeFromCart(item.key)} className="text-red-400/60 hover:text-red-400 transition-colors p-1">
                          <FiTrash2 className="text-sm" />
                        </button>
                        <div className="flex items-center gap-2 bg-dark-border rounded-full px-2 py-1">
                          <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="text-cream/50 hover:text-gold transition-colors">
                            <FiMinus className="text-xs" />
                          </button>
                          <span className="text-cream text-sm font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="text-cream/50 hover:text-gold transition-colors">
                            <FiPlus className="text-xs" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-dark-border space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-cream/60 font-body">
                    <span>Subtotal</span><span>₹{total.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-cream/60 font-body">
                    <span>Delivery fee</span><span>₹49</span>
                  </div>
                  <div className="flex justify-between text-sm text-cream/60 font-body">
                    <span>GST (5%)</span><span>₹{Math.round(total * 0.05)}</span>
                  </div>
                  <div className="flex justify-between font-body font-semibold text-cream border-t border-dark-border pt-2">
                    <span>Total</span><span className="text-gold">₹{(total + 49 + Math.round(total * 0.05)).toFixed(0)}</span>
                  </div>
                </div>
                <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn-gold w-full justify-center text-base py-3.5">
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
