const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pin = require('../models/Pin');
const Board = require('../models/Board');

// @route   GET api/pins
// @desc    Get all pins
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const pins = await Pin.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username title bio')
      .populate('board', 'name isPrivate');

    const total = await Pin.countDocuments();

    res.json({
      pins,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/pins
// @desc    Create a pin
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, imageUrl, category, tags, boardId } = req.body;

    // Check if board exists and user owns it
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const pin = new Pin({
      title,
      description,
      imageUrl,
      category,
      tags,
      user: req.user.id,
      board: boardId
    });

    await pin.save();

    // Add pin to board
    board.pins.push(pin._id);
    await board.save();

    res.json(pin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/pins/:id
// @desc    Get pin by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate('user', 'name username title bio')
      .populate('board', 'name isPrivate user');

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user has access to the board
    if (pin.board.isPrivate && pin.board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(pin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/pins/:id
// @desc    Update a pin
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user owns the pin
    if (pin.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { title, description, imageUrl, category, tags } = req.body;

    pin.title = title || pin.title;
    pin.description = description || pin.description;
    pin.imageUrl = imageUrl || pin.imageUrl;
    pin.category = category || pin.category;
    pin.tags = tags || pin.tags;

    await pin.save();
    res.json(pin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/pins/:id
// @desc    Delete a pin
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user owns the pin
    if (pin.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove pin from board
    const board = await Board.findById(pin.board);
    if (board) {
      board.pins = board.pins.filter(pinId => pinId.toString() !== pin._id.toString());
      await board.save();
    }

    await pin.remove();
    res.json({ message: 'Pin removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/pins/:id/save
// @desc    Save a pin
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user has already saved the pin
    if (pin.saves.includes(req.user.id)) {
      return res.status(400).json({ message: 'Pin already saved' });
    }

    pin.saves.push(req.user.id);
    await pin.save();

    res.json(pin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/pins/:id/save
// @desc    Unsave a pin
// @access  Private
router.delete('/:id/save', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user has saved the pin
    if (!pin.saves.includes(req.user.id)) {
      return res.status(400).json({ message: 'Pin not saved' });
    }

    pin.saves = pin.saves.filter(id => id.toString() !== req.user.id);
    await pin.save();

    res.json(pin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 