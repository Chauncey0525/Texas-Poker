// pages/profile/profile.js
const gameRecordApi = require('../../utils/game-record-api.js');

Page({
  data: {
    userInfo: null,
    stats: {
      totalGames: 0,
      totalHands: 0,
      accuracy: 0,
      winRate: 0,
      totalProfit: 0,
      averageProfit: 0,
      biggestWin: 0,
      biggestLoss: 0,
      handsWon: 0,
      handsLost: 0
    },
    loading: false
  },

  onLoad() {
    this.loadUserInfo();
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || getApp().globalData.userInfo;
    this.setData({ userInfo });
  },

  // 加载统计数据
  async loadStats() {
    const userInfo = this.data.userInfo || wx.getStorageSync('userInfo') || getApp().globalData.userInfo;
    
    if (!userInfo || !userInfo.userId) {
      // 如果没有用户ID，只加载本地数据
      this.loadLocalStats();
      return;
    }

    this.setData({ loading: true });

    try {
      // 加载多人对局统计
      const multiplayerStats = await gameRecordApi.getPlayerStats(userInfo.userId);
      
      // 加载本地单人游戏统计
      const localStats = this.getLocalStats();
      
      // 合并统计数据
      this.setData({
        stats: {
          totalGames: multiplayerStats.totalGames + localStats.totalGames,
          totalHands: multiplayerStats.totalHands || 0,
          accuracy: localStats.accuracy,
          winRate: multiplayerStats.winRate || 0,
          totalProfit: multiplayerStats.totalProfit || 0,
          averageProfit: multiplayerStats.averageProfit || 0,
          biggestWin: multiplayerStats.biggestWin || 0,
          biggestLoss: multiplayerStats.biggestLoss || 0,
          handsWon: multiplayerStats.handsWon || 0,
          handsLost: multiplayerStats.handsLost || 0
        },
        loading: false
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
      // 如果API失败，只加载本地数据
      this.loadLocalStats();
    }
  },

  // 加载本地统计数据（单人游戏）
  loadLocalStats() {
    const localStats = this.getLocalStats();
    this.setData({
      stats: {
        ...this.data.stats,
        ...localStats
      },
      loading: false
    });
  },

  // 获取本地统计数据
  getLocalStats() {
    const gameHistory = wx.getStorageSync('gameHistory') || [];
    const totalGames = gameHistory.length;
    
    // 计算准确率
    let totalDecisions = 0;
    let correctDecisions = 0;
    gameHistory.forEach(game => {
      if (game.gtoAnalysis && game.gtoAnalysis.decisions) {
        game.gtoAnalysis.decisions.forEach(decision => {
          totalDecisions++;
          if (decision.isCorrect) {
            correctDecisions++;
          }
        });
      }
    });
    
    const accuracy = totalDecisions > 0 ? Math.round((correctDecisions / totalDecisions) * 100) : 0;
    
    // 计算胜率
    const wins = gameHistory.filter(game => game.finalResult && game.finalResult.winner === 'user').length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    
    return {
      totalGames,
      accuracy,
      winRate
    };
  },

  // 查看设置
  viewSettings() {
    wx.showToast({
      title: '设置功能待实现',
      icon: 'none'
    });
  },

  // 关于
  viewAbout() {
    wx.showModal({
      title: '关于',
      content: '德州扑克GTO学习小程序\n版本: 1.0.0',
      showCancel: false
    });
  }
});
