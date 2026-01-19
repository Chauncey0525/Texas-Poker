// backend/services/game-state-service.js
const Room = require('../models/room');
const MultiplayerGameRecord = require('../models/multiplayer-game-record');

class GameStateService {
  /**
   * 初始化游戏
   */
  async initializeGame(roomId) {
    const room = await Room.findOne({ roomId });
    if (!room || room.status !== 'waiting') {
      throw new Error('房间状态不正确');
    }

    if (!room.allPlayersReady()) {
      throw new Error('不是所有玩家都已准备');
    }

    // 初始化游戏状态
    const playerCount = room.players.length;
    const dealerIndex = Math.floor(Math.random() * playerCount);
    const smallBlindIndex = (dealerIndex + 1) % playerCount;
    const bigBlindIndex = (dealerIndex + 2) % playerCount;
    const firstPlayerIndex = (dealerIndex + 3) % playerCount;

    room.status = 'playing';
    room.gameState = {
      currentPhase: 'preflop',
      currentPlayerIndex: firstPlayerIndex,
      dealerIndex,
      smallBlindIndex,
      bigBlindIndex,
      pot: room.settings.smallBlind + room.settings.bigBlind,
      communityCards: [],
      currentBet: room.settings.bigBlind,
      roundActions: [],
      handNumber: 1
    };

    // 扣除盲注
    room.players[smallBlindIndex].chips -= room.settings.smallBlind;
    room.players[bigBlindIndex].chips -= room.settings.bigBlind;

    // 添加盲注动作
    room.gameState.roundActions.push(
      {
        playerIndex: smallBlindIndex,
        action: 'bet',
        amount: room.settings.smallBlind,
        timestamp: new Date()
      },
      {
        playerIndex: bigBlindIndex,
        action: 'bet',
        amount: room.settings.bigBlind,
        timestamp: new Date()
      }
    );

    await room.save();
    return room;
  }

  /**
   * 处理玩家动作
   */
  async processPlayerAction(roomId, userId, action, amount = 0) {
    const room = await Room.findOne({ roomId });
    if (!room || room.status !== 'playing') {
      throw new Error('房间状态不正确');
    }

    const playerIndex = room.players.findIndex(p => p.userId === userId);
    if (playerIndex === -1) {
      throw new Error('玩家不在房间中');
    }

    if (room.gameState.currentPlayerIndex !== playerIndex) {
      throw new Error('不是您的回合');
    }

    const player = room.players[playerIndex];
    const gameState = room.gameState;

    // 处理不同动作
    switch (action) {
      case 'fold':
        player.isReady = false; // 标记为已弃牌
        break;

      case 'check':
        if (gameState.currentBet > 0) {
          throw new Error('当前有下注，不能过牌');
        }
        break;

      case 'call':
        const callAmount = Math.min(gameState.currentBet, player.chips);
        player.chips -= callAmount;
        gameState.pot += callAmount;
        break;

      case 'bet':
      case 'raise':
        if (amount <= gameState.currentBet) {
          throw new Error('下注金额必须大于当前下注');
        }
        if (amount > player.chips) {
          throw new Error('筹码不足');
        }
        const betAmount = Math.min(amount, player.chips);
        player.chips -= betAmount;
        gameState.pot += betAmount;
        gameState.currentBet = betAmount;
        break;

      case 'allin':
        const allinAmount = player.chips;
        player.chips = 0;
        gameState.pot += allinAmount;
        if (allinAmount > gameState.currentBet) {
          gameState.currentBet = allinAmount;
        }
        break;
    }

    // 记录动作
    gameState.roundActions.push({
      playerIndex,
      action,
      amount: action === 'fold' || action === 'check' ? 0 : (action === 'allin' ? player.chips + amount : amount),
      timestamp: new Date()
    });

    // 移动到下一个玩家
    await this.moveToNextPlayer(room);

    await room.save();
    return room;
  }

  /**
   * 移动到下一个玩家
   */
  async moveToNextPlayer(room) {
    const activePlayers = room.players.filter((p, idx) => {
      if (p.chips === 0) return false; // 已全下
      if (p.isReady === false && room.gameState.roundActions.some(a => 
        a.playerIndex === idx && a.action === 'fold'
      )) return false; // 已弃牌
      return true;
    });

    if (activePlayers.length <= 1) {
      // 进入下一阶段或结束
      await this.advanceGamePhase(room);
      return;
    }

    // 找到下一个活跃玩家
    let nextIndex = (room.gameState.currentPlayerIndex + 1) % room.players.length;
    while (true) {
      const player = room.players[nextIndex];
      if (player.chips > 0 && !room.gameState.roundActions.some(a => 
        a.playerIndex === nextIndex && a.action === 'fold'
      )) {
        // 检查是否所有人都跟注
        const allCalled = this.checkAllPlayersCalled(room);
        if (allCalled) {
          await this.advanceGamePhase(room);
          return;
        }
        room.gameState.currentPlayerIndex = nextIndex;
        break;
      }
      nextIndex = (nextIndex + 1) % room.players.length;
      if (nextIndex === room.gameState.currentPlayerIndex) {
        // 回到起始玩家，说明所有人都跟注了
        await this.advanceGamePhase(room);
        return;
      }
    }
  }

  /**
   * 检查所有玩家是否都已跟注
   */
  checkAllPlayersCalled(room) {
    const activePlayers = room.players.filter((p, idx) => {
      if (p.chips === 0) return true; // 全下视为已跟注
      if (room.gameState.roundActions.some(a => 
        a.playerIndex === idx && a.action === 'fold'
      )) return false;
      return true;
    });

    if (activePlayers.length <= 1) return true;

    // 检查每个活跃玩家的最后动作
    for (const player of activePlayers) {
      const playerIndex = room.players.findIndex(p => p.userId === player.userId);
      const lastAction = [...room.gameState.roundActions]
        .reverse()
        .find(a => a.playerIndex === playerIndex);
      
      if (!lastAction) return false;
      if (lastAction.action === 'fold') return false;
      
      // 检查是否跟注到当前下注
      const playerTotalBet = room.gameState.roundActions
        .filter(a => a.playerIndex === playerIndex)
        .reduce((sum, a) => sum + (a.amount || 0), 0);
      
      if (player.chips > 0 && playerTotalBet < room.gameState.currentBet) {
        return false;
      }
    }

    return true;
  }

  /**
   * 进入下一游戏阶段
   */
  async advanceGamePhase(room) {
    const phases = ['preflop', 'flop', 'turn', 'river', 'ended'];
    const currentPhaseIndex = phases.indexOf(room.gameState.currentPhase);
    
    if (currentPhaseIndex === -1 || currentPhaseIndex === phases.length - 1) {
      // 游戏结束
      await this.endGame(room);
      return;
    }

    // 重置当前下注和动作记录
    room.gameState.currentBet = 0;
    room.gameState.roundActions = [];
    room.gameState.currentPhase = phases[currentPhaseIndex + 1];

    // 如果是翻牌后阶段，发公共牌
    if (room.gameState.currentPhase === 'flop') {
      // 这里应该调用发牌逻辑，暂时留空
      // room.gameState.communityCards = dealCommunityCards(3);
    } else if (room.gameState.currentPhase === 'turn') {
      // room.gameState.communityCards.push(...dealCommunityCards(1));
    } else if (room.gameState.currentPhase === 'river') {
      // room.gameState.communityCards.push(...dealCommunityCards(1));
    }

    // 设置下一个行动的玩家（小盲注位置的下一个）
    const activePlayers = room.players.filter((p, idx) => {
      if (p.chips === 0) return true;
      return !room.gameState.roundActions.some(a => 
        a.playerIndex === idx && a.action === 'fold'
      );
    });

    if (activePlayers.length > 1) {
      room.gameState.currentPlayerIndex = room.gameState.smallBlindIndex;
      await this.moveToNextPlayer(room);
    } else {
      await this.endGame(room);
    }

    await room.save();
  }

  /**
   * 结束游戏
   */
  async endGame(room) {
    room.gameState.currentPhase = 'ended';
    room.status = 'waiting';
    
    // 重置玩家准备状态
    room.players.forEach(p => {
      p.isReady = false;
    });

    // 保存游戏记录
    await this.saveGameRecord(room);

    // 重置游戏状态
    room.gameState = {
      currentPhase: 'waiting',
      currentPlayerIndex: null,
      dealerIndex: null,
      smallBlindIndex: null,
      bigBlindIndex: null,
      pot: 0,
      communityCards: [],
      currentBet: 0,
      roundActions: [],
      handNumber: room.gameState.handNumber + 1
    };

    await room.save();
  }

  /**
   * 保存游戏记录
   */
  async saveGameRecord(room) {
    const record = new MultiplayerGameRecord({
      roomId: room.roomId,
      roomName: room.roomName,
      handNumber: room.gameState.handNumber,
      players: room.players.map(p => ({
        userId: p.userId,
        nickname: p.nickname,
        avatar: p.avatar,
        position: p.position,
        initialChips: room.settings.initialChips,
        finalChips: p.chips,
        profit: p.chips - room.settings.initialChips
      })),
      gamePhase: room.gameState.currentPhase,
      communityCards: room.gameState.communityCards,
      actions: room.gameState.roundActions,
      gameSettings: {
        smallBlind: room.settings.smallBlind,
        bigBlind: room.settings.bigBlind,
        initialChips: room.settings.initialChips
      }
    });

    await record.save();
    return record;
  }
}

module.exports = new GameStateService();
