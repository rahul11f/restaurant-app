import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCreditCard, FiTag, FiCheck, FiTruck, FiUsers, FiCoffee } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../api/api';
import { useStore } from '../store/useStore';

export default function Checkout() {
  const { cart, getCartTotal, user, orderType, setOrderType, clearCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    street: '', city: '', state: '', pincode: '',
    tableNumber: '', paymentMethod: 'online', notes: ''
  });

  const subtotal = getCartTotal();
  const couponDiscount = couponData?.discount || 0;
  const deliveryFee = orderType === 'delivery' ? 49 : 0;
  const taxes = Math.round((subtotal - couponDiscount) * 0.05);
  const total = subtotal - couponDiscount + deliveryFee + taxes;

  const applyCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await api.post('/orders/validate-coupon', { code: coupon, subtotal });
      setCouponData(res.data);
      toast.success('Coupon applied!');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
    finally { setCouponLoading(false); }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return toast.error('Cart is empty');
    setLoading(true);
    try {
      const orderData = {
        items: cart.map(i => ({ menuItem: i.menuItem, name: i.name, price: i.price, quantity: i.quantity, variant: i.variant, addons: i.addons, notes: i.notes })),
        type: orderType,
        customerInfo: { name: form.name, email: form.email, phone: form.phone },
        deliveryAddress: orderType === 'delivery' ? { street: form.street, city: form.city, state: form.state, pincode: form.pincode } : undefined,
        tableNumber: form.tableNumber,
        couponCode: couponData ? coupon : undefined,
        payment: { method: form.paymentMethod, status: form.paymentMethod === 'cash' ? 'pending' : 'paid' },
        notes: form.notes
      };

      if (form.paymentMethod === 'online') {
        // Razorpay integration
        const { data: razorpayOrder } = await api.post('/payments/create', { amount: total });
        const options = {
          key: razorpayOrder.key || 'rzp_test_demo',
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'Spice & Soul',
          description: 'Food Order',
          order_id: razorpayOrder.id,
          handler: async (response) => {
            const order = await api.post('/orders', { ...orderData, payment: { method: 'online', status: 'paid', transactionId: response.razorpay_payment_id } });
            clearCart();
            navigate(`/order-success/${order.data._id}`);
          },
          prefill: { name: form.name, email: form.email, contact: form.phone },
          theme: { color: '#D4AF37' }
        };
        if (window.Razorpay) {
          new window.Razorpay(options).open();
        } else {
          // Fallback for demo without Razorpay
          const order = await api.post('/orders', orderData);
          clearCart();
          navigate(`/order-success/${order.data._id}`);
        }
      } else {
        const order = await api.post('/orders', orderData);
        clearCart();
        navigate(`/order-success/${order.data._id}`);
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
    finally { setLoading(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (!cart.length) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="text-center">
        <p className="font-display text-3xl text-cream/50 mb-4">Your cart is empty</p>
        <Link to="/menu" className="btn-gold">Browse Menu</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl text-cream mb-8">Checkout</h1>
        <form onSubmit={handleOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order type */}
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-cream mb-4">Order Type</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'delivery', icon: FiTruck, label: 'Delivery' },
                    { value: 'pickup', icon: FiMapPin, label: 'Pickup' },
                    { value: 'dine-in', icon: FiCoffee, label: 'Dine In' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button key={value} type="button" onClick={() => setOrderType(value)}
                      className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${orderType === value ? 'border-gold bg-gold/10 text-gold' : 'border-dark-border text-cream/50 hover:border-gold/30'}`}>
                      <Icon className="text-xl" />
                      <span className="text-sm font-body font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="card-dark p-6 space-y-4">
                <h2 className="font-display text-xl text-cream">Contact Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input value={form.name} onChange={e => f('name', e.target.value)} placeholder="Full Name" className="input-dark" required />
                  <input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="Phone Number" className="input-dark" required />
                  <input value={form.email} onChange={e => f('email', e.target.value)} type="email" placeholder="Email Address" className="input-dark sm:col-span-2" />
                </div>
              </div>

              {/* Delivery address */}
              {orderType === 'delivery' && (
                <div className="card-dark p-6 space-y-4">
                  <h2 className="font-display text-xl text-cream flex items-center gap-2"><FiMapPin className="text-gold" /> Delivery Address</h2>
                  <input value={form.street} onChange={e => f('street', e.target.value)} placeholder="Street Address" className="input-dark" required />
                  <div className="grid grid-cols-3 gap-4">
                    <input value={form.city} onChange={e => f('city', e.target.value)} placeholder="City" className="input-dark" required />
                    <input value={form.state} onChange={e => f('state', e.target.value)} placeholder="State" className="input-dark" required />
                    <input value={form.pincode} onChange={e => f('pincode', e.target.value)} placeholder="Pincode" className="input-dark" required />
                  </div>
                </div>
              )}

              {/* Table number for dine-in */}
              {orderType === 'dine-in' && (
                <div className="card-dark p-6">
                  <h2 className="font-display text-xl text-cream mb-4 flex items-center gap-2"><FiUsers className="text-gold" /> Table Details</h2>
                  <input value={form.tableNumber} onChange={e => f('tableNumber', e.target.value)} placeholder="Table Number (ask your waiter)" className="input-dark" />
                </div>
              )}

              {/* Payment */}
              <div className="card-dark p-6">
                <h2 className="font-display text-xl text-cream mb-4 flex items-center gap-2"><FiCreditCard className="text-gold" /> Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { value: 'online', label: 'Online Payment (UPI / Card / Net Banking)', desc: 'Secure payment via Razorpay' },
                    { value: 'cash', label: 'Cash on Delivery / At Counter', desc: 'Pay when you receive your order' },
                  ].map(({ value, label, desc }) => (
                    <label key={value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === value ? 'border-gold bg-gold/5' : 'border-dark-border hover:border-gold/30'}`}>
                      <input type="radio" name="payment" value={value} checked={form.paymentMethod === value} onChange={e => f('paymentMethod', e.target.value)} className="accent-gold" />
                      <div>
                        <p className="text-cream text-sm font-body font-medium">{label}</p>
                        <p className="text-cream/40 text-xs">{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <textarea value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="Special instructions or dietary requirements..." className="input-dark min-h-[80px] resize-none w-full" />
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="card-dark p-6 sticky top-24">
                <h2 className="font-display text-xl text-cream mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cart.map(item => (
                    <div key={item.key} className="flex justify-between text-sm font-body">
                      <span className="text-cream/70 flex-1">{item.name} × {item.quantity}</span>
                      <span className="text-cream ml-2">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="border-t border-dark-border pt-4 mb-4">
                  <div className="flex gap-2">
                    <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon Code" className="input-dark text-sm flex-1" />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading || !coupon}
                      className="btn-outline text-sm py-2 px-4 disabled:opacity-50">
                      <FiTag /> Apply
                    </button>
                  </div>
                  {couponData && (
                    <div className="flex items-center gap-2 mt-2 text-green-400 text-xs font-body">
                      <FiCheck /> Saved ₹{couponData.discount}!
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm font-body">
                  <div className="flex justify-between text-cream/60"><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-₹{couponDiscount}</span></div>}
                  {orderType === 'delivery' && <div className="flex justify-between text-cream/60"><span>Delivery</span><span>₹{deliveryFee}</span></div>}
                  <div className="flex justify-between text-cream/60"><span>GST (5%)</span><span>₹{taxes}</span></div>
                  <div className="flex justify-between text-cream font-bold text-base border-t border-dark-border pt-2">
                    <span>Total</span><span className="text-gold">₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full justify-center mt-6 py-4 text-base disabled:opacity-70">
                  {loading ? 'Placing Order...' : `Pay ₹${total.toFixed(0)}`}
                </button>
                <p className="text-cream/30 text-xs text-center mt-3 font-body">🔒 Secured by Razorpay</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
