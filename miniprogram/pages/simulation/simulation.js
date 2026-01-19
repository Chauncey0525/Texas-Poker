// pages/simulation/simulation.js
const gameLogic = require('../../utils/game-logic.js');
const gtoApi = require('../../utils/gto-api.js');

Page({
  data: {
    gameState: null,
    showGTOAdvice: false,
    gtoAdvice: null,
    isLoading: false,
    gameSettings: {
      playerCount: 2,
      initialChips: 1000,
      smallBlind: 10,
      bigBlind: 20
    },
    chipDepth: 0
  },

  onLoad(options) {
    // 加载游戏设置
    const savedSettings = wx.getStorageSync('gameSettings');
    if (savedSettings) {
      const settings = { ...this.data.gameSettings, ...savedSettings };
      this.setData({
        gameSettings: settings,
        chipDepth: Math.floor(settings.initialChips / settings.bigBlind)
      });
    } else {
      this.updateChipDepth();
    }
  },

  // 更新筹码深度
  updateChipDepth() {
    const depth = Math.floor(this.data.gameSettings.initialChips / this.data.gameSettings.bigBlind);
    this.setData({
      chipDepth: depth
    });
  },

  // 开始新游戏
  startNewGame() {
    this.setData({ isLoading: true });
    
    const gameState = gameLogic.initGame(
      this.data.gameSettings.playerCount,
      this.data.gameSettings
    );
    
    this.setData({
      gameState: gameState,
      isLoading: false
    });
    
    // 如果是AI回合，自动处理
    this.checkAITurn();
  },

  // 检查是否需要AI行动
  checkAITurn() {
    const gameState = this.data.gameState;
    if (!gameState) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    if (!currentPlayer.isHuman && !currentPlayer.folded) {
      setTimeout(() => {
        this.processAITurn();
      }, 1000);
    }
  },

  // 处理AI回合
  processAITurn() {
    const gameState = this.data.gameState;
    const action = gameLogic.getAIAction(gameState);
    this.handlePlayerAction(action);
  },

  // 处理玩家操作
  handlePlayerAction(action) {
    const newGameState = gameLogic.processAction(this.data.gameState, action);
    
    this.setData({
      gameState: newGameState
    });
    
    // 检查游戏是否结束
    if (newGameState.gamePhase === 'ended') {
      this.endGame(newGameState);
    } else {
      // 继续下一回合
      this.checkAITurn();
    }
  },

  // 获取GTO建议
  async getGTOAdvice() {
    const gameState = this.data.gameState;
    if (!gameState) return;
    
    this.setData({ isLoading: true, showGTOAdvice: true });
    
    try {
      const advice = await gtoApi.getAdvice(gameState);
      this.setData({
        gtoAdvice: advice,
        isLoading: false
      });
    } catch (error) {
      console.error('获取GTO建议失败', error);
      wx.showToast({
        title: '获取建议失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  // 关闭GTO建议
  closeGTOAdvice() {
    this.setData({
      showGTOAdvice: false,
      gtoAdvice: null
    });
  },

  // 设置玩家数量
  onPlayerCountChange(e) {
    const count = parseInt(e.detail.value) + 2;
    const settings = { ...this.data.gameSettings, playerCount: count };
    this.setData({
      gameSettings: settings
    });
    wx.setStorageSync('gameSettings', settings);
  },

  // 设置初始筹码
  onChipsChange(e) {
    const chips = Math.max(100, parseInt(e.detail.value) || 1000);
    const settings = { ...this.data.gameSettings, initialChips: chips };
    this.setData({
      gameSettings: settings
    });
    this.updateChipDepth();
    wx.setStorageSync('gameSettings', settings);
  },

  // 设置小盲注
  onSmallBlindChange(e) {
    const blind = Math.max(1, parseInt(e.detail.value) || 10);
    const settings = { ...this.data.gameSettings, smallBlind: blind };
    // 自动调整大盲注为小盲注的2倍
    if (settings.bigBlind < blind * 2) {
      settings.bigBlind = blind * 2;
    }
    this.setData({
      gameSettings: settings
    });
    this.updateChipDepth();
    wx.setStorageSync('gameSettings', settings);
  },

  // 设置大盲注
  onBigBlindChange(e) {
    const blind = Math.max(this.data.gameSettings.smallBlind * 2, parseInt(e.detail.value) || 20);
    const settings = { ...this.data.gameSettings, bigBlind: blind };
    this.setData({
      gameSettings: settings
    });
    this.updateChipDepth();
    wx.setStorageSync('gameSettings', settings);
  },

  // 使用预设配置
  usePreset(e) {
    const preset = e.currentTarget.dataset.preset;
    let settings = { ...this.data.gameSettings };
    
    switch (preset) {
      case 'quick':
        settings = {
          playerCount: 2,
          initialChips: 500,
          smallBlind: 5,
          bigBlind: 10
        };
        break;
      case 'standard':
        settings = {
          playerCount: 6,
          initialChips: 1000,
          smallBlind: 10,
          bigBlind: 20
        };
        break;
      case 'tournament':
        settings = {
          playerCount: 9,
          initialChips: 2000,
          smallBlind: 25,
          bigBlind: 50
        };
        break;
    }
    
    this.setData({
      gameSettings: settings,
      chipDepth: Math.floor(settings.initialChips / settings.bigBlind)
    });
    wx.setStorageSync('gameSettings', settings);
  },

  // 显示下注输入
  showBetInput() {
    // 通过组件显示，这里不需要额外操作
    // 组件会通过事件触发
  },

  // 确认下注
  onBetConfirm(e) {
    const amount = e.detail.amount;
    if (amount > 0) {
      this.handlePlayerAction({
        type: 'bet',
        amount: amount
      });
    }
  },

  // 跟注
  onCall() {
    this.handlePlayerAction({
      type: 'call'
    });
  },

  // 过牌
  onCheck() {
    this.handlePlayerAction({
      type: 'check'
    });
  },

  // 弃牌
  onFold() {
    this.handlePlayerAction({
      type: 'fold'
    });
  },

  // 全押
  onAllIn() {
    this.handlePlayerAction({
      type: 'allin'
    });
  },

  // 结束游戏
  endGame(gameState) {
    // 保存游戏记录
    const gameRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      gameState: gameState,
      finalResult: gameState.finalResult
    };
    
    let history = wx.getStorageSync('gameHistory') || [];
    history.unshift(gameRecord);
    // 最多保存100条记录
    if (history.length > 100) {
      history = history.slice(0, 100);
    }
    wx.setStorageSync('gameHistory', history);
    
    // 显示结果
    wx.showModal({
      title: '游戏结束',
      content: `底池: ${gameState.pot}，${gameState.finalResult.message}`,
      showCancel: true,
      confirmText: '再来一局',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          this.startNewGame();
        } else {
          wx.navigateBack();
        }
      }
    });
  }
});
