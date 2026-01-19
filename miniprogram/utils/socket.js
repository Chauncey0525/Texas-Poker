// miniprogram/utils/socket.js
// WebSocket 客户端工具类
const config = require('./config.js');

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.listeners = new Map();
    this.userId = null;
  }

  /**
   * 连接服务器
   */
  connect(userId, nickname) {
    if (this.isConnected && this.socket) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // 微信小程序需要使用 wss:// 或 ws:// 协议
      // Socket.io 需要使用 /socket.io/?EIO=4&transport=websocket 路径
      const wsUrl = (config.wsUrl || 'ws://localhost:3000').replace(/^http/, 'ws') + '/socket.io/?EIO=4&transport=websocket';
      
      this.socket = wx.connectSocket({
        url: wsUrl,
        header: {
          'userId': userId,
          'nickname': nickname
        }
      });

      this.userId = userId;

      this.socket.onOpen(() => {
        console.log('WebSocket 连接成功');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Socket.io 连接需要先发送 '40' 消息建立连接
        // 然后发送用户连接事件
        setTimeout(() => {
          this.emit('user:connect', { userId, nickname });
          resolve();
        }, 100);
      });

      this.socket.onError((error) => {
        console.error('WebSocket 连接错误:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.onClose(() => {
        console.log('WebSocket 连接关闭');
        this.isConnected = false;
        this.socket = null;
        
        // 尝试重连
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect(userId, nickname).catch(console.error);
          }, this.reconnectDelay);
        }
      });

      this.socket.onMessage((res) => {
        try {
          // Socket.io 消息格式处理
          let message = res.data;
          if (typeof message === 'string') {
            // Socket.io 协议消息以数字开头，需要解析
            if (message.startsWith('0')) {
              // 连接确认
              return;
            } else if (message.startsWith('40')) {
              // 连接成功
              return;
            } else if (message.startsWith('42')) {
              // 事件消息，格式: 42["event", data]
              message = message.substring(2);
            }
            const data = JSON.parse(message);
            if (Array.isArray(data) && data.length >= 2) {
              const event = data[0];
              const payload = data[1];
              this.handleMessage({ event, payload });
            } else {
              this.handleMessage({ event: 'message', payload: data });
            }
          }
        } catch (error) {
          console.error('解析消息失败:', error, res.data);
        }
      });
    });
  }

  /**
   * 处理接收到的消息
   */
  handleMessage(data) {
    const { event, payload } = data;
    
    // 触发对应的事件监听器
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`事件 ${event} 回调执行失败:`, error);
        }
      });
    }
  }

  /**
   * 发送消息
   */
  emit(event, data) {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket 未连接，无法发送消息');
      return false;
    }

    try {
      // Socket.io 协议格式: 42["event", data]
      const message = '42' + JSON.stringify([event, data]);
      this.socket.send({
        data: message
      });
      return true;
    } catch (error) {
      console.error('发送消息失败:', error);
      return false;
    }
  }

  /**
   * 监听事件
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event, callback) {
    if (!this.listeners.has(event)) {
      return;
    }

    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // 停止重连
  }

  /**
   * 加入房间
   */
  joinRoom(roomId, nickname, avatar, password = '') {
    return this.emit('room:join', {
      roomId,
      userId: this.userId,
      nickname,
      avatar,
      password
    });
  }

  /**
   * 离开房间
   */
  leaveRoom(roomId) {
    return this.emit('room:leave', {
      roomId,
      userId: this.userId
    });
  }

  /**
   * 设置准备状态
   */
  setReady(roomId, isReady) {
    return this.emit('room:ready', {
      roomId,
      userId: this.userId,
      isReady
    });
  }

  /**
   * 开始游戏
   */
  startGame(roomId) {
    return this.emit('game:start', {
      roomId,
      userId: this.userId
    });
  }

  /**
   * 发送游戏动作
   */
  sendGameAction(roomId, action, amount = 0) {
    return this.emit('game:action', {
      roomId,
      userId: this.userId,
      action,
      amount
    });
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(roomId, message, nickname) {
    return this.emit('room:chat', {
      roomId,
      userId: this.userId,
      message,
      nickname
    });
  }
}

// 创建单例
const socketClient = new SocketClient();

module.exports = socketClient;
