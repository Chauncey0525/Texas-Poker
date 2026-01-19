// utils/config.js
// 配置文件

module.exports = {
  // API配置
  apiBaseUrl: 'https://your-api-domain.com/api',
  gtoApiUrl: 'https://your-gto-api.com',
  
  // 游戏配置
  defaultSettings: {
    playerCount: 2,
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20,
    minRaiseMultiplier: 2
  },
  
  // 存储配置
  maxHistoryRecords: 100,
  cacheExpireTime: 7 * 24 * 60 * 60 * 1000, // 7天
  
  // 位置列表
  positions: ['UTG', 'UTG+1', 'MP', 'MP+1', 'CO', 'BTN', 'SB', 'BB']
};
