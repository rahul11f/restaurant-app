const router = require('express').Router();
const { Review, MenuItem, Order } = require('../models');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { type, approved, menuItem } = req.query;
    const filter = { isVisible: true };
    if (type) filter.type = type;
    if (approved !== undefined) filter.isApproved = approved === 'true';
    else filter.isApproved = true;
    if (menuItem) filter.menuItem = menuItem;
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).populate('customer', 'name avatar');
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const review = await Review.create({ ...req.body, customer: req.user._id, customerName: req.user.name, customerAvatar: req.user.avatar });
    if (req.body.menuItem) {
      const reviews = await Review.find({ menuItem: req.body.menuItem, isApproved: true });
      const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
      await MenuItem.findByIdAndUpdate(req.body.menuItem, { rating: avg, reviewCount: reviews.length });
    }
    res.status(201).json(review);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.patch('/:id/approve', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.approved }, { new: true });
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/reply', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { reply: { text: req.body.text, repliedAt: new Date() } }, { new: true });
    res.json(review);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
