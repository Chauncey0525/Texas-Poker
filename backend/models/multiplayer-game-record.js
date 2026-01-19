// backend/models/multiplayer-game-record.js
const mongoose = require('mongoose');

const multiplayerGameRecordSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  roomName: String,
  handNumber: {
    type: Number,
    default: 1
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  players: [{
    userId: String,
    nickname: String,
    avatar: String,
    position: Number,
    initialChips: Number,
    finalChips: Number,
    profit: Number,
    hand: [{
      suit: String,
      rank: String,
      value: Number
    }],
    handRank: String,
    isWinner: Boolean
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
    playerId: String,
    action: {
      type: String,
      enum: ['bet', 'call', 'check', 'fold', 'raise', 'allin']
    },
    amount: Number,
    phase: String,
    timestamp: Date,
    pot: Number,
    currentBet: Number
  }],
  finalResult: {
    winners: [{
      userId: String,
      nickname: String,
      handRank: String,
      share: Number
    }],
    pot: Number,
    message: String
  },
  gameSettings: {
    smallBlind: Number,
    bigBlind: Number,
    initialChips: Number
  }
});

// 索引
multiplayerGameRecordSchema.index({ roomId: 1, handNumber: 1 });
multiplayerGameRecordSchema.index({ 'players.userId': 1 });
multiplayerGameRecordSchema.index({ timestamp: -1 });

module.exports = mongoose.model('MultiplayerGameRecord', multiplayerGameRecordSchema);
