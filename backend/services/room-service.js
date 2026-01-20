// backend/services/room-service.js
const Room = require('../models/room');
const crypto = require('crypto');

class RoomService {
  /**
   * 生成房间ID
   */
  generateRoomId() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * 创建房间
   */
  async createRoom(ownerId, ownerName, ownerAvatar, settings = {}) {
    const roomId = this.generateRoomId();
    
    const room = new Room({
      roomId,
      roomName: settings.roomName || `房间-${roomId}`,
      password: settings.password || '',
      ownerId,
      ownerName,
      settings: {
        maxPlayers: settings.maxPlayers || 6,
        initialChips: settings.initialChips || 1000,
        smallBlind: settings.smallBlind || 10,
        bigBlind: settings.bigBlind || 20,
        minRaiseMultiplier: settings.minRaiseMultiplier || 2
      },
      players: [{
        userId: ownerId,
        nickname: ownerName,
        avatar: ownerAvatar || '',
        position: 0,
        chips: settings.initialChips || 1000,
        isReady: false,
        isConnected: true
      }],
      status: 'waiting'
    });

    await room.save();
    return room;
  }

  /**
   * 根据ID获取房间
   */
  async getRoomById(roomId) {
    return await Room.findOne({ roomId });
  }

  /**
   * 获取房间列表
   */
  async getRoomList(status = 'waiting', limit = 50) {
    return await Room.find({ status })
      .sort({ lastActivityAt: -1 })
      .limit(limit)
      .select('-password')
      .lean();
  }

  /**
   * 获取用户创建的房间
   */
  async getUserRooms(userId) {
    return await Room.find({ ownerId: userId })
      .sort({ lastActivityAt: -1 })
      .lean();
  }

  /**
   * 加入房间
   */
  async joinRoom(roomId, userId, nickname, avatar, password = '') {
    const room = await this.getRoomById(roomId);
    
    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.status !== 'waiting') {
      throw new Error('房间已开始游戏，无法加入');
    }

    if (room.password && room.password !== password) {
      throw new Error('房间密码错误');
    }

    if (room.isFull()) {
      throw new Error('房间已满');
    }

    if (room.hasPlayer(userId)) {
      throw new Error('您已在房间中');
    }

    // 分配位置（找到第一个空位置）
    let position = 0;
    const occupiedPositions = room.players.map(p => p.position).sort((a, b) => a - b);
    for (let i = 0; i < room.settings.maxPlayers; i++) {
      if (!occupiedPositions.includes(i)) {
        position = i;
        break;
      }
    }

    room.players.push({
      userId,
      nickname,
      avatar: avatar || '',
      position,
      chips: room.settings.initialChips,
      isReady: false,
      isConnected: true
    });

    await room.save();
    return room;
  }

  /**
   * 离开房间
   */
  async leaveRoom(roomId, userId) {
    const room = await this.getRoomById(roomId);
    
    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.status === 'playing') {
      // 游戏中进行标记，不立即移除
      const player = room.getPlayer(userId);
      if (player) {
        player.isConnected = false;
      }
    } else {
      // 等待中直接移除
      room.players = room.players.filter(p => p.userId !== userId);
      
      // 如果房主离开且房间为空，删除房间
      if (room.ownerId === userId && room.players.length === 0) {
        await Room.deleteOne({ roomId });
        return null;
      }
      
      // 如果房主离开，转移房主权限给第一个玩家
      if (room.ownerId === userId && room.players.length > 0) {
        room.ownerId = room.players[0].userId;
        room.ownerName = room.players[0].nickname;
      }
    }

    await room.save();
    return room;
  }

  /**
   * 设置玩家准备状态
   */
  async setPlayerReady(roomId, userId, isReady) {
    const room = await this.getRoomById(roomId);
    
    if (!room) {
      throw new Error('房间不存在');
    }

    const player = room.getPlayer(userId);
    if (!player) {
      throw new Error('玩家不在房间中');
    }

    player.isReady = isReady;
    await room.save();
    return room;
  }

  /**
   * 更新房间状态
   */
  async updateRoomStatus(roomId, status) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    room.status = status;
    if (status === 'playing') {
      room.gameState.currentPhase = 'preflop';
    }
    await room.save();
    return room;
  }

  /**
   * 更新游戏状态
   */
  async updateGameState(roomId, gameState) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    room.gameState = { ...room.gameState, ...gameState };
    await room.save();
    return room;
  }

  /**
   * 更新房间设置（仅房主）
   */
  async updateRoomSettings(roomId, userId, settings) {
    const room = await this.getRoomById(roomId);
    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.ownerId !== userId) {
      throw new Error('只有房主可以修改房间设置');
    }

    if (room.status === 'playing') {
      throw new Error('游戏进行中无法修改设置');
    }

    // 更新房间名称
    if (settings.roomName !== undefined) {
      room.roomName = settings.roomName;
    }

    // 更新密码
    if (settings.password !== undefined) {
      room.password = settings.password || '';
    }

    // 更新游戏设置
    if (settings.maxPlayers !== undefined) {
      if (settings.maxPlayers < room.players.length) {
        throw new Error('最大人数不能小于当前玩家数');
      }
      room.settings.maxPlayers = settings.maxPlayers;
    }

    if (settings.initialChips !== undefined) {
      room.settings.initialChips = settings.initialChips;
      // 更新所有玩家的筹码
      room.players.forEach(p => {
        p.chips = settings.initialChips;
      });
    }

    if (settings.smallBlind !== undefined) {
      room.settings.smallBlind = settings.smallBlind;
    }

    if (settings.bigBlind !== undefined) {
      if (settings.bigBlind < room.settings.smallBlind) {
        throw new Error('大盲注不能小于小盲注');
      }
      room.settings.bigBlind = settings.bigBlind;
    }

    if (settings.minRaiseMultiplier !== undefined) {
      room.settings.minRaiseMultiplier = settings.minRaiseMultiplier;
    }

    await room.save();
    return room;
  }

  /**
   * 删除房间
   */
  async deleteRoom(roomId) {
    return await Room.deleteOne({ roomId });
  }

  /**
   * 清理超时房间
   */
  async cleanupInactiveRooms(maxInactiveMinutes = 30) {
    const cutoffTime = new Date(Date.now() - maxInactiveMinutes * 60 * 1000);
    return await Room.deleteMany({
      status: 'waiting',
      lastActivityAt: { $lt: cutoffTime }
    });
  }
}

module.exports = new RoomService();
