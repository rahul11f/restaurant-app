const router = require('express').Router();
const { MenuItem } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

// Get all menu items (public)
router.get('/', async (req, res) => {
  try {
    const { category, tags, search, sort, available, featured, special } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (available === 'true') filter.isAvailable = true;
    if (featured === 'true') filter.isFeatured = true;
    if (special === 'true') filter.isSpecial = true;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];

    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, rating: { rating: -1 }, popular: { orderCount: -1 }, newest: { createdAt: -1 } };
    const sortQuery = sortMap[sort] || { sortOrder: 1, createdAt: -1 };

    const items = await MenuItem.find(filter).sort(sortQuery);
    const categories = await MenuItem.distinct('category');
    res.json({ items, categories });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single item (public)
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create item (admin)
router.post('/', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update item (admin)
router.put('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete item (admin)
router.delete('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle availability (admin)
router.patch('/:id/toggle', protect, restrictTo('admin', 'manager', 'chef'), async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Bulk price update (admin)
router.post('/bulk-price', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const { category, adjustment, type } = req.body;
    const items = await MenuItem.find({ category });
    for (const item of items) {
      item.price = type === 'percentage' ? item.price * (1 + adjustment / 100) : item.price + adjustment;
      await item.save();
    }
    res.json({ message: `Updated ${items.length} items` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
