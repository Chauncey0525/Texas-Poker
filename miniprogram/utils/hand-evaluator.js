// utils/hand-evaluator.js
const gameLogic = require('./game-logic.js');

// 分析手牌
function analyzeHand(cards) {
  if (cards.length < 2) {
    return {
      handType: '未知',
      strength: 0,
      winRate: null
    };
  }

  const hand = gameLogic.evaluateHand(cards);
  const strength = gameLogic.evaluateHandStrength(cards);

  // 计算胜率（简化版本，实际应该使用蒙特卡洛模拟）
  const winRate = estimateWinRate(cards);

  return {
    handType: hand.name,
    strength: strength,
    winRate: winRate,
    handRank: hand.rank,
    highCard: hand.highCard
  };
}

// 估算胜率（简化版本）
function estimateWinRate(cards) {
  if (cards.length < 2) return null;
  if (cards.length === 2) {
    // 翻牌前胜率表（简化）
    return estimatePreflopWinRate(cards);
  }

  // 翻牌后使用手牌强度估算
  const strength = gameLogic.evaluateHandStrength(cards);
  return Math.round(strength * 100);
}

// 估算翻牌前胜率（简化版本）
function estimatePreflopWinRate(cards) {
  const [card1, card2] = cards;
  const isPair = card1.rank === card2.rank;
  const isSuited = card1.suit === card2.suit;
  const highCard = Math.max(card1.value, card2.value);
  const lowCard = Math.min(card1.value, card2.value);

  // 简化的胜率估算
  if (isPair) {
    if (highCard >= 10) return 80; // 高对
    if (highCard >= 7) return 60; // 中对
    return 40; // 低对
  }

  if (highCard === 14 && lowCard >= 10) {
    // AK, AQ, AJ, A10
    return isSuited ? 70 : 65;
  }

  if (highCard >= 12 && lowCard >= 10) {
    // KQ, KJ, QJ等
    return isSuited ? 60 : 55;
  }

  if (highCard - lowCard <= 4 && highCard >= 10) {
    // 连牌
    return isSuited ? 50 : 45;
  }

  return 30; // 其他牌
}

module.exports = {
  analyzeHand,
  estimateWinRate
};
