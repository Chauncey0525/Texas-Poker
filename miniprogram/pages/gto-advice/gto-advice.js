// pages/gto-advice/gto-advice.js
const gtoApi = require('../../utils/gto-api.js');

Page({
  data: {
    gameState: {
      players: [],
      communityCards: [],
      gamePhase: 'preflop',
      pot: 0,
      currentBet: 0
    },
    userHand: [],
    position: 'BTN',
    stackDepth: 100,
    advice: null,
    isLoading: false,
    positions: ['UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB'],
    gamePhases: ['preflop', 'flop', 'turn', 'river'],
    gamePhaseIndex: 0
  },

  onLoad() {
    this.initGameState();
  },

  // 初始化游戏状态
  initGameState() {
    // 可以从输入或选择中获取
  },

  // 手牌变化
  onHandChange(e) {
    const hand = e.detail.hand;
    this.setData({
      userHand: hand
    });
  },

  // 设置位置
  setPosition(e) {
    const position = e.detail.value;
    this.setData({
      position: this.data.positions[position]
    });
  },

  // 设置筹码深度
  setStackDepth(e) {
    this.setData({
      stackDepth: parseInt(e.detail.value) || 100
    });
  },

  // 设置游戏阶段
  setGamePhase(e) {
    const index = parseInt(e.detail.value);
    const phase = this.data.gamePhases[index];
    this.setData({
      gamePhaseIndex: index,
      'gameState.gamePhase': phase
    });
  },

  // 获取GTO建议
  async getAdvice() {
    if (this.data.userHand.length !== 2) {
      wx.showToast({
        title: '请先选择手牌',
        icon: 'none'
      });
      return;
    }

    this.setData({ isLoading: true });

    try {
      const gameState = {
        ...this.data.gameState,
        userHand: this.data.userHand,
        position: this.data.position,
        stackDepth: this.data.stackDepth
      };

      const advice = await gtoApi.getAdvice(gameState);
      
      this.setData({
        advice: advice,
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
  }
});
