const express = require('express');
const Pin = require('../models/Pin');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Like a pin
router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const pin = await Pin.findById(req.params.id);
        if (!pin) return res.status(404).json({ message: 'Pin not found' });

        if (!pin.likes.includes(req.user.id)) {
            pin.likes.push(req.user.id);
            await pin.save();
        }

        res.json(pin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Unlike a pin
router.delete('/:id/unlike', authMiddleware, async (req, res) => {
    try {
        const pin = await Pin.findById(req.params.id);
        if (!pin) return res.status(404).json({ message: 'Pin not found' });

        pin.likes = pin.likes.filter(userId => userId.toString() !== req.user.id);
        await pin.save();

        res.json(pin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Save a pin to user’s collection
router.post('/:id/save', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.savedPins.includes(req.params.id)) {
            user.savedPins.push(req.params.id);
            await user.save();
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Remove a pin from user’s collection
router.delete('/:id/unsave', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.savedPins = user.savedPins.filter(pinId => pinId.toString() !== req.params.id);
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
