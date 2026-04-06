const router = require('express').Router();
const { Offer, User } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { sendOfferBlast } = require('../utils/notifications');

router.get('/', async (req, res) => {
  try {
    const filter = { isActive: true, validFrom: { $lte: new Date() }, validTo: { $gte: new Date() } };
    const offers = await Offer.find(filter).sort({ isFeatured: -1, createdAt: -1 });
    res.json(offers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/admin', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json(offer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(offer);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// WhatsApp blast to all customers
router.post('/:id/blast', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    const customers = await User.find({ role: 'customer', phone: { $exists: true } }).select('phone');
    let sent = 0;
    for (const c of customers) {
      if (c.phone) {
        await sendOfferBlast(c.phone, offer);
        sent++;
      }
    }
    res.json({ message: `Sent to ${sent} customers` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
