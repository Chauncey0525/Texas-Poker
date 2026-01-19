// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// 用户登录/注册
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body; // 微信登录code

    // 这里应该调用微信API获取openId
    // 暂时使用模拟数据
    const openId = `mock_openid_${Date.now()}`;

    let user = await User.findOne({ openId });
    if (!user) {
      user = new User({
        openId,
        nickname: `用户${Date.now().toString().slice(-6)}`,
        stats: {
          totalGames: 0,
          accuracy: 0,
          winRate: 0
        }
      });
      await user.save();
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        openId: user.openId,
        nickname: user.nickname
      }
    });
  } catch (error) {
    console.error('用户登录失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '用户登录失败'
    });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('更新用户信息失败', error);
    res.status(500).json({
      success: false,
      message: error.message || '更新用户信息失败'
    });
  }
});

module.exports = router;
