const router = require('express').Router();
const { User } = require('../models');
const { generateToken, protect } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, loyaltyPoints: user.loyaltyPoints, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    const token = generateToken(user._id);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, loyaltyPoints: user.loyaltyPoints, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, birthday, anniversary, preferences, addresses } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, birthday, anniversary, preferences, addresses }, { new: true });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword))) return res.status(400).json({ message: 'Current password wrong' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Google OAuth (simplified — integrate with Passport.js for full flow)
router.post('/google', async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ googleId, email, name, avatar, isVerified: true });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = avatar;
      await user.save();
    }
    const token = generateToken(user._id);
    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, loyaltyPoints: user.loyaltyPoints, avatar: user.avatar } });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
