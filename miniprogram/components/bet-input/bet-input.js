// components/bet-input/bet-input.js
Component({
  properties: {
    currentBet: {
      type: Number,
      value: 0
    },
    playerChips: {
      type: Number,
      value: 0
    },
    minBet: {
      type: Number,
      value: 0
    }
  },

  data: {
    betAmount: 0,
    showInput: false
  },

  methods: {
    // 显示输入框
    showBetInput() {
      this.setData({
        showInput: true,
        betAmount: this.properties.minBet || this.properties.currentBet
      });
    },

    // 隐藏输入框
    hideBetInput() {
      this.setData({
        showInput: false
      });
    },

    // 输入金额变化
    onAmountInput(e) {
      const amount = parseInt(e.detail.value) || 0;
      this.setData({
        betAmount: amount
      });
    },

    // 快速选择金额
    onQuickSelect(e) {
      const type = e.currentTarget.dataset.type;
      let amount = 0;
      
      switch (type) {
        case 'min':
          amount = this.properties.minBet || this.properties.currentBet;
          break;
        case 'half':
          amount = Math.floor(this.properties.playerChips / 2);
          break;
        case 'pot':
          amount = this.properties.currentBet * 2; // 简化：2倍当前下注
          break;
        case 'all':
          amount = this.properties.playerChips;
          break;
      }
      
      this.setData({
        betAmount: amount
      });
    },

    // 确认下注
    confirmBet() {
      const amount = this.data.betAmount;
      const minBet = this.properties.minBet || this.properties.currentBet;
      const maxBet = this.properties.playerChips;
      
      if (amount < minBet) {
        wx.showToast({
          title: `最小下注: ${minBet}`,
          icon: 'none'
        });
        return;
      }
      
      if (amount > maxBet) {
        wx.showToast({
          title: `筹码不足，最多: ${maxBet}`,
          icon: 'none'
        });
        return;
      }
      
      this.triggerEvent('confirm', { amount });
      this.hideBetInput();
    },

    // 取消
    cancel() {
      this.hideBetInput();
    }
  }
});
