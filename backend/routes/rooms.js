// backend/routes/rooms.js
const express = require('express');
const router = express.Router();
const roomService = require('../services/room-service');

/**
 * 创建房间
 * POST /api/rooms
 */
router.post('/', async (req, res) => {
  try {
    const { ownerId, ownerName, ownerAvatar, settings } = req.body;
    
    if (!ownerId || !ownerName) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const room = await roomService.createRoom(ownerId, ownerName, ownerAvatar, settings);
    res.json({
      success: true,
      room: {
        roomId: room.roomId,
        roomName: room.roomName,
        password: room.password,
        ownerId: room.ownerId,
        ownerName: room.ownerName,
        status: room.status,
        settings: room.settings,
        players: room.players,
        createdAt: room.createdAt
      }
    });
  } catch (error) {
    console.error('创建房间失败:', error);
    res.status(500).json({ error: error.message || '创建房间失败' });
  }
});

/**
 * 获取房间列表
 * GET /api/rooms
 */
router.get('/', async (req, res) => {
  try {
    const { status = 'waiting', limit = 50 } = req.query;
    const rooms = await roomService.getRoomList(status, parseInt(limit));
    res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('获取房间列表失败:', error);
    res.status(500).json({ error: error.message || '获取房间列表失败' });
  }
});

/**
 * 获取房间详情
 * GET /api/rooms/:roomId
 */
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await roomService.getRoomById(roomId);
    
    if (!room) {
      return res.status(404).json({ error: '房间不存在' });
    }

    // 不返回密码
    const roomData = room.toObject();
    delete roomData.password;

    res.json({
      success: true,
      room: roomData
    });
  } catch (error) {
    console.error('获取房间详情失败:', error);
    res.status(500).json({ error: error.message || '获取房间详情失败' });
  }
});

/**
 * 加入房间
 * POST /api/rooms/:roomId/join
 */
router.post('/:roomId/join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, nickname, avatar, password } = req.body;
    
    if (!userId || !nickname) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const room = await roomService.joinRoom(roomId, userId, nickname, avatar, password);
    
    const roomData = room.toObject();
    delete roomData.password;

    res.json({
      success: true,
      room: roomData
    });
  } catch (error) {
    console.error('加入房间失败:', error);
    res.status(400).json({ error: error.message || '加入房间失败' });
  }
});

/**
 * 离开房间
 * POST /api/rooms/:roomId/leave
 */
router.post('/:roomId/leave', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const room = await roomService.leaveRoom(roomId, userId);
    
    if (!room) {
      return res.json({
        success: true,
        message: '房间已删除'
      });
    }

    const roomData = room.toObject();
    delete roomData.password;

    res.json({
      success: true,
      room: roomData
    });
  } catch (error) {
    console.error('离开房间失败:', error);
    res.status(400).json({ error: error.message || '离开房间失败' });
  }
});

/**
 * 设置准备状态
 * POST /api/rooms/:roomId/ready
 */
router.post('/:roomId/ready', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, isReady } = req.body;
    
    if (!userId || typeof isReady !== 'boolean') {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const room = await roomService.setPlayerReady(roomId, userId, isReady);
    
    const roomData = room.toObject();
    delete roomData.password;

    res.json({
      success: true,
      room: roomData
    });
  } catch (error) {
    console.error('设置准备状态失败:', error);
    res.status(400).json({ error: error.message || '设置准备状态失败' });
  }
});

/**
 * 获取用户房间
 * GET /api/rooms/user/:userId
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rooms = await roomService.getUserRooms(userId);
    res.json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error('获取用户房间失败:', error);
    res.status(500).json({ error: error.message || '获取用户房间失败' });
  }
});

/**
 * 更新房间设置（仅房主）
 * PUT /api/rooms/:roomId/settings
 */
router.put('/:roomId/settings', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId, settings } = req.body;
    
    if (!userId || !settings) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const room = await roomService.updateRoomSettings(roomId, userId, settings);
    
    const roomData = room.toObject();
    delete roomData.password;

    res.json({
      success: true,
      room: roomData
    });
  } catch (error) {
    console.error('更新房间设置失败:', error);
    res.status(400).json({ error: error.message || '更新房间设置失败' });
  }
});

module.exports = router;
