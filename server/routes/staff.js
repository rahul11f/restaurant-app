const router = require('express').Router();
const { User, Staff } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).populate('user', 'name email phone avatar');
    res.json(staff);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const { name, email, password, phone, role, salary, shift, joiningDate } = req.body;
    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, password, phone, role });
    else { user.role = role; await user.save(); }
    const count = await Staff.countDocuments();
    const staffDoc = await Staff.create({ user: user._id, employeeId: `EMP${(count + 1).toString().padStart(3, '0')}`, role, salary, shift, joiningDate });
    res.status(201).json(await staffDoc.populate('user', 'name email phone avatar'));
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const s = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user', 'name email phone avatar');
    res.json(s);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/:id/attendance', protect, restrictTo('admin', 'manager'), async (req, res) => {
  try {
    const s = await Staff.findById(req.params.id);
    s.attendance.push(req.body);
    await s.save();
    res.json(s);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    await Staff.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Staff deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
