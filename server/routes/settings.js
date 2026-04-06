const router = require('express').Router();
const { Settings } = require('../models');
const { protect, restrictTo } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    }
    res.json({ message: 'Settings updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:key', async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json(setting?.value || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
