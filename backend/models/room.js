// backend/models/room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  roomName: {
    type: String,
    required: true,
    default: '未命名房间'
  },
  password: {
    type: String,
    default: ''
  },
  ownerId: {
    type: String,
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'ended'],
    default: 'waiting'
  },
  settings: {
    maxPlayers: {
      type: Number,
      default: 6,
      min: 2,
      max: 10
    },
    initialChips: {
      type: Number,
      default: 1000
    },
    smallBlind: {
      type: Number,
      default: 10
    },
    bigBlind: {
      type: Number,
      default: 20
    },
    minRaiseMultiplier: {
      type: Number,
      default: 2
    }
  },
  players: [{
    userId: String,
    nickname: String,
    avatar: String,
    position: Number, // 座位位置 0-9
    chips: Number,
    isReady: {
      type: Boolean,
      default: false
    },
    isConnected: {
      type: Boolean,
      default: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  gameState: {
    currentPhase: {
      type: String,
      enum: ['waiting', 'preflop', 'flop', 'turn', 'river', 'ended'],
      default: 'waiting'
    },
    currentPlayerIndex: Number,
    dealerIndex: Number,
    smallBlindIndex: Number,
    bigBlindIndex: Number,
    pot: Number,
    communityCards: [{
      suit: String,
      rank: String,
      value: Number
    }],
    currentBet: Number,
    roundActions: [{
      playerIndex: Number,
      action: {
        type: String,
        enum: ['bet', 'call', 'check', 'fold', 'raise', 'allin']
      },
      amount: Number,
      timestamp: Date
    }],
    handNumber: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
roomSchema.index({ roomId: 1 });
roomSchema.index({ status: 1 });
roomSchema.index({ ownerId: 1 });
roomSchema.index({ lastActivityAt: 1 });

// 更新时自动更新 updatedAt 和 lastActivityAt
roomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastActivityAt = Date.now();
  next();
});

// 方法：检查房间是否已满
roomSchema.methods.isFull = function() {
  return this.players.length >= this.settings.maxPlayers;
};

// 方法：检查玩家是否在房间中
roomSchema.methods.hasPlayer = function(userId) {
  return this.players.some(p => p.userId === userId);
};

// 方法：获取玩家信息
roomSchema.methods.getPlayer = function(userId) {
  return this.players.find(p => p.userId === userId);
};

// 方法：检查所有玩家是否准备
roomSchema.methods.allPlayersReady = function() {
  if (this.players.length < 2) return false;
  return this.players.every(p => p.isReady);
};

module.exports = mongoose.model('Room', roomSchema);
