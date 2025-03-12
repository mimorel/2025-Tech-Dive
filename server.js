/*
Project: Pinterest-Like App for Fellows
Stack: React (frontend), Node.js/Express (backend), MongoDB (database)

This project is designed to simulate a real-world development experience with intentional bugs and missing features for fellows to fix and implement.
*/

// Backend: Express Server Setup (server/index.js)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pinterest_clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Define API routes
const authRoutes = require('./routes/auth');
const pinRoutes = require('./routes/pins');
const boardRoutes = require('./routes/boards');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const searchRoutes = require('./routes/search');

app.use('/api/auth', authRoutes);
app.use('/api/pins', pinRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(port, () => console.log(`Server running on port ${port}`));

// --- Intentional Bugs ---
// - Some API routes might be incomplete or return incorrect data.
// - The image upload route may fail occasionally.

// --- Missing Features ---
// - Authentication is stubbed out but not fully implemented.
// - Search functionality is missing.
// - Users cannot rename or delete boards.

// (More files and features will be added as part of the exercise)
