// pages/replay/detail/detail.js
const gtoApi = require('../../../utils/gto-api.js');
const handEvaluator = require('../../../utils/hand-evaluator.js');
const gameRecordApi = require('../../../utils/game-record-api.js');

Page({
  data: {
    gameRecord: null,
    currentStep: 0,
    isReplaying: false,
    replaySpeed: 1000, // 回放速度（毫秒）
    gtoAnalysis: null,
    showAnalysis: false,
    isMultiplayer: false, // 是否为多人对局
    replaySteps: [], // 回放步骤列表
    currentReplayState: null // 当前回放状态
  },

  onLoad(options) {
    const gameId = options.gameId;
    const recordId = options.recordId; // 多人对局记录ID
    const roomId = options.roomId; // 房间ID
    
    if (recordId) {
      // 多人对局回放
      this.loadMultiplayerRecord(recordId);
    } else if (roomId) {
      // 从房间ID加载最新记录
      this.loadRoomLatestRecord(roomId);
    } else {
      // 单人游戏回放
      this.loadGameRecord(gameId);
    }
  },

  // 加载多人对局记录
  async loadMultiplayerRecord(recordId) {
    wx.showLoading({ title: '加载中...' });
    try {
      const record = await gameRecordApi.getRecordDetail(recordId);
      this.setData({
        gameRecord: record,
        isMultiplayer: true
      });
      
      // 构建回放步骤
      this.buildReplaySteps(record);
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载房间最新记录
  async loadRoomLatestRecord(roomId) {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await gameRecordApi.getRecordsByRoom(roomId, { limit: 1 });
      if (result.records && result.records.length > 0) {
        const record = result.records[0];
        this.setData({
          gameRecord: record,
          isMultiplayer: true
        });
        this.buildReplaySteps(record);
      } else {
        throw new Error('未找到对局记录');
      }
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载游戏记录（单人）
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
      gameRecord: record,
      isMultiplayer: false
    });
    
    // 如果有actions，分析GTO
    if (record.gameState && record.gameState.actions) {
      this.analyzeGTO();
    }
  },

  // 构建回放步骤（多人对局）
  buildReplaySteps(record) {
    if (!record.actions || record.actions.length === 0) {
      return;
    }

    const steps = [];
    let currentState = {
      phase: 'preflop',
      pot: 0,
      currentBet: 0,
      communityCards: [],
      players: record.players.map(p => ({
        ...p,
        currentBet: 0,
        folded: false
      }))
    };

    // 初始化阶段
    steps.push({
      step: 0,
      phase: 'preflop',
      action: null,
      state: JSON.parse(JSON.stringify(currentState)),
      description: '游戏开始'
    });

    // 按时间顺序处理每个动作
    record.actions.forEach((action, index) => {
      // 更新状态
      if (action.phase && action.phase !== currentState.phase) {
        currentState.phase = action.phase;
        if (action.phase === 'flop') {
          currentState.communityCards = record.communityCards.slice(0, 3);
        } else if (action.phase === 'turn') {
          currentState.communityCards = record.communityCards.slice(0, 4);
        } else if (action.phase === 'river') {
          currentState.communityCards = record.communityCards;
        }
      }

      const player = currentState.players[action.playerIndex];
      if (player) {
        if (action.action === 'fold') {
          player.folded = true;
        } else if (action.action === 'bet' || action.action === 'raise') {
          player.currentBet = action.amount;
          currentState.currentBet = action.amount;
        } else if (action.action === 'call') {
          player.currentBet = action.amount;
        }
      }

      currentState.pot = action.pot || currentState.pot;
      currentState.currentBet = action.currentBet || currentState.currentBet;

      steps.push({
        step: index + 1,
        phase: currentState.phase,
        action: action,
        state: JSON.parse(JSON.stringify(currentState)),
        description: this.getActionDescription(action, currentState.players)
      });
    });

    this.setData({ replaySteps: steps });
  },

  // 获取动作描述
  getActionDescription(action, players) {
    const player = players[action.playerIndex];
    const playerName = player ? player.nickname : `玩家${action.playerIndex + 1}`;
    const actionMap = {
      'fold': '弃牌',
      'check': '过牌',
      'call': `跟注 ${action.amount}`,
      'bet': `下注 ${action.amount}`,
      'raise': `加注 ${action.amount}`,
      'allin': `全押 ${action.amount}`
    };
    return `${playerName} ${actionMap[action.action] || action.action}`;
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
    if (this.data.isMultiplayer && this.data.replaySteps.length > 0) {
      // 多人对局回放
      this.setData({
        isReplaying: true,
        currentStep: 0,
        currentReplayState: this.data.replaySteps[0].state
      });
      this.nextMultiplayerReplayStep();
    } else {
      // 单人游戏回放
      this.setData({
        isReplaying: true,
        currentStep: 0
      });
      this.nextReplayStep();
    }
  },

  // 下一步回放（多人对局）
  nextMultiplayerReplayStep() {
    if (!this.data.isReplaying) return;
    
    const steps = this.data.replaySteps;
    
    if (this.data.currentStep >= steps.length - 1) {
      this.setData({
        isReplaying: false
      });
      return;
    }
    
    const nextStep = this.data.currentStep + 1;
    this.setData({
      currentStep: nextStep,
      currentReplayState: steps[nextStep].state
    });
    
    setTimeout(() => {
      this.nextMultiplayerReplayStep();
    }, this.data.replaySpeed);
  },

  // 下一步回放（单人游戏）
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
    if (this.data.isMultiplayer && this.data.replaySteps.length > 0) {
      const steps = this.data.replaySteps;
      if (step >= 0 && step < steps.length) {
        this.setData({
          currentStep: step,
          isReplaying: false,
          currentReplayState: steps[step].state
        });
      }
    } else {
      this.setData({
        currentStep: step,
        isReplaying: false
      });
    }
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
  },

  // 分享对局
  onShareAppMessage() {
    const { gameRecord, isMultiplayer } = this.data;
    if (!gameRecord) {
      return {};
    }

    const title = isMultiplayer 
      ? `精彩对局：${gameRecord.roomName || '多人对局'}`
      : '我的德州扑克对局';
    
    const description = isMultiplayer
      ? `底池：${gameRecord.finalResult?.pot || 0}，${gameRecord.players?.length || 0}人参与`
      : `准确率：${this.data.gtoAnalysis?.accuracy || 0}%`;

    return {
      title,
      path: `/pages/replay/detail/detail?${isMultiplayer ? `recordId=${gameRecord._id}` : `gameId=${gameRecord.id}`}`,
      imageUrl: '' // 可以添加对局截图
    };
  },

  // 生成分享图片（截图）
  async generateShareImage() {
    wx.showLoading({ title: '生成中...' });
    
    try {
      // 使用canvas生成分享图片
      const ctx = wx.createCanvasContext('shareCanvas');
      const { gameRecord, isMultiplayer } = this.data;
      
      // 绘制背景
      ctx.setFillStyle('#1a1a2e');
      ctx.fillRect(0, 0, 750, 1334);
      
      // 绘制标题
      ctx.setFillStyle('#ffffff');
      ctx.setFontSize(40);
      ctx.fillText(isMultiplayer ? '精彩对局' : '我的对局', 375, 100);
      
      // 绘制对局信息
      ctx.setFontSize(28);
      if (isMultiplayer) {
        ctx.fillText(`房间：${gameRecord.roomName || '多人对局'}`, 375, 200);
        ctx.fillText(`底池：${gameRecord.finalResult?.pot || 0}`, 375, 250);
        ctx.fillText(`玩家数：${gameRecord.players?.length || 0}`, 375, 300);
      } else {
        ctx.fillText(`准确率：${this.data.gtoAnalysis?.accuracy || 0}%`, 375, 200);
        ctx.fillText(`总决策：${this.data.gtoAnalysis?.totalDecisions || 0}`, 375, 250);
      }
      
      // 绘制时间
      ctx.setFontSize(24);
      ctx.setFillStyle('#a0a0a0');
      ctx.fillText(this.formatTime(gameRecord.timestamp), 375, 350);
      
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'shareCanvas',
          success: (res) => {
            wx.hideLoading();
            // 保存图片到相册
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: () => {
                wx.showToast({
                  title: '图片已保存',
                  icon: 'success'
                });
              },
              fail: () => {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                });
              }
            });
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({
              title: '生成失败',
              icon: 'none'
            });
          }
        });
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '生成失败',
        icon: 'none'
      });
    }
  },

  // 复制分享链接
  onCopyShareLink() {
    const { gameRecord, isMultiplayer } = this.data;
    if (!gameRecord) {
      wx.showToast({
        title: '对局信息不存在',
        icon: 'none'
      });
      return;
    }

    // 生成分享链接（实际应用中应该使用短链接服务）
    const shareLink = `https://your-domain.com/replay?${isMultiplayer ? `recordId=${gameRecord._id}` : `gameId=${gameRecord.id}`}`;
    
    wx.setClipboardData({
      data: shareLink,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  }
});
