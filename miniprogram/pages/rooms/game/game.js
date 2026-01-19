// pages/rooms/game/game.js
const socket = require('../../utils/socket.js');
const storage = require('../../utils/storage.js');
const gameLogic = require('../../utils/game-logic.js');

Page({
  data: {
    roomId: '',
    room: null,
    userInfo: null,
    gameState: null,
    myPlayerIndex: -1,
    isMyTurn: false,
    showGTOAdvice: false,
    gtoAdvice: null,
    chatMessages: [],
    chatInput: '',
    actionTimer: null,
    timeLeft: 0,
    showBetInput: false,
    showRaiseInput: false
  },

  onLoad(options) {
    const roomId = options.roomId;
    if (!roomId) {
      wx.showToast({
        title: '房间ID无效',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    this.setData({ roomId });
    this.loadUserInfo();
    this.initSocket();
  },

  onUnload() {
    // 清理定时器
    if (this.data.actionTimer) {
      clearInterval(this.data.actionTimer);
    }
    // 断开WebSocket连接
    socket.disconnect();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      this.setData({
        userInfo: {
          userId: 'user_' + Date.now(),
          nickname: '玩家',
          avatar: ''
        }
      });
    }
  },

  // 初始化 WebSocket
  async initSocket() {
    const userInfo = this.data.userInfo;
    
    try {
      await socket.connect(userInfo.userId, userInfo.nickname);
      
      // 监听游戏状态更新
      socket.on('game:state:updated', (data) => {
        this.handleGameStateUpdate(data.room);
      });

      // 监听游戏开始
      socket.on('game:started', (data) => {
        this.handleGameStarted(data.room);
      });

      // 监听聊天消息
      socket.on('room:chat:message', (data) => {
        const messages = [...this.data.chatMessages, data];
        this.setData({ chatMessages: messages });
      });

      // 监听错误
      socket.on('error', (data) => {
        wx.showToast({
          title: data.message || '发生错误',
          icon: 'none'
        });
      });

      // 加载房间信息
      await this.loadRoomInfo();
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      wx.showToast({
        title: '连接失败',
        icon: 'none'
      });
    }
  },

  // 加载房间信息
  async loadRoomInfo() {
    // 房间信息会通过socket事件更新
    // 如果游戏已经开始，等待game:started事件
  },

  // 处理游戏开始
  handleGameStarted(room) {
    if (room.status === 'playing' && room.gameState) {
      this.updateGameState(room);
    }
  },

  // 处理游戏状态更新
  handleGameStateUpdate(room) {
    this.setData({ room });
    if (room.gameState) {
      this.updateGameState(room);
    }
  },

  // 更新游戏状态
  updateGameState(room) {
    const gameState = room.gameState;
    const userInfo = this.data.userInfo;
    
    // 找到当前玩家在游戏中的索引
    let myPlayerIndex = -1;
    room.players.forEach((player, index) => {
      if (player.userId === userInfo.userId) {
        myPlayerIndex = index;
      }
    });

    // 检查是否是当前玩家的回合
    const isMyTurn = gameState.currentPlayerIndex === myPlayerIndex &&
                     gameState.currentPhase !== 'waiting' &&
                     gameState.currentPhase !== 'ended';

    this.setData({
      gameState: {
        ...gameState,
        players: room.players.map((p, idx) => ({
          id: idx,
          name: p.nickname,
          isHuman: p.userId === userInfo.userId,
          chips: p.chips,
          currentBet: this.getPlayerCurrentBet(gameState, idx),
          folded: this.isPlayerFolded(gameState, idx),
          allIn: p.chips === 0 && gameState.currentPhase !== 'waiting',
          cards: this.getPlayerCards(gameState, idx, myPlayerIndex)
        })),
        pot: gameState.pot || 0,
        currentBet: gameState.currentBet || 0,
        gamePhase: gameState.currentPhase,
        communityCards: gameState.communityCards || []
      },
      myPlayerIndex,
      isMyTurn
    });

    // 如果是我的回合，启动倒计时
    if (isMyTurn) {
      this.startActionTimer();
    } else {
      this.stopActionTimer();
    }

    // 检查游戏是否结束
    if (gameState.currentPhase === 'ended') {
      this.handleGameEnd(room);
    }
  },

  // 获取玩家当前下注
  getPlayerCurrentBet(gameState, playerIndex) {
    if (!gameState.roundActions) return 0;
    return gameState.roundActions
      .filter(a => a.playerIndex === playerIndex)
      .reduce((sum, a) => sum + (a.amount || 0), 0);
  },

  // 检查玩家是否已弃牌
  isPlayerFolded(gameState, playerIndex) {
    if (!gameState.roundActions) return false;
    return gameState.roundActions.some(a => 
      a.playerIndex === playerIndex && a.action === 'fold'
    );
  },

  // 获取玩家手牌（只有自己的牌或游戏结束时显示）
  getPlayerCards(gameState, playerIndex, myPlayerIndex) {
    // 暂时返回空数组，实际应该从游戏状态中获取
    // 只有自己的牌或游戏结束时才显示
    if (playerIndex === myPlayerIndex || gameState.currentPhase === 'ended') {
      // 这里需要从服务器获取手牌信息
      return [];
    }
    return [];
  },

  // 启动操作倒计时
  startActionTimer() {
    this.stopActionTimer();
    let timeLeft = 30; // 30秒倒计时
    this.setData({ timeLeft });

    this.data.actionTimer = setInterval(() => {
      timeLeft--;
      this.setData({ timeLeft });
      if (timeLeft <= 0) {
        this.stopActionTimer();
        // 超时自动弃牌
        this.onFold();
      }
    }, 1000);
  },

  // 停止操作倒计时
  stopActionTimer() {
    if (this.data.actionTimer) {
      clearInterval(this.data.actionTimer);
      this.data.actionTimer = null;
    }
    this.setData({ timeLeft: 0 });
  },

  // 发送游戏动作
  sendGameAction(action, amount = 0) {
    if (!this.data.isMyTurn) {
      wx.showToast({
        title: '不是您的回合',
        icon: 'none'
      });
      return;
    }

    socket.sendGameAction(this.data.roomId, action, amount);
    this.stopActionTimer();
  },

  // 跟注
  onCall() {
    this.sendGameAction('call');
  },

  // 过牌
  onCheck() {
    this.sendGameAction('check');
  },

  // 弃牌
  onFold() {
    wx.showModal({
      title: '确认弃牌',
      content: '确定要弃牌吗？',
      success: (res) => {
        if (res.confirm) {
          this.sendGameAction('fold');
        }
      }
    });
  },

  // 显示下注输入
  showBetInput() {
    this.setData({ showBetInput: true, showRaiseInput: false });
  },

  // 显示加注输入
  showRaiseInput() {
    this.setData({ showRaiseInput: true, showBetInput: false });
  },

  // 下注
  onBet(e) {
    const amount = e.detail.amount;
    if (amount > 0) {
      this.sendGameAction('bet', amount);
      this.setData({ showBetInput: false });
    }
  },

  // 加注
  onRaise(e) {
    const amount = e.detail.amount;
    if (amount > this.data.gameState.currentBet) {
      this.sendGameAction('raise', amount);
      this.setData({ showRaiseInput: false });
    }
  },

  // 全押
  onAllIn() {
    const myPlayer = this.data.gameState.players[this.data.myPlayerIndex];
    if (myPlayer && myPlayer.chips > 0) {
      wx.showModal({
        title: '确认全押',
        content: `确定要全押 ${myPlayer.chips} 筹码吗？`,
        success: (res) => {
          if (res.confirm) {
            this.sendGameAction('allin', myPlayer.chips);
          }
        }
      });
    }
  },

  // 获取GTO建议
  async getGTOAdvice() {
    // 这里可以调用GTO API获取建议
    wx.showToast({
      title: 'GTO建议功能开发中',
      icon: 'none'
    });
  },

  // 处理游戏结束
  handleGameEnd(room) {
    this.stopActionTimer();
    
    wx.showModal({
      title: '游戏结束',
      content: '本局游戏已结束',
      showCancel: false,
      success: () => {
        // 返回房间详情页
        wx.navigateBack();
      }
    });
  },

  // 输入聊天消息
  onChatInput(e) {
    this.setData({
      chatInput: e.detail.value
    });
  },

  // 发送聊天消息
  onSendChat() {
    const message = this.data.chatInput.trim();
    if (!message) return;

    socket.sendChatMessage(this.data.roomId, message, this.data.userInfo.nickname);
    this.setData({ chatInput: '' });
  },

  // 离开游戏
  onLeaveGame() {
    wx.showModal({
      title: '确认离开',
      content: '确定要离开游戏吗？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      }
    });
  }
});
