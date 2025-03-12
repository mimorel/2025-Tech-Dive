const express = require('express');
const Pin = require('../models/Pin');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create a new pin (with image upload stubbed)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, imageUrl, boardId } = req.body;

        if (!title || !imageUrl) {
            return res.status(400).json({ message: 'Title and Image URL are required' });
        }

        const newPin = new Pin({
            title,
            description,
            imageUrl,
            board: boardId,
            user: req.user.id,
        });

        await newPin.save();
        res.status(201).json(newPin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all pins (with pagination)
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pins = await Pin.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        res.json(pins);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get a single pin by ID
router.get('/:id', async (req, res) => {
    try {
        const pin = await Pin.findById(req.params.id);
        if (!pin) return res.status(404).json({ message: 'Pin not found' });
        res.json(pin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Update pin details
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, description, boardId } = req.body;
        const updatedPin = await Pin.findByIdAndUpdate(
            req.params.id,
            { title, description, board: boardId },
            { new: true }
        );
        if (!updatedPin) return res.status(404).json({ message: 'Pin not found' });
        res.json(updatedPin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete a pin
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedPin = await Pin.findByIdAndDelete(req.params.id);
        if (!deletedPin) return res.status(404).json({ message: 'Pin not found' });
        res.json({ message: 'Pin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Search pins by keyword
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        const pins = await Pin.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
            ],
        });
        res.json(pins);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
