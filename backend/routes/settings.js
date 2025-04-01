const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Default settings for new users
const DEFAULT_SETTINGS = {
  darkMode: false,
  gridSize: 'medium',
  notifications: true,
  emailNotifications: true,
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showLocation: false,
  },
  data: {
    autoSave: true,
    saveToGallery: true,
    cacheSize: 'medium',
  },
};

// @route   GET api/settings
// @desc    Get user settings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.settings || DEFAULT_SETTINGS);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/settings
// @desc    Update user settings
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { emailNotifications, privacy, language } = req.body;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate settings structure
    const settings = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Invalid settings format' });
    }

    // Update settings while preserving structure
    user.settings = {
      ...DEFAULT_SETTINGS,
      ...user.settings,
      ...settings,
      privacy: {
        ...DEFAULT_SETTINGS.privacy,
        ...(user.settings?.privacy || {}),
        ...(settings.privacy || {}),
      },
      data: {
        ...DEFAULT_SETTINGS.data,
        ...(user.settings?.data || {}),
        ...(settings.data || {}),
      },
      emailNotifications: emailNotifications !== undefined ? emailNotifications : user.settings.emailNotifications,
      language: language || user.settings.language
    };

    await user.save();
    res.json(user.settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Reset settings to default
router.post('/reset', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.settings = DEFAULT_SETTINGS;
    await user.save();
    res.json(user.settings);
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile information
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, bio, location } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Update profile fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    await user.save();
    res.json({
      username: user.username,
      email: user.email,
      bio: user.bio,
      location: user.location,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile visibility
router.put('/privacy', auth, async (req, res) => {
  try {
    const { profileVisibility, showEmail, showLocation } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update privacy settings
    if (profileVisibility) {
      user.settings.privacy.profileVisibility = profileVisibility;
    }
    if (showEmail !== undefined) {
      user.settings.privacy.showEmail = showEmail;
    }
    if (showLocation !== undefined) {
      user.settings.privacy.showLocation = showLocation;
    }

    await user.save();
    res.json(user.settings.privacy);
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 