// pages/rooms/detail/detail.js
const roomApi = require('../../utils/room-api.js');
const socket = require('../../utils/socket.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    roomId: '',
    room: null,
    userInfo: null,
    isOwner: false,
    isInRoom: false,
    allReady: false,
    currentPlayerReady: false,
    chatMessages: [],
    chatInput: '',
    showInviteDialog: false,
    inviteCode: '',
    showSettingsEdit: false,
    editSettings: {}
  },

  onLoad(options) {
    const roomId = options.roomId;
    if (!roomId) {
      wx.showToast({
        title: '房间ID无效',
        icon: 'none'
      });
      wx.navigateBack();
      return;
    }

    this.setData({ roomId });
    this.loadUserInfo();
    this.loadRoomDetail();
    this.initSocket();
    this.generateInviteCode();
  },

  onUnload() {
    // 离开房间
    if (this.data.isInRoom && this.data.userInfo) {
      roomApi.leaveRoom(this.data.roomId, this.data.userInfo.userId).catch(console.error);
    }
    socket.disconnect();
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

  // 加载房间详情
  async loadRoomDetail() {
    try {
      const room = await roomApi.getRoomDetail(this.data.roomId);
      const userInfo = this.data.userInfo;
      const isOwner = room.ownerId === userInfo.userId;
      const isInRoom = room.players.some(p => p.userId === userInfo.userId);
      
      // 获取当前玩家的准备状态
      const currentPlayer = room.players.find(p => p.userId === userInfo.userId);
      const currentPlayerReady = currentPlayer ? currentPlayer.isReady : false;
      
      // 检查所有玩家是否准备
      const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);
      
      this.setData({
        room,
        isOwner,
        isInRoom,
        allReady,
        currentPlayerReady
      });
    } catch (error) {
      console.error('加载房间详情失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  // 初始化 WebSocket
  async initSocket() {
    const userInfo = this.data.userInfo;
    
    try {
      await socket.connect(userInfo.userId, userInfo.nickname);
      
      // 监听房间更新
      socket.on('room:updated', (data) => {
        const room = data.room;
        const userInfo = this.data.userInfo;
        const isOwner = room.ownerId === userInfo.userId;
        const isInRoom = room.players.some(p => p.userId === userInfo.userId);
        
        // 获取当前玩家的准备状态
        const currentPlayer = room.players.find(p => p.userId === userInfo.userId);
        const currentPlayerReady = currentPlayer ? currentPlayer.isReady : false;
        
        // 检查所有玩家是否准备
        const allReady = room.players.length >= 2 && room.players.every(p => p.isReady);
        
        this.setData({
          room,
          isOwner,
          isInRoom,
          allReady,
          currentPlayerReady
        });
      });

      // 监听游戏开始
      socket.on('game:started', (data) => {
        wx.showToast({
          title: '游戏开始',
          icon: 'success'
        });
        // 跳转到游戏页面
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/rooms/game/game?roomId=${this.data.roomId}`
          });
        }, 1000);
      });

      // 监听聊天消息
      socket.on('room:chat:message', (data) => {
        const messages = [...this.data.chatMessages, data];
        this.setData({ chatMessages: messages });
      });

      // 如果不在房间中，自动加入
      if (!this.data.isInRoom) {
        await this.joinRoom();
      } else {
        socket.joinRoom(this.data.roomId, userInfo.nickname, userInfo.avatar);
      }
    } catch (error) {
      console.error('WebSocket 连接失败:', error);
      wx.showToast({
        title: '连接失败',
        icon: 'none'
      });
    }
  },

  // 加入房间
  async joinRoom() {
    try {
      const { roomId, userInfo } = this.data;
      await roomApi.joinRoom(roomId, userInfo.userId, userInfo.nickname, userInfo.avatar);
      socket.joinRoom(roomId, userInfo.nickname, userInfo.avatar);
      this.setData({ isInRoom: true });
      this.loadRoomDetail();
    } catch (error) {
      wx.showToast({
        title: error.message || '加入失败',
        icon: 'none'
      });
    }
  },

  // 设置准备状态
  async onToggleReady() {
    const { room, userInfo, currentPlayerReady } = this.data;
    if (!room || !userInfo) return;

    const isReady = !currentPlayerReady;
    
    try {
      await roomApi.setReady(this.data.roomId, userInfo.userId, isReady);
      socket.setReady(this.data.roomId, isReady);
      // 立即更新本地状态
      this.setData({
        currentPlayerReady: isReady
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  // 生成邀请码
  generateInviteCode() {
    const roomId = this.data.roomId;
    // 使用房间ID的前8位作为邀请码
    const inviteCode = roomId.substring(0, 8).toUpperCase();
    this.setData({ inviteCode });
  },

  // 显示邀请对话框
  onShowInvite() {
    this.setData({ showInviteDialog: true });
  },

  // 关闭邀请对话框
  onCloseInvite() {
    this.setData({ showInviteDialog: false });
  },

  // 复制邀请码
  onCopyInviteCode() {
    const inviteCode = this.data.inviteCode;
    wx.setClipboardData({
      data: inviteCode,
      success: () => {
        wx.showToast({
          title: '邀请码已复制',
          icon: 'success'
        });
      }
    });
  },

  // 分享房间
  onShareRoom() {
    const { room, inviteCode } = this.data;
    return {
      title: `邀请你加入房间：${room.roomName}`,
      path: `/pages/rooms/detail/detail?roomId=${this.data.roomId}&inviteCode=${inviteCode}`,
      imageUrl: '' // 可以添加房间分享图片
    };
  },

  // 显示设置编辑
  onShowSettingsEdit() {
    if (!this.data.isOwner) {
      wx.showToast({
        title: '只有房主可以修改设置',
        icon: 'none'
      });
      return;
    }

    if (this.data.room.status === 'playing') {
      wx.showToast({
        title: '游戏进行中无法修改设置',
        icon: 'none'
      });
      return;
    }

    this.setData({
      showSettingsEdit: true,
      editSettings: {
        roomName: this.data.room.roomName,
        password: '',
        maxPlayers: this.data.room.settings.maxPlayers,
        initialChips: this.data.room.settings.initialChips,
        smallBlind: this.data.room.settings.smallBlind,
        bigBlind: this.data.room.settings.bigBlind
      }
    });
  },

  // 关闭设置编辑
  onCloseSettingsEdit() {
    this.setData({ showSettingsEdit: false });
  },

  // 输入设置
  onSettingsInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    const settings = { ...this.data.editSettings };
    
    if (field === 'maxPlayers' || field === 'initialChips' || field === 'smallBlind' || field === 'bigBlind') {
      settings[field] = parseInt(value) || 0;
    } else {
      settings[field] = value;
    }

    this.setData({ editSettings: settings });
  },

  // 保存设置
  async onSaveSettings() {
    const { editSettings, roomId, userInfo } = this.data;
    
    // 验证设置
    if (!editSettings.roomName || editSettings.roomName.trim() === '') {
      wx.showToast({
        title: '房间名称不能为空',
        icon: 'none'
      });
      return;
    }

    if (editSettings.maxPlayers < 2 || editSettings.maxPlayers > 9) {
      wx.showToast({
        title: '人数限制应在2-9人之间',
        icon: 'none'
      });
      return;
    }

    if (editSettings.bigBlind < editSettings.smallBlind) {
      wx.showToast({
        title: '大盲注不能小于小盲注',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    
    try {
      await roomApi.updateRoomSettings(roomId, userInfo.userId, editSettings);
      
      wx.hideLoading();
      wx.showToast({
        title: '设置已更新',
        icon: 'success'
      });
      
      this.setData({ showSettingsEdit: false });
      this.loadRoomDetail();
      
      // 通知房间内其他玩家
      socket.send('room:settings:updated', {
        roomId,
        settings: editSettings
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    }
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 空函数，用于阻止事件冒泡
  },

  // 开始游戏
  async onStartGame() {
    if (!this.data.allReady) {
      wx.showToast({
        title: '所有玩家必须准备',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认开始',
      content: '确定要开始游戏吗？',
      success: async (res) => {
        if (res.confirm) {
          socket.startGame(this.data.roomId);
        }
      }
    });
  },

  // 离开房间
  async onLeaveRoom() {
    wx.showModal({
      title: '确认离开',
      content: '确定要离开房间吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await roomApi.leaveRoom(this.data.roomId, this.data.userInfo.userId);
            socket.leaveRoom(this.data.roomId);
            wx.navigateBack();
          } catch (error) {
            wx.showToast({
              title: error.message || '离开失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 输入聊天消息
  onChatInput(e) {
    this.setData({
      chatInput: e.detail.value
    });
  },

  // 发送聊天消息
  onSendChat() {
    const message = this.data.chatInput.trim();
    if (!message) return;

    socket.sendChatMessage(this.data.roomId, message, this.data.userInfo.nickname);
    this.setData({ chatInput: '' });
  }
});
