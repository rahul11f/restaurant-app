const router = require('express').Router();
const { Inventory } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('admin', 'manager', 'chef'), async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    let items = await Inventory.find(filter).sort({ category: 1, name: 1 });
    if (lowStock === 'true') items = items.filter(i => i.currentStock <= i.minThreshold);
    res.json(items);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/restock', protect, restrictTo('admin', 'manager', 'chef'), async (req, res) => {
  try {
    const { quantity, reason } = req.body;
    const item = await Inventory.findById(req.params.id);
    item.currentStock += quantity;
    item.lastRestocked = new Date();
    item.movements.push({ type: 'in', quantity, reason, by: req.user._id });
    await item.save();
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/use', protect, restrictTo('admin', 'manager', 'chef'), async (req, res) => {
  try {
    const { quantity, reason, type } = req.body;
    const item = await Inventory.findById(req.params.id);
    item.currentStock = Math.max(0, item.currentStock - quantity);
    item.movements.push({ type: type || 'out', quantity, reason, by: req.user._id });
    await item.save();
    if (item.currentStock <= item.minThreshold) {
      req.app.get('io').to('admin').emit('low_stock_alert', { item, level: item.currentStock });
    }
    res.json(item);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Archived' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
