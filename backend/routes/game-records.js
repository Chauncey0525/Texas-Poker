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
      totalHands: 0,
      totalProfit: 0,
      totalWins: 0,
      totalLosses: 0,
      totalTies: 0,
      biggestWin: 0,
      biggestLoss: 0,
      averageProfit: 0,
      winRate: 0,
      profitPerHand: 0,
      handsPlayed: 0,
      handsWon: 0,
      handsLost: 0,
      handsTied: 0,
      // 按阶段统计
      preflopActions: { fold: 0, call: 0, raise: 0, allin: 0 },
      flopActions: { fold: 0, call: 0, raise: 0, allin: 0 },
      turnActions: { fold: 0, call: 0, raise: 0, allin: 0 },
      riverActions: { fold: 0, call: 0, raise: 0, allin: 0 },
      // 盈利趋势（按日期）
      profitTrend: []
    };

    const profitByDate = {};

    records.forEach(record => {
      const player = record.players.find(p => p.userId === userId);
      if (player) {
        const profit = player.profit || 0;
        stats.totalProfit += profit;
        stats.totalHands++;
        
        // 统计手牌结果
        if (player.isWinner) {
          stats.totalWins++;
          stats.handsWon++;
        } else if (profit < 0) {
          stats.totalLosses++;
          stats.handsLost++;
        } else if (profit === 0) {
          stats.totalTies++;
          stats.handsTied++;
        }
        
        if (profit > 0 && profit > stats.biggestWin) {
          stats.biggestWin = profit;
        } else if (profit < 0 && profit < stats.biggestLoss) {
          stats.biggestLoss = profit;
        }

        // 统计动作
        if (record.actions) {
          record.actions.forEach(action => {
            if (action.playerId === userId || 
                (action.playerIndex !== undefined && record.players[action.playerIndex]?.userId === userId)) {
              const phaseActions = stats[`${action.phase}Actions`];
              if (phaseActions && action.action) {
                if (phaseActions[action.action] !== undefined) {
                  phaseActions[action.action]++;
                }
              }
            }
          });
        }

        // 按日期统计盈利
        if (record.timestamp) {
          const date = new Date(record.timestamp).toISOString().split('T')[0];
          if (!profitByDate[date]) {
            profitByDate[date] = 0;
          }
          profitByDate[date] += profit;
        }
      }
    });

    // 计算平均值和比率
    stats.averageProfit = stats.totalGames > 0 ? stats.totalProfit / stats.totalGames : 0;
    stats.winRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;
    stats.profitPerHand = stats.totalHands > 0 ? stats.totalProfit / stats.totalHands : 0;
    stats.handsPlayed = stats.totalHands;

    // 构建盈利趋势数据
    stats.profitTrend = Object.keys(profitByDate)
      .sort()
      .map(date => ({
        date,
        profit: profitByDate[date]
      }));

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取玩家统计失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

/**
 * 获取房间统计信息
 * GET /api/game-records/room/:roomId/stats
 */
router.get('/room/:roomId/stats', async (req, res) => {
  try {
    const { roomId } = req.params;
    const records = await MultiplayerGameRecord.find({ roomId })
      .sort({ timestamp: -1 });

    const stats = {
      totalHands: records.length,
      totalPlayers: 0,
      totalPot: 0,
      averagePot: 0,
      biggestPot: 0,
      players: {}
    };

    const playerSet = new Set();

    records.forEach(record => {
      // 统计底池
      const pot = record.finalResult?.pot || record.actions?.[record.actions.length - 1]?.pot || 0;
      stats.totalPot += pot;
      if (pot > stats.biggestPot) {
        stats.biggestPot = pot;
      }

      // 统计玩家
      if (record.players) {
        record.players.forEach(player => {
          playerSet.add(player.userId);
          
          if (!stats.players[player.userId]) {
            stats.players[player.userId] = {
              userId: player.userId,
              nickname: player.nickname,
              totalHands: 0,
              totalProfit: 0,
              wins: 0,
              losses: 0
            };
          }

          const playerStats = stats.players[player.userId];
          playerStats.totalHands++;
          playerStats.totalProfit += (player.profit || 0);
          
          if (player.isWinner) {
            playerStats.wins++;
          } else if ((player.profit || 0) < 0) {
            playerStats.losses++;
          }
        });
      }
    });

    stats.totalPlayers = playerSet.size;
    stats.averagePot = stats.totalHands > 0 ? stats.totalPot / stats.totalHands : 0;

    // 转换为数组并按盈利排序
    stats.players = Object.values(stats.players).sort((a, b) => b.totalProfit - a.totalProfit);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取房间统计失败:', error);
    res.status(500).json({ error: error.message || '查询失败' });
  }
});

module.exports = router;
