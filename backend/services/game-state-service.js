// backend/services/game-state-service.js
const Room = require('../models/room');
const MultiplayerGameRecord = require('../models/multiplayer-game-record');

// 卡牌工具函数
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function getCardValue(rank) {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank);
}

function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank, value: getCardValue(rank) });
    }
  }
  return shuffleDeck(deck);
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

    // 创建并洗牌
    const deck = createDeck();
    
    // 发手牌给每个玩家（每人2张）
    room.players.forEach((player, index) => {
      player.cards = [
        deck.pop(),
        deck.pop()
      ];
    });

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
      handNumber: 1,
      deck: deck // 保存剩余的牌堆
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
   * 验证玩家动作合法性
   */
  validatePlayerAction(room, playerIndex, action, amount) {
    const player = room.players[playerIndex];
    const gameState = room.gameState;

    // 1. 验证房间状态
    if (room.status !== 'playing') {
      throw new Error('房间不在游戏中');
    }

    // 2. 验证游戏阶段
    if (gameState.currentPhase === 'waiting' || gameState.currentPhase === 'ended') {
      throw new Error('游戏未开始或已结束');
    }

    // 3. 验证是否是当前玩家
    if (gameState.currentPlayerIndex !== playerIndex) {
      throw new Error('不是您的回合');
    }

    // 4. 验证玩家状态
    if (player.chips === 0 && action !== 'fold') {
      throw new Error('您已全押，无法进行其他操作');
    }

    // 检查玩家是否已弃牌
    const hasFolded = gameState.roundActions.some(a => 
      a.playerIndex === playerIndex && a.action === 'fold'
    );
    if (hasFolded) {
      throw new Error('您已弃牌，无法进行操作');
    }

    // 5. 验证动作合法性
    switch (action) {
      case 'check':
        if (gameState.currentBet > 0) {
          throw new Error('当前有下注，不能过牌');
        }
        break;

      case 'call':
        if (gameState.currentBet === 0) {
          throw new Error('当前无下注，不能跟注');
        }
        if (player.chips < gameState.currentBet) {
          // 允许全押跟注
          if (player.chips === 0) {
            throw new Error('筹码不足');
          }
        }
        break;

      case 'bet':
        if (gameState.currentBet > 0) {
          throw new Error('当前已有下注，请使用加注');
        }
        if (amount < gameState.bigBlind || amount < room.settings.bigBlind) {
          throw new Error(`下注金额不能小于大盲注(${room.settings.bigBlind})`);
        }
        if (amount > player.chips) {
          throw new Error('筹码不足');
        }
        break;

      case 'raise':
        if (gameState.currentBet === 0) {
          throw new Error('当前无下注，请使用下注');
        }
        const minRaise = gameState.currentBet * 2;
        if (amount < minRaise) {
          throw new Error(`加注金额必须至少为当前下注的2倍(${minRaise})`);
        }
        if (amount > player.chips) {
          throw new Error('筹码不足');
        }
        break;

      case 'allin':
        if (player.chips === 0) {
          throw new Error('您已全押');
        }
        break;

      case 'fold':
        // 弃牌总是合法的
        break;

      default:
        throw new Error(`未知动作: ${action}`);
    }

    // 6. 验证金额合理性
    if (amount < 0) {
      throw new Error('金额不能为负数');
    }

    // 7. 验证时间戳（防止重放攻击）
    const lastAction = gameState.roundActions[gameState.roundActions.length - 1];
    if (lastAction && lastAction.playerIndex === playerIndex) {
      const timeDiff = Date.now() - new Date(lastAction.timestamp).getTime();
      if (timeDiff < 100) { // 100ms内重复操作视为异常
        throw new Error('操作过于频繁，请稍后再试');
      }
    }

    return true;
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

    // 验证动作合法性
    this.validatePlayerAction(room, playerIndex, action, amount);

    const player = room.players[playerIndex];
    const gameState = room.gameState;

    // 处理不同动作（已验证合法性）
    let actualAmount = 0;
    switch (action) {
      case 'fold':
        player.isReady = false; // 标记为已弃牌
        actualAmount = 0;
        break;

      case 'check':
        actualAmount = 0;
        break;

      case 'call':
        actualAmount = Math.min(gameState.currentBet, player.chips);
        player.chips -= actualAmount;
        gameState.pot += actualAmount;
        break;

      case 'bet':
      case 'raise':
        actualAmount = Math.min(amount, player.chips);
        player.chips -= actualAmount;
        gameState.pot += actualAmount;
        gameState.currentBet = actualAmount;
        break;

      case 'allin':
        actualAmount = player.chips;
        player.chips = 0;
        gameState.pot += actualAmount;
        if (actualAmount > gameState.currentBet) {
          gameState.currentBet = actualAmount;
        }
        break;
    }

    // 验证筹码总数一致性（防止作弊）
    const totalChips = room.players.reduce((sum, p) => sum + p.chips, 0) + gameState.pot;
    const expectedTotal = room.players.length * room.settings.initialChips;
    if (Math.abs(totalChips - expectedTotal) > 0.01) { // 允许浮点数误差
      console.error(`筹码总数不一致! 期望: ${expectedTotal}, 实际: ${totalChips}`);
      // 可以选择修复或抛出错误
      // throw new Error('游戏状态异常，已记录');
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
    const deck = room.gameState.deck || [];
    if (room.gameState.currentPhase === 'flop') {
      // 发3张翻牌
      room.gameState.communityCards = [
        deck.pop(),
        deck.pop(),
        deck.pop()
      ];
      room.gameState.deck = deck;
    } else if (room.gameState.currentPhase === 'turn') {
      // 发1张转牌
      room.gameState.communityCards.push(deck.pop());
      room.gameState.deck = deck;
    } else if (room.gameState.currentPhase === 'river') {
      // 发1张河牌
      room.gameState.communityCards.push(deck.pop());
      room.gameState.deck = deck;
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
   * 创建游戏状态快照（用于断线重连）
   */
  createGameSnapshot(room) {
    if (!room.gameState || room.gameState.currentPhase === 'waiting') {
      return null;
    }

    return {
      roomId: room.roomId,
      handNumber: room.gameState.handNumber,
      currentPhase: room.gameState.currentPhase,
      currentPlayerIndex: room.gameState.currentPlayerIndex,
      dealerIndex: room.gameState.dealerIndex,
      smallBlindIndex: room.gameState.smallBlindIndex,
      bigBlindIndex: room.gameState.bigBlindIndex,
      pot: room.gameState.pot,
      currentBet: room.gameState.currentBet,
      communityCards: room.gameState.communityCards || [],
      players: room.players.map((p, idx) => ({
        userId: p.userId,
        nickname: p.nickname,
        avatar: p.avatar,
        position: idx,
        chips: p.chips,
        isReady: p.isReady,
        cards: p.cards || [], // 包含手牌信息
        hasCards: room.gameState.currentPhase !== 'waiting'
      })),
      roundActions: room.gameState.roundActions || [],
      timestamp: new Date()
    };
  }

  /**
   * 恢复游戏状态（从快照）
   */
  async restoreGameFromSnapshot(roomId, snapshot) {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('房间不存在');
    }

    if (room.status !== 'playing') {
      throw new Error('房间不在游戏中');
    }

    // 验证快照有效性
    if (snapshot.roomId !== roomId) {
      throw new Error('快照房间ID不匹配');
    }

    // 恢复游戏状态
    room.gameState = {
      handNumber: snapshot.handNumber,
      currentPhase: snapshot.currentPhase,
      currentPlayerIndex: snapshot.currentPlayerIndex,
      dealerIndex: snapshot.dealerIndex,
      smallBlindIndex: snapshot.smallBlindIndex,
      bigBlindIndex: snapshot.bigBlindIndex,
      pot: snapshot.pot,
      currentBet: snapshot.currentBet,
      communityCards: snapshot.communityCards,
      roundActions: snapshot.roundActions
    };

    await room.save();
    return room;
  }

  /**
   * 获取游戏状态快照
   */
  async getGameSnapshot(roomId) {
    const room = await Room.findOne({ roomId });
    if (!room) {
      throw new Error('房间不存在');
    }

    return this.createGameSnapshot(room);
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
