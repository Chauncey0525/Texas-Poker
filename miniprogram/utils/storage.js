// utils/storage.js
// 本地存储管理

const STORAGE_KEYS = {
  GAME_HISTORY: 'gameHistory',
  USER_INFO: 'userInfo',
  GAME_SETTINGS: 'gameSettings',
  GTO_CACHE: 'gtoCache'
};

// 保存游戏历史
function saveGameHistory(gameRecord) {
  let history = wx.getStorageSync(STORAGE_KEYS.GAME_HISTORY) || [];
  history.unshift(gameRecord);
  
  // 最多保存100条记录
  if (history.length > 100) {
    history = history.slice(0, 100);
  }
  
  wx.setStorageSync(STORAGE_KEYS.GAME_HISTORY, history);
  return history;
}

// 获取游戏历史
function getGameHistory() {
  return wx.getStorageSync(STORAGE_KEYS.GAME_HISTORY) || [];
}

// 删除游戏记录
function deleteGameRecord(id) {
  let history = getGameHistory();
  history = history.filter(item => item.id !== id);
  wx.setStorageSync(STORAGE_KEYS.GAME_HISTORY, history);
  return history;
}

// 清空游戏历史
function clearGameHistory() {
  wx.setStorageSync(STORAGE_KEYS.GAME_HISTORY, []);
}

// 保存用户信息
function saveUserInfo(userInfo) {
  wx.setStorageSync(STORAGE_KEYS.USER_INFO, userInfo);
}

// 获取用户信息
function getUserInfo() {
  return wx.getStorageSync(STORAGE_KEYS.USER_INFO) || null;
}

// 保存游戏设置
function saveGameSettings(settings) {
  wx.setStorageSync(STORAGE_KEYS.GAME_SETTINGS, settings);
}

// 获取游戏设置
function getGameSettings() {
  return wx.getStorageSync(STORAGE_KEYS.GAME_SETTINGS) || {
    playerCount: 2,
    initialChips: 1000,
    smallBlind: 10,
    bigBlind: 20
  };
}

// 缓存GTO结果
function cacheGTOResult(key, result) {
  let cache = wx.getStorageSync(STORAGE_KEYS.GTO_CACHE) || {};
  cache[key] = {
    result: result,
    timestamp: Date.now()
  };
  
  // 清理过期缓存（7天）
  const expireTime = 7 * 24 * 60 * 60 * 1000;
  Object.keys(cache).forEach(k => {
    if (Date.now() - cache[k].timestamp > expireTime) {
      delete cache[k];
    }
  });
  
  wx.setStorageSync(STORAGE_KEYS.GTO_CACHE, cache);
}

// 获取缓存的GTO结果
function getCachedGTOResult(key) {
  const cache = wx.getStorageSync(STORAGE_KEYS.GTO_CACHE) || {};
  const cached = cache[key];
  
  if (!cached) return null;
  
  // 检查是否过期（7天）
  const expireTime = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - cached.timestamp > expireTime) {
    delete cache[key];
    wx.setStorageSync(STORAGE_KEYS.GTO_CACHE, cache);
    return null;
  }
  
  return cached.result;
}

module.exports = {
  saveGameHistory,
  getGameHistory,
  deleteGameRecord,
  clearGameHistory,
  saveUserInfo,
  getUserInfo,
  saveGameSettings,
  getGameSettings,
  cacheGTOResult,
  getCachedGTOResult
};
