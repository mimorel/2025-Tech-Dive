const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Board = require('../models/Board');
const Pin = require('../models/Pin');

// Sample categories
const categories = [
  'Nature',
  'Food & Drink',
  'Travel',
  'Art & Design',
  'Fashion',
  'Technology',
  'Home & Garden',
  'Health & Wellness',
  'Sports',
  'DIY & Crafts'
];

// Sample users
const users = [
  {
    username: 'nature_lover',
    email: 'nature@example.com',
    password: 'password123',
    fullName: 'Sarah Johnson',
    bio: 'Photographer and nature enthusiast 🌿',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
  },
  {
    username: 'foodie_adventures',
    email: 'foodie@example.com',
    password: 'password123',
    fullName: 'Mike Chen',
    bio: 'Food photographer and recipe developer 🍳',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    username: 'travel_wanderer',
    email: 'travel@example.com',
    password: 'password123',
    fullName: 'Emma Wilson',
    bio: 'Digital nomad exploring the world 🌍',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
  },
  {
    username: 'art_gallery',
    email: 'art@example.com',
    password: 'password123',
    fullName: 'David Kim',
    bio: 'Contemporary artist and designer 🎨',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg'
  },
  {
    username: 'tech_geek',
    email: 'tech@example.com',
    password: 'password123',
    fullName: 'Alex Rivera',
    bio: 'Tech enthusiast and developer 💻',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg'
  }
];

// Sample boards for each user
const createBoards = (userId, category) => {
  return [
    {
      name: `${category} Collection`,
      description: `A curated collection of ${category.toLowerCase()} pins`,
      user: userId,
      privacy: 'public',
      category: category
    },
    {
      name: `${category} Inspiration`,
      description: `Inspirational ${category.toLowerCase()} ideas and projects`,
      user: userId,
      privacy: 'public',
      category: category
    },
    {
      name: `${category} Favorites`,
      description: `My favorite ${category.toLowerCase()} content`,
      user: userId,
      privacy: 'private',
      category: category
    }
  ];
};

// Sample pins for each board
const createPins = (boardId, category) => {
  const pins = [];
  const pinCount = Math.floor(Math.random() * 10) + 5; // 5-15 pins per board

  for (let i = 0; i < pinCount; i++) {
    pins.push({
      title: `${category} Pin ${i + 1}`,
      description: `Beautiful ${category.toLowerCase()} content ${i + 1}`,
      imageUrl: `https://source.unsplash.com/random/800x600/?${category.toLowerCase()}`,
      link: `https://example.com/${category.toLowerCase()}-${i + 1}`,
      tags: [category.toLowerCase(), 'inspiration', 'creative'],
      user: boardId.user,
      board: boardId._id
    });
  }

  return pins;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Board.deleteMany({});
    await Pin.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({ ...user, password: hashedPassword });
      })
    );

    console.log('Created users');

    // Create boards and pins for each user
    for (const user of createdUsers) {
      // Create boards for each category
      for (const category of categories) {
        const boards = await Board.insertMany(createBoards(user._id, category));
        console.log(`Created boards for ${user.username} - ${category}`);

        // Create pins for each board
        for (const board of boards) {
          await Pin.insertMany(createPins(board, category));
          console.log(`Created pins for board: ${board.name}`);
        }
      }
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 