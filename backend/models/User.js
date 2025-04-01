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
    minlength: 3,
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
    minlength: 6,
  },
  fullName: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  avatar: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  settings: {
    type: settingsSchema,
    default: () => ({}),
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema); 