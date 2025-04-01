const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pin = require('../models/Pin');
const User = require('../models/User');

// @route   GET api/feed
// @desc    Get user's feed
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const following = user.following || [];

    // Get pins from followed users and user's own pins
    const pins = await Pin.find({
      $or: [
        { user: { $in: following } },
        { user: req.user.id }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('user', 'username fullName avatar')
    .populate('board', 'name');

    res.json(pins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/feed/trending
// @desc    Get trending pins
// @access  Private
router.get('/trending', auth, async (req, res) => {
  try {
    const pins = await Pin.find()
      .sort({ saves: -1, createdAt: -1 })
      .limit(50)
      .populate('user', 'username fullName avatar')
      .populate('board', 'name');

    res.json(pins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/feed/category/:category
// @desc    Get pins by category
// @access  Private
router.get('/category/:category', auth, async (req, res) => {
  try {
    const pins = await Pin.find({ category: req.params.category })
      .sort({ createdAt: -1 })
      .populate('user', 'username fullName avatar')
      .populate('board', 'name');

    res.json(pins);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 