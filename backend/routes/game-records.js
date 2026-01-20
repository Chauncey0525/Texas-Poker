// backend/routes/game-records.js
const express = require('express');
const router = express.Router();
const MultiplayerGameRecord = require('../models/multiplayer-game-record');

/**
 * 按房间查询对局记录
 * GET /api/game-records/room/:roomId
 */
router.get('/room/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0, handNumber } = req.query;

    const query = { roomId };
    if (handNumber) {
      query.handNumber = parseInt(handNumber);
    }

    const records = await MultiplayerGameRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await MultiplayerGameRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('查询房间对局记录失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

/**
 * 按玩家查询对局记录
 * GET /api/game-records/player/:userId
 */
router.get('/player/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, startDate, endDate } = req.query;

    const query = { 'players.userId': userId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }

    const records = await MultiplayerGameRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await MultiplayerGameRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('查询玩家对局记录失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

/**
 * 按时间范围查询对局记录
 * GET /api/game-records/time
 */
router.get('/time', async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: '需要提供开始时间和结束时间' });
    }

    const query = {
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const records = await MultiplayerGameRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await MultiplayerGameRecord.countDocuments(query);

    res.json({
      success: true,
      records,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('按时间查询对局记录失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

/**
 * 获取对局详情
 * GET /api/game-records/:recordId
 */
router.get('/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const record = await MultiplayerGameRecord.findById(recordId);

    if (!record) {
      return res.status(404).json({ error: '对局记录不存在' });
    }

    res.json({
      success: true,
      record
    });
  } catch (error) {
    console.error('获取对局详情失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

/**
 * 获取玩家统计信息
 * GET /api/game-records/player/:userId/stats
 */
router.get('/player/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const matchQuery = { 'players.userId': userId };
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) {
        matchQuery.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.timestamp.$lte = new Date(endDate);
      }
    }

    const records = await MultiplayerGameRecord.find(matchQuery);

    // 计算统计信息
    const stats = {
      totalGames: records.length,
      totalProfit: 0,
      totalWins: 0,
      totalLosses: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageProfit: 0
    };

    records.forEach(record => {
      const player = record.players.find(p => p.userId === userId);
      if (player) {
        const profit = player.profit || 0;
        stats.totalProfit += profit;
        
        if (profit > 0) {
          stats.totalWins++;
          if (profit > stats.biggestWin) {
            stats.biggestWin = profit;
          }
        } else if (profit < 0) {
          stats.totalLosses++;
          if (profit < stats.biggestLoss) {
            stats.biggestLoss = profit;
          }
        }
      }
    });

    stats.averageProfit = stats.totalGames > 0 ? stats.totalProfit / stats.totalGames : 0;

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取玩家统计失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

module.exports = router;
