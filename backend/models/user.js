// backend/models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  openId: {
    type: String,
    required: true,
    unique: true
  },
  nickname: {
    type: String,
    default: '用户'
  },
  avatar: {
    type: String,
    default: ''
  },
  stats: {
    totalGames: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    commonMistakes: [{
      type: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
