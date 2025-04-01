const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get user profile
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current user is following this user
    const isFollowing = user.followers.includes(req.user.id);

    // Get user's pins count
    const pinsCount = await Pin.countDocuments({ user: user._id });
    
    // Get user's boards count
    const boardsCount = await Board.countDocuments({ user: user._id });

    res.json({
      user,
      isFollowing,
      stats: {
        pins: pinsCount,
        boards: boardsCount,
        followers: user.followers.length,
        following: user.following.length
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's pins
router.get('/:username/pins', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const pins = await Pin.find({ user: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('board', 'name');

    const total = await Pin.countDocuments({ user: user._id });

    res.json({
      pins,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching user pins:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's boards
router.get('/:username/boards', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const boards = await Board.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('pins', 'imageUrl');

    res.json(boards);
  } catch (error) {
    console.error('Error fetching user boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Follow user
router.post('/:username/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findOne({ username: req.params.username });
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToFollow._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const currentUser = await User.findById(req.user.id);
    
    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following and followers lists
    currentUser.following.push(userToFollow._id);
    userToFollow.followers.push(req.user.id);

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      message: 'Successfully followed user',
      followers: userToFollow.followers.length
    });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unfollow user
router.post('/:username/unfollow', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findOne({ username: req.params.username });
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);
    
    // Remove from following and followers lists
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== req.user.id
    );

    await Promise.all([currentUser.save(), userToUnfollow.save()]);

    res.json({
      message: 'Successfully unfollowed user',
      followers: userToUnfollow.followers.length
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/profile
// @desc    Get user profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { fullName, bio, location, website } = req.body;

    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.location = location || user.location;
    user.website = website || user.website;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/profile/avatar
// @desc    Update user avatar
// @access  Private
router.put('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 