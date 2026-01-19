// app.js
App({
  onLaunch() {
    // 初始化用户信息
    this.initUserInfo();
    
    // 检查登录状态
    this.checkLogin();
  },

  // 初始化用户信息
  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 检查登录状态
  checkLogin() {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          // 这里后续会连接到后端服务
          console.log('登录成功', res.code);
        }
      },
      fail: err => {
        console.error('登录失败', err);
      }
    });
  },

  globalData: {
    userInfo: null,
    apiBaseUrl: 'https://your-api-domain.com/api', // 后续配置实际的后端地址
    gtoApiUrl: 'https://your-gto-api.com', // GTO API地址
  }
});
