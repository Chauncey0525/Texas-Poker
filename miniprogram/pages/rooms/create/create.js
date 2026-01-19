// pages/rooms/create/create.js
const roomApi = require('../../utils/room-api.js');
const storage = require('../../utils/storage.js');
const config = require('../../utils/config.js');

Page({
  data: {
    userInfo: null,
    form: {
      roomName: '',
      password: '',
      maxPlayers: 6,
      initialChips: 1000,
      smallBlind: 10,
      bigBlind: 20
    },
    submitting: false
  },

  onLoad() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      this.setData({ userInfo });
    } else {
      this.setData({
        userInfo: {
          userId: 'user_' + Date.now(),
          nickname: '玩家',
          avatar: ''
        }
      });
    }
  },

  // 输入房间名称
  onRoomNameInput(e) {
    this.setData({
      'form.roomName': e.detail.value
    });
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      'form.password': e.detail.value
    });
  },

  // 选择最大人数
  onMaxPlayersChange(e) {
    this.setData({
      'form.maxPlayers': parseInt(e.detail.value)
    });
  },

  // 输入初始筹码
  onInitialChipsInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'form.initialChips': value
    });
  },

  // 输入小盲注
  onSmallBlindInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'form.smallBlind': value,
      'form.bigBlind': value * 2
    });
  },

  // 输入大盲注
  onBigBlindInput(e) {
    const value = parseInt(e.detail.value) || 0;
    this.setData({
      'form.bigBlind': value
    });
  },

  // 验证表单
  validateForm() {
    const { form } = this.data;
    
    if (!form.roomName.trim()) {
      wx.showToast({
        title: '请输入房间名称',
        icon: 'none'
      });
      return false;
    }

    if (form.maxPlayers < 2 || form.maxPlayers > 10) {
      wx.showToast({
        title: '人数必须在2-10之间',
        icon: 'none'
      });
      return false;
    }

    if (form.initialChips < 100) {
      wx.showToast({
        title: '初始筹码至少100',
        icon: 'none'
      });
      return false;
    }

    if (form.smallBlind < 1 || form.bigBlind < 1) {
      wx.showToast({
        title: '盲注必须大于0',
        icon: 'none'
      });
      return false;
    }

    if (form.bigBlind < form.smallBlind) {
      wx.showToast({
        title: '大盲注必须大于小盲注',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 创建房间
  async onCreateRoom() {
    if (!this.validateForm()) {
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '创建中...' });

    try {
      const { userInfo, form } = this.data;
      const room = await roomApi.createRoom(
        userInfo.userId,
        userInfo.nickname,
        userInfo.avatar,
        form
      );

      wx.hideLoading();
      wx.showToast({
        title: '创建成功',
        icon: 'success'
      });

      // 跳转到房间详情页
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/rooms/detail/detail?roomId=${room.roomId}`
        });
      }, 1500);
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '创建失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
