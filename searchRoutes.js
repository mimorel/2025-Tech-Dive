const express = require('express');
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Fetch a user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Fetch all pins created by a user
router.get('/:id/pins', async (req, res) => {
    try {
        const pins = await Pin.find({ user: req.params.id });
        res.json(pins);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Fetch all boards owned by a user
router.get('/:id/boards', async (req, res) => {
    try {
        const boards = await Board.find({ user: req.params.id });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update user profile info (name, bio, avatar)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Unauthorized to update this profile' });
        }

        const { name, bio, avatar } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, bio, avatar },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
