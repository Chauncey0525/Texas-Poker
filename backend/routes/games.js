// backend/routes/games.js
const express = require('express');
const router = express.Router();
const GameRecord = require('../models/game-record');

// 保存游戏记录
router.post('/save', async (req, res) => {
  try {
    const gameRecord = new GameRecord(req.body);
    await gameRecord.save();

    res.json({
      success: true,
      data: gameRecord
    });
  } catch (error) {
    console.error('保存游戏记录失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '保存游戏记录失败'
    });
  }
});

// 获取游戏记录列表
router.get('/list', async (req, res) => {
  try {
    const { userId, page = 1, limit = 20 } = req.query;
    const query = userId ? { userId } : {};

    const records = await GameRecord.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await GameRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取游戏记录失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取游戏记录失败'
    });
  }
});

// 获取游戏记录详情
router.get('/:id', async (req, res) => {
  try {
    const record = await GameRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: '记录不存在'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('获取游戏记录详情失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取游戏记录详情失败'
    });
  }
});

// 删除游戏记录
router.delete('/:id', async (req, res) => {
  try {
    await GameRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除游戏记录失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '删除游戏记录失败'
    });
  }
});

module.exports = router;
