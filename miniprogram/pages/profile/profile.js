// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    stats: {
      totalGames: 0,
      accuracy: 0,
      winRate: 0
    }
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
  loadStats() {
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
    
    this.setData({
      stats: {
        totalGames,
        accuracy,
        winRate
      }
    });
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
