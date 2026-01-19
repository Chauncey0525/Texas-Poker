// components/range-grid/range-grid.js
Component({
  properties: {
    // 范围数据：对象，key为手牌字符串（如"AA", "AKs", "AKo"），value为是否在范围内
    range: {
      type: Object,
      value: {}
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      value: true
    },
    // 显示模式：'normal' 正常显示，'compare' 对比模式
    mode: {
      type: String,
      value: 'normal'
    },
    // 对比范围（用于对比模式）
    compareRange: {
      type: Object,
      value: {}
    }
  },

  data: {
    ranks: ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'],
    selectedHands: new Set(), // 用于跟踪选中的手牌
    selectedHandsList: [] // 数组形式，供WXML使用
  },

  observers: {
    'range': function(range) {
      // 当范围数据更新时，更新选中的手牌
      const selectedHands = new Set();
      for (const hand in range) {
        if (range[hand]) {
          selectedHands.add(hand);
        }
      }
      // 转换为数组供WXML使用
      const selectedHandsList = Array.from(selectedHands);
      this.setData({ 
        selectedHands,
        selectedHandsList
      });
    }
  },

  methods: {
    // 获取手牌字符串
    getHandString(row, col) {
      const rank1 = this.data.ranks[row];
      const rank2 = this.data.ranks[col];
      
      if (row === col) {
        // 对子
        return rank1 + rank2;
      } else if (row < col) {
        // 同花（suited）
        return rank1 + rank2 + 's';
      } else {
        // 不同花（offsuit）
        return rank2 + rank1 + 'o';
      }
    },

    // 点击手牌
    onHandClick(e) {
      if (!this.properties.editable) return;
      
      const row = e.currentTarget.dataset.row;
      const col = e.currentTarget.dataset.col;
      const hand = this.getHandString(row, col);
      
      // 切换选择状态
      const selectedHands = new Set(this.data.selectedHands);
      if (selectedHands.has(hand)) {
        selectedHands.delete(hand);
      } else {
        selectedHands.add(hand);
      }
      
      // 转换为数组供WXML使用
      const selectedHandsList = Array.from(selectedHands);
      this.setData({ 
        selectedHands,
        selectedHandsList
      });
      
      // 通知父组件
      const range = {};
      selectedHands.forEach(hand => {
        range[hand] = true;
      });
      this.triggerEvent('change', { range });
    },

    // 获取手牌样式类
    getHandClass(row, col) {
      const hand = this.getHandString(row, col);
      const isSelected = this.data.selectedHands.has(hand);
      
      if (this.properties.mode === 'compare') {
        const inRange = this.properties.range[hand];
        const inCompare = this.properties.compareRange[hand];
        
        if (inRange && inCompare) {
          return 'hand-cell both'; // 两个范围都有
        } else if (inRange) {
          return 'hand-cell range-only'; // 只在主范围
        } else if (inCompare) {
          return 'hand-cell compare-only'; // 只在对比范围
        }
      }
      
      return isSelected ? 'hand-cell selected' : 'hand-cell';
    },

    // 清除所有选择
    clearAll() {
      this.setData({ 
        selectedHands: new Set(),
        selectedHandsList: []
      });
      this.triggerEvent('change', { range: {} });
    },

    // 全选
    selectAll() {
      const allHands = new Set();
      for (let row = 0; row < 13; row++) {
        for (let col = 0; col < 13; col++) {
          allHands.add(this.getHandString(row, col));
        }
      }
      const selectedHandsList = Array.from(allHands);
      this.setData({ 
        selectedHands: allHands,
        selectedHandsList
      });
      
      const range = {};
      allHands.forEach(hand => {
        range[hand] = true;
      });
      this.triggerEvent('change', { range });
    }
  }
});
