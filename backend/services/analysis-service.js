// backend/services/analysis-service.js
const GameRecord = require('../models/game-record');

// 分析游戏记录
async function analyzeGame(gameRecord) {
  const analysis = {
    totalDecisions: 0,
    correctDecisions: 0,
    mistakes: [],
    accuracy: 0,
    gtoComparison: []
  };

  // 分析每个决策点
  if (gameRecord.actions && gameRecord.actions.length > 0) {
    gameRecord.actions.forEach(action => {
      analysis.totalDecisions++;
      
      // 这里应该对比GTO建议和实际决策
      // 暂时使用简化逻辑
      if (action.gtoAdvice && action.gtoAdvice.recommendedAction === action.action) {
        analysis.correctDecisions++;
      } else {
        analysis.mistakes.push({
          phase: action.phase,
          action: action.action,
          gtoAdvice: action.gtoAdvice
        });
      }
    });
  }

  analysis.accuracy = analysis.totalDecisions > 0 
    ? Math.round((analysis.correctDecisions / analysis.totalDecisions) * 100) 
    : 0;

  return analysis;
}

// 获取用户统计数据
async function getUserStats(userId) {
  const records = await GameRecord.find({ userId });
  
  const stats = {
    totalGames: records.length,
    totalDecisions: 0,
    correctDecisions: 0,
    accuracy: 0,
    winRate: 0,
    commonMistakes: []
  };

  records.forEach(record => {
    if (record.gtoAnalysis) {
      stats.totalDecisions += record.gtoAnalysis.totalDecisions || 0;
      stats.correctDecisions += record.gtoAnalysis.correctDecisions || 0;
    }
    
    if (record.finalResult && record.finalResult.winner === userId) {
      stats.winRate++;
    }
  });

  stats.accuracy = stats.totalDecisions > 0 
    ? Math.round((stats.correctDecisions / stats.totalDecisions) * 100) 
    : 0;
    
  stats.winRate = stats.totalGames > 0 
    ? Math.round((stats.winRate / stats.totalGames) * 100) 
    : 0;

  return stats;
}

module.exports = {
  analyzeGame,
  getUserStats
};
