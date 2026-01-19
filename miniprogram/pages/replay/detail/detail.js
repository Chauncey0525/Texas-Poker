// pages/replay/detail/detail.js
const gtoApi = require('../../../utils/gto-api.js');
const handEvaluator = require('../../../utils/hand-evaluator.js');

Page({
  data: {
    gameRecord: null,
    currentStep: 0,
    isReplaying: false,
    replaySpeed: 1000, // 回放速度（毫秒）
    gtoAnalysis: null,
    showAnalysis: false
  },

  onLoad(options) {
    const gameId = options.gameId;
    this.loadGameRecord(gameId);
  },

  // 加载游戏记录
  loadGameRecord(gameId) {
    const history = wx.getStorageSync('gameHistory') || [];
    const record = history.find(item => item.id === gameId);
    
    if (!record) {
      wx.showToast({
        title: '记录不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({
      gameRecord: record
    });
    
    // 如果有actions，分析GTO
    if (record.gameState && record.gameState.actions) {
      this.analyzeGTO();
    }
  },

  // 分析GTO
  async analyzeGTO() {
    const record = this.data.gameRecord;
    if (!record || !record.gameState) return;
    
    const analysis = {
      totalDecisions: 0,
      correctDecisions: 0,
      mistakes: [],
      decisions: []
    };
    
    // 分析每个决策点
    if (record.gameState.actions) {
      for (let i = 0; i < record.gameState.actions.length; i++) {
        const action = record.gameState.actions[i];
        if (action.playerIndex === 0) { // 用户决策
          analysis.totalDecisions++;
          
          // 获取该决策点的GTO建议
          try {
            const gameStateAtPoint = this.getGameStateAtAction(i);
            const gtoAdvice = await gtoApi.getAdvice(gameStateAtPoint);
            
            const isCorrect = this.isActionCorrect(action, gtoAdvice);
            if (isCorrect) {
              analysis.correctDecisions++;
            } else {
              analysis.mistakes.push({
                step: i,
                action: action,
                gtoAdvice: gtoAdvice
              });
            }
            
            analysis.decisions.push({
              step: i,
              action: action,
              gtoAdvice: gtoAdvice,
              isCorrect: isCorrect
            });
          } catch (error) {
            console.error('分析决策点失败', error);
          }
        }
      }
    }
    
    analysis.accuracy = analysis.totalDecisions > 0 
      ? Math.round((analysis.correctDecisions / analysis.totalDecisions) * 100) 
      : 0;
    
    this.setData({
      gtoAnalysis: analysis
    });
  },

  // 获取某个决策点的游戏状态
  getGameStateAtAction(actionIndex) {
    const record = this.data.gameRecord;
    const gameState = JSON.parse(JSON.stringify(record.gameState));
    
    // 重建到该决策点的状态
    const actions = gameState.actions.slice(0, actionIndex);
    // 这里需要根据actions重建游戏状态，简化处理
    return gameState;
  },

  // 判断动作是否正确
  isActionCorrect(action, gtoAdvice) {
    if (!gtoAdvice || !gtoAdvice.recommendedAction) return false;
    
    const actionMap = {
      'fold': 'fold',
      'check': 'call', // check在无需跟注时等同于call
      'call': 'call',
      'bet': 'raise',
      'raise': 'raise',
      'allin': 'raise'
    };
    
    const userAction = actionMap[action.action] || action.action;
    const recommended = gtoAdvice.recommendedAction.toLowerCase();
    
    // 如果GTO建议是call，check也算正确
    if (recommended === 'call' && (userAction === 'call' || userAction === 'check')) {
      return true;
    }
    
    return userAction === recommended;
  },

  // 开始回放
  startReplay() {
    this.setData({
      isReplaying: true,
      currentStep: 0
    });
    this.nextReplayStep();
  },

  // 下一步回放
  nextReplayStep() {
    if (!this.data.isReplaying) return;
    
    const record = this.data.gameRecord;
    const actions = record.gameState.actions || [];
    
    if (this.data.currentStep >= actions.length) {
      this.setData({
        isReplaying: false
      });
      return;
    }
    
    this.setData({
      currentStep: this.data.currentStep + 1
    });
    
    setTimeout(() => {
      this.nextReplayStep();
    }, this.data.replaySpeed);
  },

  // 停止回放
  stopReplay() {
    this.setData({
      isReplaying: false
    });
  },

  // 跳转到指定步骤
  jumpToStep(e) {
    const step = e.currentTarget.dataset.step;
    this.setData({
      currentStep: step,
      isReplaying: false
    });
  },

  // 显示分析
  showAnalysis() {
    this.setData({
      showAnalysis: true
    });
  },

  // 隐藏分析
  hideAnalysis() {
    this.setData({
      showAnalysis: false
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
  }
});
