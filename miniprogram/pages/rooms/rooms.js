// pages/rooms/rooms.js
const roomApi = require('../../utils/room-api.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    rooms: [],
    loading: false,
    refreshing: false,
    status: 'waiting', // waiting, playing
    userInfo: null
  },

  onLoad(options) {
    const status = options.status || 'waiting';
    this.setData({ status });
    this.loadUserInfo();
    this.loadRooms();
  },

  onShow() {
    this.loadRooms();
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadRooms().finally(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      // 如果没有用户信息，使用默认值
      this.setData({
        userInfo: {
          userId: 'user_' + Date.now(),
          nickname: '玩家',
          avatar: ''
        }
      });
    }
  },

  // 加载房间列表
  async loadRooms() {
    this.setData({ loading: true });
    try {
      const rooms = await roomApi.getRoomList(this.data.status);
      this.setData({ rooms });
    } catch (error) {
      console.error('加载房间列表失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 切换状态
  onStatusChange(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ status });
    this.loadRooms();
  },

  // 创建房间
  onCreateRoom() {
    wx.navigateTo({
      url: '/pages/rooms/create/create'
    });
  },

  // 加入房间
  async onJoinRoom(e) {
    const roomId = e.currentTarget.dataset.roomid;
    const hasPassword = e.currentTarget.dataset.password;
    
    if (hasPassword) {
      // 需要密码，弹出输入框
      wx.showModal({
        title: '输入房间密码',
        editable: true,
        placeholderText: '请输入房间密码',
        success: async (res) => {
          if (res.confirm && res.content) {
            await this.joinRoomWithPassword(roomId, res.content);
          }
        }
      });
    } else {
      await this.joinRoomWithPassword(roomId, '');
    }
  },

  // 使用密码加入房间
  async joinRoomWithPassword(roomId, password) {
    wx.showLoading({ title: '加入中...' });
    try {
      const userInfo = this.data.userInfo;
      await roomApi.joinRoom(
        roomId,
        userInfo.userId,
        userInfo.nickname,
        userInfo.avatar,
        password
      );
      
      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/rooms/detail/detail?roomId=${roomId}`
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      });
    }
  },

  // 查看房间详情
  onViewRoom(e) {
    const roomId = e.currentTarget.dataset.roomid;
    wx.navigateTo({
      url: `/pages/rooms/detail/detail?roomId=${roomId}`
    });
  }
});
