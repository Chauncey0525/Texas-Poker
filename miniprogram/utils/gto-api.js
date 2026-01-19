// utils/gto-api.js
// GTO API调用封装

const app = getApp();

// 获取GTO建议
async function getAdvice(gameState) {
  try {
    // 构建请求参数
    const params = {
      hand: gameState.userHand || getCurrentHand(gameState),
      position: gameState.position || 'BTN',
      stackDepth: gameState.stackDepth || 100,
      communityCards: gameState.communityCards || [],
      pot: gameState.pot || 0,
      currentBet: gameState.currentBet || 0,
      gamePhase: gameState.gamePhase || 'preflop'
    };

    // 调用后端API（通过后端代理GTO API）
    const response = await wx.request({
      url: `${app.globalData.apiBaseUrl}/gto/advice`,
      method: 'POST',
      data: params,
      header: {
        'content-type': 'application/json'
      }
    });

    if (response.statusCode === 200 && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '获取GTO建议失败');
    }
  } catch (error) {
    console.error('GTO API调用失败', error);
    // 返回模拟数据（当API不可用时）
    return getMockAdvice(gameState);
  }
}

// 获取当前手牌
function getCurrentHand(gameState) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  return currentPlayer ? currentPlayer.cards : [];
}

// 获取范围建议
async function getRangeAdvice(position, stackDepth = 100) {
  try {
    const response = await wx.request({
      url: `${app.globalData.apiBaseUrl}/gto/range`,
      method: 'POST',
      data: {
        position: position,
        stackDepth: stackDepth
      },
      header: {
        'content-type': 'application/json'
      }
    });

    if (response.statusCode === 200 && response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '获取范围建议失败');
    }
  } catch (error) {
    console.error('范围API调用失败', error);
    return getMockRange(position);
  }
}

// 模拟GTO建议（当API不可用时）
function getMockAdvice(gameState) {
  const hand = gameState.userHand || getCurrentHand(gameState);
  const handStrength = estimateHandStrength(hand);

  // 简单的模拟逻辑
  if (handStrength > 0.7) {
    return {
      recommendedAction: 'raise',
      ev: '+0.5',
      frequencies: {
        fold: 0,
        call: 20,
        raise: 80
      }
    };
  } else if (handStrength > 0.4) {
    return {
      recommendedAction: 'call',
      ev: '+0.1',
      frequencies: {
        fold: 30,
        call: 60,
        raise: 10
      }
    };
  } else {
    return {
      recommendedAction: 'fold',
      ev: '-0.2',
      frequencies: {
        fold: 80,
        call: 15,
        raise: 5
      }
    };
  }
}

// 模拟范围（当API不可用时）
function getMockRange(position) {
  // 简化的范围数据
  const ranges = {
    UTG: { tight: true, percentage: 15 },
    'UTG+1': { tight: true, percentage: 18 },
    MP: { tight: false, percentage: 22 },
    'MP+1': { tight: false, percentage: 25 },
    CO: { tight: false, percentage: 30 },
    BTN: { tight: false, percentage: 40 },
    SB: { tight: false, percentage: 35 },
    BB: { tight: false, percentage: 50 }
  };

  return ranges[position] || ranges.BTN;
}

// 估算手牌强度（简化）
function estimateHandStrength(hand) {
  if (!hand || hand.length !== 2) return 0.3;

  const [card1, card2] = hand;
  const isPair = card1.rank === card2.rank;
  const highCard = Math.max(card1.value, card2.value);

  if (isPair) {
    if (highCard >= 10) return 0.8;
    if (highCard >= 7) return 0.6;
    return 0.4;
  }

  if (highCard === 14) return 0.7;
  if (highCard >= 12) return 0.5;
  return 0.3;
}

module.exports = {
  getAdvice,
  getRangeAdvice
};
