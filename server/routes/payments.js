const router = require('express').Router();
const crypto = require('crypto');
const { protect } = require('../middleware/auth');

// Create Razorpay order
router.post('/create', protect, async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    // In production, use: const Razorpay = require('razorpay');
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await instance.orders.create({ amount: amount * 100, currency, receipt: `receipt_${Date.now()}` });
    // For demo:
    const order = { id: `order_demo_${Date.now()}`, amount: amount * 100, currency };
    res.json({ ...order, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Verify payment signature
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
      .update(body).digest('hex');
    const isValid = expectedSignature === razorpay_signature;
    res.json({ success: isValid, paymentId: razorpay_payment_id });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Webhook
router.post('/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret')
    .update(body).digest('hex');
  if (signature === expectedSig) {
    const { event, payload } = req.body;
    if (event === 'payment.captured') console.log('Payment captured:', payload.payment.entity.id);
  }
  res.json({ status: 'ok' });
});

module.exports = router;
