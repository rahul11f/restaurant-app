const router = require('express').Router();
const { Order, User, Offer, MenuItem } = require('../models');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { sendOrderConfirmation, sendOrderStatusUpdate, sendOrderEmail } = require('../utils/notifications');

// Place order (public with optional auth)
router.post('/', optionalAuth, async (req, res) => {
  try {
    const io = req.app.get('io');
    const { items, type, deliveryAddress, tableNumber, customerInfo, couponCode, payment } = req.body;

    // Calculate totals
    let subtotal = 0;
    const enrichedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) continue;
      const price = menuItem.discountedPrice || menuItem.price;
      subtotal += price * item.quantity;
      enrichedItems.push({ ...item, name: menuItem.name, image: menuItem.images?.[0], price });
      // Update order count
      await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { orderCount: item.quantity } });
    }

    // Apply coupon
    let couponDiscount = 0;
    let offer = null;
    if (couponCode) {
      offer = await Offer.findOne({ code: couponCode.toUpperCase(), isActive: true, validFrom: { $lte: new Date() }, validTo: { $gte: new Date() } });
      if (offer && subtotal >= offer.minOrderValue) {
        if (offer.type === 'percentage') couponDiscount = Math.min(subtotal * offer.value / 100, offer.maxDiscount || Infinity);
        else if (offer.type === 'flat') couponDiscount = offer.value;
        else if (offer.type === 'free-delivery') couponDiscount = 0; // handled in delivery fee
        await Offer.findByIdAndUpdate(offer._id, { $inc: { usedCount: 1 }, $push: { usedBy: req.user?._id } });
      }
    }

    const deliveryFee = type === 'delivery' ? (offer?.type === 'free-delivery' ? 0 : 49) : 0;
    const taxes = Math.round((subtotal - couponDiscount) * 0.05);
    const total = subtotal - couponDiscount + deliveryFee + taxes;

    const order = await Order.create({
      customer: req.user?._id,
      customerInfo: customerInfo || { name: req.user?.name, email: req.user?.email, phone: req.user?.phone },
      items: enrichedItems,
      type,
      deliveryAddress,
      tableNumber,
      subtotal,
      couponCode,
      couponDiscount,
      deliveryFee,
      taxes,
      total,
      payment,
      estimatedDelivery: new Date(Date.now() + 45 * 60000),
      statusHistory: [{ status: 'pending', timestamp: new Date() }]
    });

    // Update user stats
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalOrders: 1, totalSpent: total, loyaltyPoints: Math.floor(total / 10) }
      });
    }

    // Real-time notification to admin
    io.to('admin').emit('new_order', { order, sound: true });
    io.to('kitchen').emit('new_order', { order });

    // WhatsApp & Email notifications
    const phone = customerInfo?.phone || req.user?.phone;
    const email = customerInfo?.email || req.user?.email;
    if (phone) sendOrderConfirmation(phone, order).catch(console.error);
    if (email) sendOrderEmail(email, order).catch(console.error);

    const populated = await Order.findById(order._id).populate('items.menuItem', 'name images');
    res.status(201).json(populated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Get all orders (admin)
router.get('/admin', protect, restrictTo('admin', 'manager', 'chef', 'waiter'), async (req, res) => {
  try {
    const { status, type, date, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (date) {
      const d = new Date(date);
      filter.createdAt = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('customer', 'name email phone')
      .populate('assignedTo', 'name');
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get my orders (customer)
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single order (public by ID — for tracking)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('assignedTo', 'name phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update order status (admin)
router.patch('/:id/status', protect, restrictTo('admin', 'manager', 'chef', 'waiter', 'delivery'), async (req, res) => {
  try {
    const io = req.app.get('io');
    const { status, assignedTo } = req.body;
    const order = await Order.findById(req.params.id).populate('customer', 'phone email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.statusHistory.push({ status, timestamp: new Date(), updatedBy: req.user._id });
    if (assignedTo) order.assignedTo = assignedTo;
    if (status === 'delivered') order.deliveredAt = new Date();
    await order.save();

    // Real-time update
    io.to(`order_${order._id}`).emit('order_status_changed', { orderId: order._id, status, order });
    io.to('admin').emit('order_status_changed', { orderId: order._id, status, order });

    // WhatsApp update
    const phone = order.customer?.phone || order.customerInfo?.phone;
    if (phone && ['preparing', 'ready', 'out-for-delivery', 'delivered'].includes(status)) {
      sendOrderStatusUpdate(phone, order).catch(console.error);
    }

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update payment status
router.patch('/:id/payment', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id,
      { 'payment.status': req.body.status, 'payment.transactionId': req.body.transactionId, 'payment.paidAt': new Date() },
      { new: true });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Cancel order
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!['admin', 'manager'].includes(req.user.role) && order.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel order at this stage' });
    }
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), updatedBy: req.user._id });
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Validate coupon
router.post('/validate-coupon', async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true, validFrom: { $lte: new Date() }, validTo: { $gte: new Date() } });
    if (!offer) return res.status(404).json({ message: 'Invalid or expired coupon' });
    if (subtotal < offer.minOrderValue) return res.status(400).json({ message: `Minimum order ₹${offer.minOrderValue} required` });
    let discount = 0;
    if (offer.type === 'percentage') discount = Math.min(subtotal * offer.value / 100, offer.maxDiscount || Infinity);
    else if (offer.type === 'flat') discount = offer.value;
    res.json({ offer, discount: Math.round(discount) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
