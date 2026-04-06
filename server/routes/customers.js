const router = require('express').Router();
const { User, Order } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const { search, tags, page = 1, limit = 20 } = req.query;
    const filter = { role: 'customer' };
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }, { phone: { $regex: search, $options: 'i' } }];
    if (tags) filter.tags = { $in: tags.split(',') };
    const customers = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await User.countDocuments(filter);
    res.json({ customers, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    const orders = await Order.find({ customer: req.params.id }).sort({ createdAt: -1 }).limit(10);
    res.json({ customer, orders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/loyalty', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(req.params.id, { $inc: { loyaltyPoints: req.body.points } }, { new: true });
    res.json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/tags', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const customer = await User.findByIdAndUpdate(req.params.id, { tags: req.body.tags }, { new: true });
    res.json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
