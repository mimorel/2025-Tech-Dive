const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  darkMode: {
    type: Boolean,
    default: false,
  },
  gridSize: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  notifications: {
    type: Boolean,
    default: true,
  },
  emailNotifications: {
    type: Boolean,
    default: true,
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showLocation: {
      type: Boolean,
      default: false,
    },
  },
  data: {
    autoSave: {
      type: Boolean,
      default: true,
    },
    saveToGallery: {
      type: Boolean,
      default: true,
    },
    cacheSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    type: String,
  },
  website: {
    type: String,
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema); 