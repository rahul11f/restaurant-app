const router = require('express').Router();
const { Order, User, MenuItem, Reservation } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/dashboard', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const weekAgo = new Date(today - 7*86400000);
    const monthAgo = new Date(today - 30*86400000);

    const [todayOrders, weekOrders, monthOrders, totalCustomers, pendingReservations, topItems] = await Promise.all([
      Order.find({ createdAt: { $gte: today }, status: { $ne: 'cancelled' } }),
      Order.find({ createdAt: { $gte: weekAgo }, status: { $ne: 'cancelled' } }),
      Order.find({ createdAt: { $gte: monthAgo }, status: { $ne: 'cancelled' } }),
      User.countDocuments({ role: 'customer' }),
      Reservation.countDocuments({ status: 'pending' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: monthAgo } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { count: -1 } }, { $limit: 5 }
      ])
    ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const weekRevenue = weekOrders.reduce((s, o) => s + o.total, 0);
    const monthRevenue = monthOrders.reduce((s, o) => s + o.total, 0);

    // Daily revenue for chart (last 7 days)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today - i*86400000);
      const next = new Date(d.getTime() + 86400000);
      const dayOrders = weekOrders.filter(o => o.createdAt >= d && o.createdAt < next);
      dailyRevenue.push({ date: d.toLocaleDateString('en-IN', { weekday: 'short' }), revenue: dayOrders.reduce((s, o) => s + o.total, 0), count: dayOrders.length });
    }

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      today: { orders: todayOrders.length, revenue: todayRevenue, avgOrderValue: todayOrders.length ? Math.round(todayRevenue / todayOrders.length) : 0 },
      week: { orders: weekOrders.length, revenue: weekRevenue },
      month: { orders: monthOrders.length, revenue: monthRevenue },
      totalCustomers,
      pendingReservations,
      topItems,
      dailyRevenue,
      statusBreakdown
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/revenue', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;
    const data = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' }, createdAt: { $gte: new Date(`${year}-01-01`) } } },
      { $group: {
        _id: period === 'monthly' ? { $month: '$createdAt' } : { $week: '$createdAt' },
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        avgValue: { $avg: '$total' }
      }},
      { $sort: { '_id': 1 } }
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/peak-hours', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      { $sort: { '_id': 1 } }
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/menu-performance', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $unwind: '$items' },
      { $group: {
        _id: '$items.name',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orderCount: { $sum: 1 }
      }},
      { $sort: { totalRevenue: -1 } }, { $limit: 20 }
    ]);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
