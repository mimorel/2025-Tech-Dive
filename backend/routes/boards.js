const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Board = require('../models/Board');
const Pin = require('../models/Pin');

// @route   GET api/boards
// @desc    Get all boards
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const boards = await Board.find({ $or: [{ user: req.user.id }, { isPrivate: false }] })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name username title bio')
      .populate('pins');

    const total = await Board.countDocuments({ $or: [{ user: req.user.id }, { isPrivate: false }] });

    res.json({
      boards,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/boards
// @desc    Create a board
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;

    const board = new Board({
      name,
      description,
      isPrivate,
      user: req.user.id
    });

    await board.save();
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/boards/:id
// @desc    Get board by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('user', 'name username title bio')
      .populate('pins');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the board
    if (board.isPrivate && board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/boards/:id
// @desc    Update a board
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { name, description, isPrivate } = req.body;

    board.name = name || board.name;
    board.description = description || board.description;
    board.isPrivate = isPrivate !== undefined ? isPrivate : board.isPrivate;

    await board.save();
    res.json(board);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/boards/:id
// @desc    Delete a board
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete all pins in the board
    await Pin.deleteMany({ board: board._id });

    await board.remove();
    res.json({ message: 'Board removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add a pin to a board
router.post('/:id/pins', auth, async (req, res) => {
  try {
    const { pinId } = req.body;
    const board = await Board.findById(req.params.id);
    const pin = await Pin.findById(pinId);

    if (!board || !pin) {
      return res.status(404).json({ message: 'Board or Pin not found' });
    }

    // Check if user has permission to add pins
    if (board.user.toString() !== req.user.id && 
        !board.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if pin is already in the board
    if (board.pins.includes(pinId)) {
      return res.status(400).json({ message: 'Pin already in board' });
    }

    board.pins.push(pinId);
    pin.board = board._id;

    await Promise.all([board.save(), pin.save()]);
    res.json(board);
  } catch (error) {
    console.error('Error adding pin to board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a pin from a board
router.delete('/:id/pins/:pinId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    const pin = await Pin.findById(req.params.pinId);

    if (!board || !pin) {
      return res.status(404).json({ message: 'Board or Pin not found' });
    }

    // Check if user has permission to remove pins
    if (board.user.toString() !== req.user.id && 
        !board.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    board.pins = board.pins.filter(id => id.toString() !== req.params.pinId);
    pin.board = null;

    await Promise.all([board.save(), pin.save()]);
    res.json(board);
  } catch (error) {
    console.error('Error removing pin from board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a collaborator to a board
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if user is already a collaborator
    if (board.collaborators.includes(userId)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    board.collaborators.push(userId);
    await board.save();

    res.json(board);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a collaborator from a board
router.delete('/:id/collaborators/:userId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    board.collaborators = board.collaborators.filter(
      id => id.toString() !== req.params.userId
    );

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 