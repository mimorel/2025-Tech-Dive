const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pin = require('../models/Pin');
const Board = require('../models/Board');
const Comment = require('../models/Comment');

const MONGODB_URI = 'mongodb://localhost:27017/pinterest-clone';

const users = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=1',
    bio: 'Digital artist and photographer. Love capturing moments and creating art.',
    location: 'New York, USA',
    website: 'https://johndoe.art',
  },
  {
    username: 'sarah_smith',
    email: 'sarah@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=2',
    bio: 'Interior designer and home decor enthusiast. Sharing my design journey.',
    location: 'Los Angeles, USA',
    website: 'https://sarahdesigns.com',
  },
  {
    username: 'mike_wilson',
    email: 'mike@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=3',
    bio: 'Food lover and amateur chef. Cooking and sharing recipes.',
    location: 'Chicago, USA',
    website: 'https://mikeskitchen.com',
  },
  {
    username: 'emma_brown',
    email: 'emma@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=4',
    bio: 'Travel blogger and adventure seeker. Exploring the world one destination at a time.',
    location: 'London, UK',
    website: 'https://emmastravels.com',
  },
  {
    username: 'david_lee',
    email: 'david@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=5',
    bio: 'Tech enthusiast and gadget reviewer. Sharing the latest in technology.',
    location: 'San Francisco, USA',
    website: 'https://davidtech.com',
  },
];

const boards = [
  {
    name: 'Travel Inspiration',
    description: 'Beautiful destinations and travel tips',
    category: 'Travel',
    isPrivate: false,
  },
  {
    name: 'Home Decor Ideas',
    description: 'Interior design inspiration and tips',
    category: 'Home',
    isPrivate: false,
  },
  {
    name: 'Food & Recipes',
    description: 'Delicious recipes and food photography',
    category: 'Food',
    isPrivate: false,
  },
  {
    name: 'Digital Art',
    description: 'Digital artwork and illustrations',
    category: 'Art',
    isPrivate: false,
  },
  {
    name: 'Tech Gadgets',
    description: 'Latest technology and gadgets',
    category: 'Technology',
    isPrivate: false,
  },
  {
    name: 'Fashion Trends',
    description: 'Latest fashion trends and style inspiration',
    category: 'Fashion',
    isPrivate: false,
  },
  {
    name: 'Fitness & Health',
    description: 'Workout routines and healthy living tips',
    category: 'Health',
    isPrivate: false,
  },
  {
    name: 'Photography Tips',
    description: 'Photography techniques and tips',
    category: 'Photography',
    isPrivate: false,
  },
  {
    name: 'DIY Projects',
    description: 'Do-it-yourself project ideas',
    category: 'DIY',
    isPrivate: false,
  },
  {
    name: 'Book Recommendations',
    description: 'Book reviews and reading lists',
    category: 'Books',
    isPrivate: false,
  },
];

const pins = [
  {
    title: 'Beautiful Sunset in Bali',
    description: 'Captured this amazing sunset during my trip to Bali. The colors were absolutely stunning!',
    imageUrl: 'https://source.unsplash.com/800x600/?sunset,bali',
    link: 'https://example.com/bali-sunset',
    category: 'Travel',
  },
  {
    title: 'Modern Living Room Design',
    description: 'Clean and minimal living room design with neutral colors and natural elements.',
    imageUrl: 'https://source.unsplash.com/800x600/?living-room,modern',
    link: 'https://example.com/modern-living-room',
    category: 'Home',
  },
  {
    title: 'Healthy Buddha Bowl',
    description: 'Colorful and nutritious Buddha bowl packed with fresh vegetables and protein.',
    imageUrl: 'https://source.unsplash.com/800x600/?buddha-bowl,food',
    link: 'https://example.com/buddha-bowl',
    category: 'Food',
  },
  {
    title: 'Digital Art Creation',
    description: 'My latest digital artwork exploring abstract forms and vibrant colors.',
    imageUrl: 'https://source.unsplash.com/800x600/?digital-art,abstract',
    link: 'https://example.com/digital-art',
    category: 'Art',
  },
  {
    title: 'Latest Smartphone Review',
    description: 'In-depth review of the newest flagship smartphone with amazing camera capabilities.',
    imageUrl: 'https://source.unsplash.com/800x600/?smartphone,technology',
    link: 'https://example.com/smartphone-review',
    category: 'Technology',
  },
  {
    title: 'Summer Fashion Trends',
    description: 'Must-have pieces for your summer wardrobe this season.',
    imageUrl: 'https://source.unsplash.com/800x600/?fashion,summer',
    link: 'https://example.com/summer-fashion',
    category: 'Fashion',
  },
  {
    title: 'Morning Workout Routine',
    description: 'Start your day with this energizing workout routine.',
    imageUrl: 'https://source.unsplash.com/800x600/?workout,fitness',
    link: 'https://example.com/workout-routine',
    category: 'Health',
  },
  {
    title: 'Photography Tips',
    description: 'Essential tips for capturing stunning landscape photos.',
    imageUrl: 'https://source.unsplash.com/800x600/?photography,landscape',
    link: 'https://example.com/photography-tips',
    category: 'Photography',
  },
  {
    title: 'DIY Plant Stand',
    description: 'Create this beautiful plant stand with simple materials.',
    imageUrl: 'https://source.unsplash.com/800x600/?diy,plants',
    link: 'https://example.com/diy-plant-stand',
    category: 'DIY',
  },
  {
    title: 'Book Recommendations',
    description: 'My favorite books from this month. Highly recommend!',
    imageUrl: 'https://source.unsplash.com/800x600/?books,reading',
    link: 'https://example.com/book-recommendations',
    category: 'Books',
  },
  {
    title: 'Paris Street Photography',
    description: 'Capturing the essence of Paris through street photography.',
    imageUrl: 'https://source.unsplash.com/800x600/?paris,street',
    link: 'https://example.com/paris-photography',
    category: 'Travel',
  },
  {
    title: 'Minimalist Kitchen Design',
    description: 'Modern kitchen design with clean lines and efficient storage.',
    imageUrl: 'https://source.unsplash.com/800x600/?kitchen,minimalist',
    link: 'https://example.com/kitchen-design',
    category: 'Home',
  },
  {
    title: 'Pasta Recipe',
    description: 'Homemade pasta with fresh ingredients and simple sauce.',
    imageUrl: 'https://source.unsplash.com/800x600/?pasta,food',
    link: 'https://example.com/pasta-recipe',
    category: 'Food',
  },
  {
    title: 'Digital Painting Process',
    description: 'Step-by-step guide to creating digital paintings.',
    imageUrl: 'https://source.unsplash.com/800x600/?digital-painting,art',
    link: 'https://example.com/digital-painting',
    category: 'Art',
  },
  {
    title: 'Smart Home Setup',
    description: 'Complete guide to setting up your smart home devices.',
    imageUrl: 'https://source.unsplash.com/800x600/?smart-home,technology',
    link: 'https://example.com/smart-home',
    category: 'Technology',
  },
  {
    title: 'Sustainable Fashion',
    description: 'Eco-friendly fashion choices for a better future.',
    imageUrl: 'https://source.unsplash.com/800x600/?sustainable-fashion',
    link: 'https://example.com/sustainable-fashion',
    category: 'Fashion',
  },
  {
    title: 'Yoga Poses',
    description: 'Essential yoga poses for beginners.',
    imageUrl: 'https://source.unsplash.com/800x600/?yoga,exercise',
    link: 'https://example.com/yoga-poses',
    category: 'Health',
  },
  {
    title: 'Portrait Photography',
    description: 'Tips for capturing stunning portrait photos.',
    imageUrl: 'https://source.unsplash.com/800x600/?portrait,photography',
    link: 'https://example.com/portrait-photography',
    category: 'Photography',
  },
  {
    title: 'DIY Wall Art',
    description: 'Create beautiful wall art with simple materials.',
    imageUrl: 'https://source.unsplash.com/800x600/?wall-art,diy',
    link: 'https://example.com/diy-wall-art',
    category: 'DIY',
  },
  {
    title: 'Reading Nook',
    description: 'Create the perfect reading nook in your home.',
    imageUrl: 'https://source.unsplash.com/800x600/?reading-nook,books',
    link: 'https://example.com/reading-nook',
    category: 'Books',
  },
];

const comments = [
  {
    text: 'This is absolutely stunning! The colors are incredible.',
    createdAt: new Date(),
  },
  {
    text: 'I love the minimalist design. Where did you get the furniture?',
    createdAt: new Date(),
  },
  {
    text: 'This looks delicious! Could you share the recipe?',
    createdAt: new Date(),
  },
  {
    text: 'The composition is perfect! What camera did you use?',
    createdAt: new Date(),
  },
  {
    text: 'I need this in my home! The lighting is perfect.',
    createdAt: new Date(),
  },
  {
    text: 'This is exactly what I was looking for! Thanks for sharing.',
    createdAt: new Date(),
  },
  {
    text: 'The attention to detail is amazing. Great work!',
    createdAt: new Date(),
  },
  {
    text: 'I tried this recipe and it turned out amazing!',
    createdAt: new Date(),
  },
  {
    text: 'The color palette is so inspiring. Love it!',
    createdAt: new Date(),
  },
  {
    text: 'This gives me so many ideas for my own space.',
    createdAt: new Date(),
  },
  {
    text: 'The lighting in this photo is perfect!',
    createdAt: new Date(),
  },
  {
    text: 'I would love to visit this place someday.',
    createdAt: new Date(),
  },
  {
    text: 'This is exactly the style I\'m going for!',
    createdAt: new Date(),
  },
  {
    text: 'The presentation is beautiful!',
    createdAt: new Date(),
  },
  {
    text: 'This is such a creative idea!',
    createdAt: new Date(),
  },
  {
    text: 'I\'m saving this for inspiration!',
    createdAt: new Date(),
  },
  {
    text: 'The details are incredible!',
    createdAt: new Date(),
  },
  {
    text: 'This is so helpful, thank you!',
    createdAt: new Date(),
  },
  {
    text: 'I love how you captured this moment.',
    createdAt: new Date(),
  },
  {
    text: 'This is exactly what I needed!',
    createdAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Board.deleteMany({});
    await Pin.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({ ...user, password: hashedPassword });
      })
    );
    console.log('Created users');

    // Create boards for each user
    const createdBoards = [];
    for (const user of createdUsers) {
      // Each user gets 2-3 boards
      const userBoards = await Promise.all(
        boards.slice(0, 3).map((board) => 
          Board.create({
            ...board,
            user: user._id,
          })
        )
      );
      createdBoards.push(...userBoards);
    }
    console.log('Created boards');

    // Create pins and comments
    for (let i = 0; i < pins.length; i++) {
      // Randomly select a user and board for each pin
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const userBoards = createdBoards.filter(board => board.user.toString() === randomUser._id.toString());
      const randomBoard = userBoards[Math.floor(Math.random() * userBoards.length)];

      const pin = await Pin.create({
        ...pins[i],
        user: randomUser._id,
        board: randomBoard._id,
      });

      // Add 2-4 random comments to each pin
      const numComments = Math.floor(Math.random() * 3) + 2; // Random number between 2 and 4
      for (let j = 0; j < numComments; j++) {
        const randomCommenter = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];
        
        await Comment.create({
          text: randomComment.text,
          user: randomCommenter._id,
          pin: pin._id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
        });
      }
    }
    console.log('Created pins and comments');

    // Add some pins to multiple boards
    const allPins = await Pin.find();
    for (const pin of allPins) {
      // 30% chance to add pin to another board
      if (Math.random() < 0.3) {
        const otherBoards = createdBoards.filter(
          board => board._id.toString() !== pin.board.toString() &&
                   board.user.toString() === pin.user.toString()
        );
        if (otherBoards.length > 0) {
          const randomBoard = otherBoards[Math.floor(Math.random() * otherBoards.length)];
          pin.boards.push(randomBoard._id);
          await pin.save();
        }
      }
    }
    console.log('Added pins to multiple boards');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase(); 