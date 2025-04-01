const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Board = require('../models/Board');
const Pin = require('../models/Pin');

// Create a new board
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, privacy, category } = req.body;

    const board = new Board({
      name,
      description,
      privacy,
      category,
      user: req.user.id,
    });

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's boards
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('pins', 'imageUrl');

    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific board
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('pins')
      .populate('user', 'username avatar')
      .populate('collaborators', 'username avatar');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the board
    if (board.privacy !== 'public' && 
        board.user.toString() !== req.user.id && 
        !board.collaborators.some(collab => collab._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a board
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, privacy, category } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    board.name = name || board.name;
    board.description = description || board.description;
    board.privacy = privacy || board.privacy;
    board.category = category || board.category;

    await board.save();
    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user owns the board
    if (board.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove all pins from this board
    await Pin.deleteMany({ board: board._id });
    await board.remove();

    res.json({ message: 'Board deleted' });
  } catch (error) {
    console.error('Error deleting board:', error);
    res.status(500).json({ message: 'Server error' });
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