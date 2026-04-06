// reservations.js
const express = require('express');
const { Reservation } = require('../models');
const { protect, restrictTo, optionalAuth } = require('../middleware/auth');
const { sendReservationConfirmation } = require('../utils/notifications');

const router = express.Router();

router.post('/', optionalAuth, async (req, res) => {
  try {
    const reservation = await Reservation.create({ ...req.body, customer: req.user?._id });
    const phone = req.body.customerInfo?.phone || req.user?.phone;
    if (phone) sendReservationConfirmation(phone, reservation).catch(console.error);
    req.app.get('io').to('admin').emit('new_reservation', reservation);
    res.status(201).json(reservation);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.get('/admin', protect, restrictTo('admin', 'manager', 'waiter'), async (req, res) => {
  try {
    const { date, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) { const d = new Date(date); filter.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) }; }
    const reservations = await Reservation.find(filter).sort({ date: 1, time: 1 }).populate('customer', 'name email phone');
    res.json(reservations);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', protect, async (req, res) => {
  try {
    const r = await Reservation.find({ customer: req.user._id }).sort({ date: -1 });
    res.json(r);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.patch('/:id/status', protect, restrictTo('admin', 'manager', 'waiter'), async (req, res) => {
  try {
    const r = await Reservation.findByIdAndUpdate(req.params.id, { status: req.body.status, tableNumber: req.body.tableNumber }, { new: true });
    res.json(r);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Reservation cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
