// pages/hand-analyzer/hand-analyzer.js
const handEvaluator = require('../../utils/hand-evaluator.js');
const gameLogic = require('../../utils/game-logic.js');

Page({
  data: {
    userHand: [],
    communityCards: [],
    analysis: null
  },

  onLoad() {
    // 初始化
  },

  // 手牌变化
  onHandChange(e) {
    const hand = e.detail.hand;
    this.setData({
      userHand: hand
    });
    
    // 如果手牌和公共牌都有了，自动分析
    if (hand.length === 2 && this.data.communityCards.length > 0) {
      this.analyze();
    }
  },

  // 公共牌变化
  onCommunityCardsChange(e) {
    const cards = e.detail.cards;
    this.setData({
      communityCards: cards
    });
    
    // 如果手牌和公共牌都有了，自动分析
    if (this.data.userHand.length === 2 && cards.length > 0) {
      this.analyze();
    }
  },

  // 分析手牌
  analyze() {
    if (this.data.userHand.length !== 2) {
      wx.showToast({
        title: '请先选择手牌',
        icon: 'none'
      });
      return;
    }

    const allCards = [...this.data.userHand, ...this.data.communityCards];
    
    // 如果只有手牌，计算翻牌前胜率
    if (this.data.communityCards.length === 0) {
      const analysis = handEvaluator.analyzeHand(this.data.userHand);
      // 格式化数据用于显示
      const strengthPercent = analysis.strength ? Math.round(analysis.strength * 100) : 0;
      const possibleHandsText = analysis.possibleHands && analysis.possibleHands.length > 0 
        ? analysis.possibleHands.join(', ') 
        : '';
      
      this.setData({
        analysis: {
          ...analysis,
          stage: 'preflop',
          message: '翻牌前分析',
          strengthPercent: strengthPercent,
          possibleHandsText: possibleHandsText
        }
      });
      return;
    }
    
    // 如果有公共牌，评估完整手牌
    const hand = gameLogic.evaluateHand(allCards);
    const strength = gameLogic.evaluateHandStrength(allCards);
    const winRate = handEvaluator.estimateWinRate(allCards);
    
    // 分析可能的成牌组合
    const possibleHands = this.analyzePossibleHands(allCards);
    
    // 格式化数据用于显示
    const strengthPercent = Math.round(strength * 100);
    const winRatePercent = winRate ? Math.round(winRate) : null;
    const possibleHandsText = possibleHands.length > 0 ? possibleHands.join(', ') : '';
    
    this.setData({
      analysis: {
        handType: hand.name,
        handRank: hand.rank,
        highCard: hand.highCard,
        strength: strength,
        strengthPercent: strengthPercent, // 格式化后的百分比
        winRate: winRate,
        winRatePercent: winRatePercent, // 格式化后的胜率
        stage: this.getStage(),
        possibleHands: possibleHands,
        possibleHandsText: possibleHandsText, // 格式化后的成牌文本
        message: this.getAnalysisMessage(hand, strength)
      }
    });
  },

  // 分析可能的成牌组合
  analyzePossibleHands(cards) {
    if (cards.length < 5) return [];
    
    const hand = gameLogic.evaluateHand(cards);
    const hands = [hand.name];
    
    // 如果已经有5张牌，分析可能的改进
    if (cards.length === 5) {
      // 可以添加更多分析逻辑
    }
    
    return hands;
  },

  // 获取游戏阶段
  getStage() {
    const count = this.data.communityCards.length;
    if (count === 0) return 'preflop';
    if (count === 3) return 'flop';
    if (count === 4) return 'turn';
    if (count === 5) return 'river';
    return 'unknown';
  },

  // 获取分析消息
  getAnalysisMessage(hand, strength) {
    if (strength > 0.8) return '非常强的牌！';
    if (strength > 0.6) return '强牌，值得下注';
    if (strength > 0.4) return '中等牌力，谨慎决策';
    return '牌力较弱，考虑弃牌';
  }
});
