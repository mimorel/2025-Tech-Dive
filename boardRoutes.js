const express = require('express');
const Board = require('../models/Board');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Create a new board
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Board name is required' });
        }

        const newBoard = new Board({
            name,
            description,
            user: req.user.id,
            pins: [],
        });

        await newBoard.save();
        res.status(201).json(newBoard);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get all boards of a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const boards = await Board.find({ user: req.user.id });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Get a specific board
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const board = await Board.findById(req.params.id).populate('pins');
        if (!board) return res.status(404).json({ message: 'Board not found' });
        res.json(board);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Rename or update board details
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        const updatedBoard = await Board.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true }
        );
        if (!updatedBoard) return res.status(404).json({ message: 'Board not found' });
        res.json(updatedBoard);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Delete a board
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedBoard = await Board.findByIdAndDelete(req.params.id);
        if (!deletedBoard) return res.status(404).json({ message: 'Board not found' });
        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Add a pin to a board
router.post('/:id/add-pin', authMiddleware, async (req, res) => {
    try {
        const { pinId } = req.body;
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: 'Board not found' });

        if (!board.pins.includes(pinId)) {
            board.pins.push(pinId);
            await board.save();
        }

        res.json(board);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Remove a pin from a board
router.delete('/:id/remove-pin/:pinId', authMiddleware, async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);
        if (!board) return res.status(404).json({ message: 'Board not found' });

        board.pins = board.pins.filter(pin => pin.toString() !== req.params.pinId);
        await board.save();

        res.json(board);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
