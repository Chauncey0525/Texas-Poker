// pages/replay/replay.js
Page({
  data: {
    gameHistory: [],
    selectedGame: null,
    replayStep: 0,
    isReplaying: false
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('gameHistory') || [];
    this.setData({
      gameHistory: history
    });
  },

  // 查看复盘详情
  viewReplay(e) {
    const index = e.currentTarget.dataset.index;
    const game = this.data.gameHistory[index];
    
    if (!game || !game.id) {
      wx.showToast({
        title: '记录数据错误',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/replay/detail/detail?gameId=${game.id}`
    });
  },

  // 删除记录
  deleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          let history = wx.getStorageSync('gameHistory') || [];
          history = history.filter(item => item.id !== id);
          wx.setStorageSync('gameHistory', history);
          this.loadHistory();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 清空所有记录
  clearAll() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('gameHistory', []);
          this.setData({
            gameHistory: []
          });
          
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  }
});
