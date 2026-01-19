// backend/routes/gto.js
const express = require('express');
const router = express.Router();
const gtoService = require('../services/gto-service');

// 获取GTO建议
router.post('/advice', async (req, res) => {
  try {
    const { hand, position, stackDepth, communityCards, pot, currentBet, gamePhase } = req.body;

    if (!hand || hand.length !== 2) {
      return res.status(400).json({
        success: false,
        message: '手牌数据无效'
      });
    }

    const advice = await gtoService.getAdvice({
      hand,
      position,
      stackDepth: stackDepth || 100,
      communityCards: communityCards || [],
      pot: pot || 0,
      currentBet: currentBet || 0,
      gamePhase: gamePhase || 'preflop'
    });

    res.json({
      success: true,
      data: advice
    });
  } catch (error) {
    console.error('获取GTO建议失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取GTO建议失败'
    });
  }
});

// 获取范围建议
router.post('/range', async (req, res) => {
  try {
    const { position, stackDepth } = req.body;

    if (!position) {
      return res.status(400).json({
        success: false,
        message: '位置参数缺失'
      });
    }

    const range = await gtoService.getRange(position, stackDepth || 100);

    res.json({
      success: true,
      data: range
    });
  } catch (error) {
    console.error('获取范围建议失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取范围建议失败'
    });
  }
});

module.exports = router;
