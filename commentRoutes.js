const express = require('express');
const Comment = require('../models/Comment');
const Pin = require('../models/Pin');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Add a comment to a pin
router.post('/:id/comments', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const pin = await Pin.findById(req.params.id);
        if (!pin) return res.status(404).json({ message: 'Pin not found' });

        const newComment = new Comment({
            text,
            user: req.user.id,
            pin: req.params.id,
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Fetch comments for a pin
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ pin: req.params.id }).populate('user', 'username');
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete a comment (if user owns it)
router.delete('/comments/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
