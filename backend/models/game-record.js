// backend/models/game-record.js
const mongoose = require('mongoose');

const gameRecordSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  players: [{
    id: Number,
    name: String,
    isHuman: Boolean,
    chips: Number
  }],
  gamePhase: {
    type: String,
    enum: ['preflop', 'flop', 'turn', 'river', 'ended']
  },
  communityCards: [{
    suit: String,
    rank: String,
    value: Number
  }],
  actions: [{
    playerIndex: Number,
    action: {
      type: String,
      enum: ['bet', 'call', 'check', 'fold', 'allin']
    },
    amount: Number,
    phase: String,
    timestamp: Date,
    gtoAdvice: {
      recommendedAction: String,
      ev: String,
      frequencies: {
        fold: Number,
        call: Number,
        raise: Number
      }
    }
  }],
  finalResult: {
    winner: String,
    winners: [String],
    message: String
  },
  gtoAnalysis: {
    totalDecisions: Number,
    correctDecisions: Number,
    accuracy: Number,
    mistakes: [{
      phase: String,
      action: String,
      gtoAdvice: Object
    }]
  }
});

module.exports = mongoose.model('GameRecord', gameRecordSchema);
