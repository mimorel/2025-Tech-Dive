const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Pin = require('../models/Pin');
const Board = require('../models/Board');

// Create a new pin
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, imageUrl, link, tags, boardId } = req.body;

    // Check if board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.user.toString() !== req.user.id && 
        !board.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to pin to this board' });
    }

    const pin = new Pin({
      title,
      description,
      imageUrl,
      link,
      tags,
      user: req.user.id,
      board: boardId,
    });

    await pin.save();

    // Add pin to board
    board.pins.push(pin._id);
    await board.save();

    res.json(pin);
  } catch (error) {
    console.error('Error creating pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific pin
router.get('/:id', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('board', 'name privacy')
      .populate('saves', 'username avatar')
      .populate('comments.user', 'username avatar');

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user has access to the pin
    const board = await Board.findById(pin.board);
    if (board.privacy !== 'public' && 
        board.user.toString() !== req.user.id && 
        !board.collaborators.includes(req.user.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(pin);
  } catch (error) {
    console.error('Error fetching pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a pin
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, link, tags } = req.body;
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user owns the pin
    if (pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    pin.title = title || pin.title;
    pin.description = description || pin.description;
    pin.link = link || pin.link;
    pin.tags = tags || pin.tags;

    await pin.save();
    res.json(pin);
  } catch (error) {
    console.error('Error updating pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a pin
router.delete('/:id', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    // Check if user owns the pin
    if (pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove pin from board
    const board = await Board.findById(pin.board);
    if (board) {
      board.pins = board.pins.filter(id => id.toString() !== pin._id.toString());
      await board.save();
    }

    await pin.remove();
    res.json({ message: 'Pin deleted' });
  } catch (error) {
    console.error('Error deleting pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Save a pin
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

    res.json({
      message: 'Pin saved successfully',
      saves: pin.saves.length
    });
  } catch (error) {
    console.error('Error saving pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unsave a pin
router.post('/:id/unsave', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    pin.saves = pin.saves.filter(id => id.toString() !== req.user.id);
    await pin.save();

    res.json({
      message: 'Pin unsaved successfully',
      saves: pin.saves.length
    });
  } catch (error) {
    console.error('Error unsaving pin:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a pin
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    pin.comments.push({
      user: req.user.id,
      text,
    });

    await pin.save();

    // Populate the new comment's user information
    const newComment = pin.comments[pin.comments.length - 1];
    await Pin.populate(pin, {
      path: 'comments.user',
      select: 'username avatar',
      match: { _id: newComment.user }
    });

    res.json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a comment from a pin
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const pin = await Pin.findById(req.params.id);

    if (!pin) {
      return res.status(404).json({ message: 'Pin not found' });
    }

    const comment = pin.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or the pin
    if (comment.user.toString() !== req.user.id && 
        pin.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.remove();
    await pin.save();

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 