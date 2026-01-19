// components/hand-selector/hand-selector.js
Component({
  properties: {
    selectedHand: {
      type: Array,
      value: []
    }
  },

  data: {
    suits: ['♠', '♥', '♦', '♣'],
    ranks: ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'],
    selectedCards: [],
    showSelector: false
  },

  observers: {
    'selectedHand': function(hand) {
      this.setData({
        selectedCards: hand || []
      });
    }
  },

  methods: {
    // 显示选择器
    showHandSelector() {
      this.setData({
        showSelector: true
      });
    },

    // 隐藏选择器
    hideHandSelector() {
      this.setData({
        showSelector: false
      });
    },

    // 选择卡牌
    selectCard(e) {
      const suit = e.currentTarget.dataset.suit;
      const rank = e.currentTarget.dataset.rank;
      const card = { suit, rank, value: this.getCardValue(rank) };
      
      let selectedCards = [...this.data.selectedCards];
      
      // 检查是否已选择
      const exists = selectedCards.some(c => c.suit === suit && c.rank === rank);
      if (exists) {
        // 取消选择
        selectedCards = selectedCards.filter(c => !(c.suit === suit && c.rank === rank));
      } else {
        // 添加选择（最多2张）
        if (selectedCards.length < 2) {
          selectedCards.push(card);
        } else {
          wx.showToast({
            title: '最多选择2张牌',
            icon: 'none'
          });
          return;
        }
      }
      
      this.setData({
        selectedCards: selectedCards
      });
      
      // 通知父组件
      if (selectedCards.length === 2) {
        this.triggerEvent('change', { hand: selectedCards });
        // 自动关闭选择器
        setTimeout(() => {
          this.hideHandSelector();
        }, 500);
      } else {
        this.triggerEvent('change', { hand: selectedCards });
      }
    },

    // 清除选择
    clearSelection() {
      this.setData({
        selectedCards: []
      });
      this.triggerEvent('change', { hand: [] });
    },

    // 确认选择
    confirmSelection() {
      if (this.data.selectedCards.length !== 2) {
        wx.showToast({
          title: '请选择2张牌',
          icon: 'none'
        });
        return;
      }
      
      this.triggerEvent('change', { hand: this.data.selectedCards });
      this.hideHandSelector();
    },

    // 获取卡牌数值
    getCardValue(rank) {
      if (rank === 'A') return 14;
      if (rank === 'K') return 13;
      if (rank === 'Q') return 12;
      if (rank === 'J') return 11;
      return parseInt(rank);
    },

    // 检查卡牌是否被选中
    isCardSelected(suit, rank) {
      return this.data.selectedCards.some(c => c.suit === suit && c.rank === rank);
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 空函数
    }
  }
});
