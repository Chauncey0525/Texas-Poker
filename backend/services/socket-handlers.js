// backend/services/socket-handlers.js
const roomService = require('./room-service');
const gameStateService = require('./game-state-service');

// 存储用户socket连接
const userSockets = new Map(); // userId -> socketId
const socketUsers = new Map(); // socketId -> userId
const userRooms = new Map(); // userId -> roomId

class SocketHandlers {
  initialize(io) {
    this.io = io;

    io.on('connection', (socket) => {
      console.log('新连接:', socket.id);

      // 用户连接
      socket.on('user:connect', async (data) => {
        const { userId, nickname } = data;
        if (!userId) {
          socket.emit('error', { message: '缺少用户ID' });
          return;
        }

        userSockets.set(userId, socket.id);
        socketUsers.set(socket.id, userId);
        socket.userId = userId;
        socket.nickname = nickname || '用户';

        console.log(`用户 ${userId} 已连接`);
        
        // 如果用户在房间中，发送游戏状态快照
        const roomId = userRooms.get(userId);
        if (roomId) {
          try {
            const snapshot = await gameStateService.getGameSnapshot(roomId);
            if (snapshot) {
              socket.emit('game:snapshot', { snapshot });
            }
          } catch (error) {
            console.error('获取游戏快照失败:', error);
          }
        }
        
        socket.emit('user:connected', { userId, socketId: socket.id });
      });

      // 加入房间
      socket.on('room:join', async (data) => {
        try {
          const { roomId, userId, nickname, avatar, password } = data;
          
          if (!roomId || !userId) {
            socket.emit('error', { message: '缺少必要参数' });
            return;
          }

          const room = await roomService.joinRoom(roomId, userId, nickname || socket.nickname, avatar, password);
          socket.join(roomId);
          userRooms.set(userId, roomId);

          // 通知房间内所有用户
          const roomData = room.toObject();
          delete roomData.password;
          io.to(roomId).emit('room:updated', { room: roomData });
          
          socket.emit('room:joined', { room: roomData });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 离开房间
      socket.on('room:leave', async (data) => {
        try {
          const { roomId, userId } = data;
          
          if (!roomId || !userId) {
            socket.emit('error', { message: '缺少必要参数' });
            return;
          }

          const room = await roomService.leaveRoom(roomId, userId);
          socket.leave(roomId);
          userRooms.delete(userId);

          if (room) {
            const roomData = room.toObject();
            delete roomData.password;
            io.to(roomId).emit('room:updated', { room: roomData });
          } else {
            io.to(roomId).emit('room:deleted', { roomId });
          }

          socket.emit('room:left', { roomId });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 设置准备状态
      socket.on('room:ready', async (data) => {
        try {
          const { roomId, userId, isReady } = data;
          
          if (!roomId || !userId || typeof isReady !== 'boolean') {
            socket.emit('error', { message: '缺少必要参数' });
            return;
          }

          const room = await roomService.setPlayerReady(roomId, userId, isReady);
          const roomData = room.toObject();
          delete roomData.password;
          
          io.to(roomId).emit('room:updated', { room: roomData });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 开始游戏
      socket.on('game:start', async (data) => {
        try {
          const { roomId, userId } = data;
          
          if (!roomId || !userId) {
            socket.emit('error', { message: '缺少必要参数' });
            return;
          }

          const room = await roomService.getRoomById(roomId);
          if (!room || room.ownerId !== userId) {
            socket.emit('error', { message: '只有房主可以开始游戏' });
            return;
          }

          const updatedRoom = await gameStateService.initializeGame(roomId);
          const roomData = updatedRoom.toObject();
          delete roomData.password;
          
          io.to(roomId).emit('game:started', { room: roomData });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 玩家动作
      socket.on('game:action', async (data) => {
        try {
          const { roomId, userId, action, amount } = data;
          
          if (!roomId || !userId || !action) {
            socket.emit('error', { message: '缺少必要参数' });
            return;
          }

          const room = await gameStateService.processPlayerAction(roomId, userId, action, amount);
          const roomData = room.toObject();
          delete roomData.password;
          
          io.to(roomId).emit('game:state:updated', { room: roomData });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // 发送聊天消息
      socket.on('room:chat', (data) => {
        const { roomId, userId, message, nickname } = data;
        if (!roomId || !message) {
          socket.emit('error', { message: '缺少必要参数' });
          return;
        }

        io.to(roomId).emit('room:chat:message', {
          userId,
          nickname: nickname || socket.nickname,
          message,
          timestamp: new Date()
        });
      });

      // 心跳检测
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // 断开连接
      socket.on('disconnect', async () => {
        const userId = socketUsers.get(socket.id);
        if (userId) {
          const roomId = userRooms.get(userId);
          
          if (roomId) {
            try {
              const room = await roomService.leaveRoom(roomId, userId);
              if (room) {
                const roomData = room.toObject();
                delete roomData.password;
                io.to(roomId).emit('room:updated', { room: roomData });
              }
            } catch (error) {
              console.error('处理断开连接失败:', error);
            }
          }

          userSockets.delete(userId);
          userRooms.delete(userId);
        }
        socketUsers.delete(socket.id);
        console.log('用户断开连接:', socket.id);
      });
    });

    // 定期清理不活跃房间
    setInterval(async () => {
      try {
        const result = await roomService.cleanupInactiveRooms(30);
        if (result.deletedCount > 0) {
          console.log(`清理了 ${result.deletedCount} 个不活跃房间`);
        }
      } catch (error) {
        console.error('清理房间失败:', error);
      }
    }, 60 * 60 * 1000); // 每小时清理一次
  }

  // 获取用户socket
  getSocketByUserId(userId) {
    const socketId = userSockets.get(userId);
    return socketId ? this.io.sockets.sockets.get(socketId) : null;
  }
}

module.exports = new SocketHandlers();
