// backend/routes/analysis.js
const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysis-service');

// 分析游戏记录
router.post('/game', async (req, res) => {
  try {
    const { gameRecord } = req.body;

    if (!gameRecord) {
      return res.status(400).json({
        success: false,
        message: '游戏记录数据缺失'
      });
    }

    const analysis = await analysisService.analyzeGame(gameRecord);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('分析游戏记录失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '分析游戏记录失败'
    });
  }
});

// 获取用户统计数据
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await analysisService.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取统计数据失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取统计数据失败'
    });
  }
});

module.exports = router;
