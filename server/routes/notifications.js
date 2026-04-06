const router = require('express').Router();
const { NotificationLog, User } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');
const { sendCustomNotification, sendEmail } = require('../utils/notifications');

router.get('/', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const logs = await NotificationLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Send custom WhatsApp message to specific customer
router.post('/whatsapp/custom', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const { phone, message } = req.body;
    const result = await sendCustomNotification(phone, message);
    res.json({ success: !!result, result });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Send custom email
router.post('/email/custom', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    await sendEmail(req.body.to, req.body.subject, req.body.html);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Broadcast to all customers
router.post('/broadcast', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { message, channel, segment } = req.body;
    const filter = { role: 'customer', isActive: true };
    if (segment === 'vip') filter.totalSpent = { $gte: 5000 };
    else if (segment === 'new') filter.totalOrders = { $lte: 2 };
    const customers = await User.find(filter).select('phone email');
    let sent = 0;
    for (const c of customers) {
      if (channel === 'whatsapp' && c.phone) { await sendCustomNotification(c.phone, message); sent++; }
      else if (channel === 'email' && c.email) { await sendEmail(c.email, req.body.subject || 'Update from Spice & Soul', `<p>${message}</p>`); sent++; }
    }
    res.json({ message: `Sent to ${sent} customers` });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
