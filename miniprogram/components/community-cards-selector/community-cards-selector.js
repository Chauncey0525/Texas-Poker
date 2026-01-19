// components/community-cards-selector/community-cards-selector.js
Component({
  properties: {
    selectedCards: {
      type: Array,
      value: []
    },
    maxCards: {
      type: Number,
      value: 5
    }
  },

  data: {
    suits: ['♠', '♥', '♦', '♣'],
    ranks: ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'],
    showSelector: false
  },

  methods: {
    // 显示选择器
    show() {
      this.setData({
        showSelector: true
      });
    },

    // 隐藏选择器
    hide() {
      this.setData({
        showSelector: false
      });
    },

    // 选择卡牌
    selectCard(e) {
      const suit = e.currentTarget.dataset.suit;
      const rank = e.currentTarget.dataset.rank;
      const card = { suit, rank, value: this.getCardValue(rank) };
      
      let selectedCards = [...this.properties.selectedCards];
      
      // 检查是否已选择
      const exists = selectedCards.some(c => c.suit === suit && c.rank === rank);
      if (exists) {
        // 取消选择
        selectedCards = selectedCards.filter(c => !(c.suit === suit && c.rank === rank));
      } else {
        // 添加选择（最多maxCards张）
        if (selectedCards.length < this.properties.maxCards) {
          selectedCards.push(card);
        } else {
          wx.showToast({
            title: `最多选择${this.properties.maxCards}张牌`,
            icon: 'none'
          });
          return;
        }
      }
      
      // 通知父组件
      this.triggerEvent('change', { cards: selectedCards });
    },

    // 清除选择
    clearSelection() {
      this.triggerEvent('change', { cards: [] });
    },

    // 确认选择
    confirmSelection() {
      this.triggerEvent('change', { cards: this.properties.selectedCards });
      this.hide();
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
      return this.properties.selectedCards.some(c => c.suit === suit && c.rank === rank);
    },

    // 阻止事件冒泡
    stopPropagation() {
      // 空函数
    }
  }
});
