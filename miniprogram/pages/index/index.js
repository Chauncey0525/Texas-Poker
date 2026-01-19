// pages/index/index.js
Page({
  data: {
    userStats: {
      totalGames: 0,
      accuracy: 0,
      winRate: 0
    },
    quickActions: [
      {
        id: 'simulation',
        title: '开始模拟',
        desc: '与AI对手进行模拟对局',
        icon: '🎮',
        path: '/pages/simulation/simulation'
      },
      {
        id: 'gto-advice',
        title: 'GTO建议',
        desc: '获取实时策略建议',
        icon: '💡',
        path: '/pages/gto-advice/gto-advice'
      },
      {
        id: 'hand-analyzer',
        title: '手牌分析',
        desc: '分析手牌胜率和牌力',
        icon: '🔍',
        path: '/pages/hand-analyzer/hand-analyzer'
      },
      {
        id: 'range-analyzer',
        title: '范围分析',
        desc: '可视化手牌范围',
        icon: '📊',
        path: '/pages/range-analyzer/range-analyzer'
      }
    ]
  },

  onLoad() {
    this.loadUserStats();
  },

  onShow() {
    this.loadUserStats();
  },

  // 加载用户统计
  loadUserStats() {
    const gameHistory = wx.getStorageSync('gameHistory') || [];
    const totalGames = gameHistory.length;
    
    // 计算准确率（如果有GTO分析数据）
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
      userStats: {
        totalGames,
        accuracy,
        winRate
      }
    });
  },

  // 快速操作
  onQuickAction(e) {
    const path = e.currentTarget.dataset.path;
    if (path) {
      wx.navigateTo({
        url: path
      });
    }
  },

  // 查看复盘
  viewReplay() {
    wx.switchTab({
      url: '/pages/replay/replay'
    });
  },

  // 查看知识库
  viewKnowledge() {
    wx.switchTab({
      url: '/pages/knowledge/knowledge'
    });
  }
});
