// pages/range-analyzer/range-analyzer.js
const rangeData = require('../../utils/range-data.js');

Page({
  data: {
    position: 'BTN',
    range: {},
    compareRange: {},
    positions: ['UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB'],
    editable: false,
    compareMode: false,
    rangePercentage: 0
  },

  onLoad() {
    this.loadRange();
  },

  // 设置位置
  setPosition(e) {
    const position = this.data.positions[e.detail.value];
    this.setData({ position });
    this.loadRange();
  },

  // 加载范围
  loadRange() {
    const range = rangeData.getRangeForPosition(this.data.position);
    const rangePercentage = rangeData.calculateRangePercentage(range);
    this.setData({ 
      range,
      rangePercentage,
      compareMode: false
    });
  },

  // 范围变化（编辑模式）
  onRangeChange(e) {
    const range = e.detail.range || {};
    const rangePercentage = rangeData.calculateRangePercentage(range);
    this.setData({ 
      range,
      rangePercentage
    });
  },

  // 切换编辑模式
  toggleEdit() {
    this.setData({
      editable: !this.data.editable
    });
  },

  // 切换对比模式
  toggleCompare() {
    if (!this.data.compareMode) {
      // 进入对比模式，保存当前范围作为对比范围
      this.setData({
        compareMode: true,
        compareRange: { ...this.data.range }
      });
    } else {
      // 退出对比模式
      this.setData({
        compareMode: false,
        compareRange: {}
      });
    }
  },

  // 重置范围
  resetRange() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置为默认范围吗？',
      success: (res) => {
        if (res.confirm) {
          this.loadRange();
        }
      }
    });
  },

  // 保存范围
  saveRange() {
    // 保存到本地存储
    const key = `range_${this.data.position}`;
    wx.setStorageSync(key, this.data.range);
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 加载保存的范围
  loadSavedRange() {
    const key = `range_${this.data.position}`;
    const savedRange = wx.getStorageSync(key);
    if (savedRange) {
      const rangePercentage = rangeData.calculateRangePercentage(savedRange);
      this.setData({ 
        range: savedRange,
        rangePercentage
      });
      wx.showToast({
        title: '加载成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '没有保存的范围',
        icon: 'none'
      });
    }
  }
});
