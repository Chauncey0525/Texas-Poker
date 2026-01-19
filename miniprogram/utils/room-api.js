// miniprogram/utils/room-api.js
// 房间相关 API
const config = require('./config.js');

const apiBaseUrl = config.apiBaseUrl;

/**
 * 创建房间
 */
function createRoom(ownerId, ownerName, ownerAvatar, settings) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}/rooms`,
      method: 'POST',
      data: {
        ownerId,
        ownerName,
        ownerAvatar,
        settings
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.room);
        } else {
          reject(new Error(res.data.error || '创建房间失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 获取房间列表
 */
function getRoomList(status = 'waiting', limit = 50) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}/rooms`,
      method: 'GET',
      data: {
        status,
        limit
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.rooms);
        } else {
          reject(new Error(res.data.error || '获取房间列表失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 获取房间详情
 */
function getRoomDetail(roomId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}/rooms/${roomId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.room);
        } else {
          reject(new Error(res.data.error || '获取房间详情失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 加入房间
 */
function joinRoom(roomId, userId, nickname, avatar, password = '') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}/rooms/${roomId}/join`,
      method: 'POST',
      data: {
        userId,
        nickname,
        avatar,
        password
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.room);
        } else {
          reject(new Error(res.data.error || '加入房间失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 离开房间
 */
function leaveRoom(roomId, userId) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}/rooms/${roomId}/leave`,
      method: 'POST',
      data: {
        userId
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.error || '离开房间失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 设置准备状态
 */
function setReady(roomId, userId, isReady) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiBaseUrl}/rooms/${roomId}/ready`,
      method: 'POST',
      data: {
        userId,
        isReady
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          resolve(res.data.room);
        } else {
          reject(new Error(res.data.error || '设置准备状态失败'));
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

module.exports = {
  createRoom,
  getRoomList,
  getRoomDetail,
  joinRoom,
  leaveRoom,
  setReady
};
