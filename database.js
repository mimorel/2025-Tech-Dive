const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const Comment = require('../models/Comment');
require('dotenv').config();

mongoose.connect('mongodb://localhost:27017/pinterest_clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

const seedDatabase = async () => {
    try {
        await User.deleteMany();
        await Pin.deleteMany();
        await Board.deleteMany();
        await Comment.deleteMany();

        // Creating Users
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = await User.insertMany([
            { username: 'user1', email: 'user1@example.com', password: hashedPassword },
            { username: 'user2', email: 'user2@example.com', password: hashedPassword },
        ]);

        // Creating Boards
        const boards = await Board.insertMany([
            { name: 'Travel', description: 'Dream travel destinations', user: users[0]._id, pins: [] },
            { name: 'Food', description: 'Favorite recipes', user: users[1]._id, pins: [] },
        ]);

        // Creating Pins
        const pins = await Pin.insertMany([
            { title: 'Eiffel Tower', description: 'A beautiful view of the Eiffel Tower', imageUrl: 'https://example.com/eiffel.jpg', user: users[0]._id, board: boards[0]._id, likes: [], comments: [] },
            { title: 'Pasta Recipe', description: 'Delicious homemade pasta', imageUrl: 'https://example.com/pasta.jpg', user: users[1]._id, board: boards[1]._id, likes: [], comments: [] },
        ]);

        // Adding Pins to Boards
        boards[0].pins.push(pins[0]._id);
        boards[1].pins.push(pins[1]._id);
        await boards[0].save();
        await boards[1].save();

        // Creating Comments
        const comments = await Comment.insertMany([
            { text: 'Amazing picture!', user: users[1]._id, pin: pins[0]._id },
            { text: 'I need to try this recipe!', user: users[0]._id, pin: pins[1]._id },
        ]);

        pins[0].comments.push(comments[0]._id);
        pins[1].comments.push(comments[1]._id);
        await pins[0].save();
        await pins[1].save();

        console.log('Database seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding database', error);
        process.exit(1);
    }
};

seedDatabase();
