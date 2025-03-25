// Dummy user data for the test account
export const dummyUser = {
  _id: 'testuser123',
  username: 'testuser',
  email: 'test@test.com',
  avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
  bio: 'This is a test user account',
  pins: Array.from({ length: 56 }, (_, i) => String(i + 1)), // Updated pins array
  boards: ['board1', 'board2'],
  followers: ['user2', 'user3'],
  following: ['user4', 'user5']
};

// Helper function to generate pins
const generatePins = () => {
  const categories = [
    {
      name: 'Interior Design',
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace',
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
        'https://images.unsplash.com/photo-1616137466211-f939a420be84',
        'https://images.unsplash.com/photo-1615529182904-14819c35db37',
      ]
    },
    {
      name: 'Food',
      images: [
        'https://images.unsplash.com/photo-1546007600-8c2e5a9b8ea7',
        'https://images.unsplash.com/photo-1528735602780-2552fd46c7af',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
        'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      ]
    },
    {
      name: 'Travel',
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e',
        'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2',
      ]
    },
    {
      name: 'Technology',
      images: [
        'https://images.unsplash.com/photo-1593062096033-9a26b09da705',
        'https://images.unsplash.com/photo-1496171367470-9ed9a91ea604',
        'https://images.unsplash.com/photo-1498049794561-7780e7231661',
        'https://images.unsplash.com/photo-1515343480029-43cdfe6b6aae',
        'https://images.unsplash.com/photo-1518770660439-4636190af475',
      ]
    },
    {
      name: 'Architecture',
      images: [
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2',
        'https://images.unsplash.com/photo-1486325212027-8081e485255e',
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
        'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e',
      ]
    },
    {
      name: 'Nature',
      images: [
        'https://images.unsplash.com/photo-1545241047-6083a3684587',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b',
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e',
        'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f',
        'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1',
      ]
    }
  ];

  const adjectives = ['Amazing', 'Beautiful', 'Stunning', 'Incredible', 'Perfect', 'Inspiring', 'Creative', 'Modern', 'Elegant', 'Minimalist'];
  const pins = [];

  // Generate 56 pins (6 original + 50 new)
  for (let i = 0; i < 56; i++) {
    const category = categories[i % categories.length];
    const imageIndex = Math.floor(i / categories.length) % category.images.length;
    const adjective = adjectives[i % adjectives.length];

    pins.push({
      _id: String(i + 1),
      title: `${adjective} ${category.name} ${Math.floor(i / categories.length) + 1}`,
      description: `Discover this ${adjective.toLowerCase()} ${category.name.toLowerCase()} inspiration for your next project`,
      imageUrl: `${category.images[imageIndex]}?w=800&pin=${i}`, // Add pin parameter to prevent image caching
      author: dummyUser,
      likes: [`user${(i % 5) + 1}`, `user${((i + 1) % 5) + 1}`],
      savedBy: [`user${((i + 2) % 5) + 1}`, `user${((i + 3) % 5) + 1}`],
      board: {
        _id: `board${(i % 6) + 1}`,
        name: `${category.name} Collection`
      }
    });
  }

  return pins;
};

// Generate and export dummy pins
export const dummyPins = generatePins();

// Dummy boards data
export const dummyBoards = [
  {
    _id: 'board1',
    name: 'Interior Design Ideas',
    description: 'Collection of beautiful interior designs',
    coverImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    pins: dummyPins.filter(pin => pin.board._id === 'board1').map(pin => pin._id),
    author: dummyUser,
    followers: ['user2', 'user3']
  },
  {
    _id: 'board2',
    name: 'Travel Inspiration',
    description: 'Places to visit around the world',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    pins: dummyPins.filter(pin => pin.board._id === 'board2').map(pin => pin._id),
    author: dummyUser,
    followers: ['user4', 'user5']
  }
]; 