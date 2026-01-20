// utils/game-record-api.js
const config = require('./config');

const API_BASE_URL = config.apiBaseUrl;

/**
 * 按房间查询对局记录
 */
function getRecordsByRoom(roomId, options = {}) {
  const { limit = 50, offset = 0, handNumber } = options;
  let url = `${API_BASE_URL}/game-records/room/${roomId}?limit=${limit}&offset=${offset}`;
  if (handNumber) {
    url += `&handNumber=${handNumber}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.error || '查询失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * 按玩家查询对局记录
 */
function getRecordsByPlayer(userId, options = {}) {
  const { limit = 50, offset = 0, startDate, endDate } = options;
  let url = `${API_BASE_URL}/game-records/player/${userId}?limit=${limit}&offset=${offset}`;
  if (startDate) {
    url += `&startDate=${startDate}`;
  }
  if (endDate) {
    url += `&endDate=${endDate}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.error || '查询失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * 按时间范围查询对局记录
 */
function getRecordsByTime(startDate, endDate, options = {}) {
  const { limit = 50, offset = 0 } = options;
  const url = `${API_BASE_URL}/game-records/time?startDate=${startDate}&endDate=${endDate}&limit=${limit}&offset=${offset}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.error || '查询失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * 获取对局详情
 */
function getRecordDetail(recordId) {
  const url = `${API_BASE_URL}/game-records/${recordId}`;

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.record);
        } else {
          reject(new Error(res.data.error || '查询失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

/**
 * 获取玩家统计信息
 */
function getPlayerStats(userId, options = {}) {
  const { startDate, endDate } = options;
  let url = `${API_BASE_URL}/game-records/player/${userId}/stats`;
  if (startDate) {
    url += `?startDate=${startDate}`;
    if (endDate) {
      url += `&endDate=${endDate}`;
    }
  } else if (endDate) {
    url += `?endDate=${endDate}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.stats);
        } else {
          reject(new Error(res.data.error || '查询失败'));
        }
      },
      fail: (err) => {
        reject(new Error('网络请求失败'));
      }
    });
  });
}

module.exports = {
  getRecordsByRoom,
  getRecordsByPlayer,
  getRecordsByTime,
  getRecordDetail,
  getPlayerStats
};
