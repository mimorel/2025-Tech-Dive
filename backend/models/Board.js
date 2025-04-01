const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pin',
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public',
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  category: {
    type: String,
    trim: true,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
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
boardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
boardSchema.index({ user: 1, createdAt: -1 });
boardSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Board', boardSchema); 