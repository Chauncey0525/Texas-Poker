// backend/services/gto-service.js
const axios = require('axios');

// GTO API配置
const GTO_API_URL = process.env.GTO_API_URL || 'https://your-gto-api.com';
const GTO_API_KEY = process.env.GTO_API_KEY || '';

// 缓存
const cache = new Map();
const CACHE_EXPIRE_TIME = 7 * 24 * 60 * 60 * 1000; // 7天

// 获取GTO建议
async function getAdvice(params) {
  const cacheKey = generateCacheKey(params);
  
  // 检查缓存
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 调用外部GTO API
    const response = await axios.post(`${GTO_API_URL}/advice`, params, {
      headers: {
        'Authorization': `Bearer ${GTO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const advice = response.data;
    
    // 缓存结果
    saveToCache(cacheKey, advice);
    
    return advice;
  } catch (error) {
    console.error('GTO API调用失败', error);
    
    // API不可用时返回模拟数据
    return getMockAdvice(params);
  }
}

// 获取范围建议
async function getRange(position, stackDepth) {
  const cacheKey = `range_${position}_${stackDepth}`;
  
  // 检查缓存
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // 调用外部GTO API
    const response = await axios.post(`${GTO_API_URL}/range`, {
      position,
      stackDepth
    }, {
      headers: {
        'Authorization': `Bearer ${GTO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    const range = response.data;
    
    // 缓存结果
    saveToCache(cacheKey, range);
    
    return range;
  } catch (error) {
    console.error('范围API调用失败', error);
    
    // API不可用时返回模拟数据
    return getMockRange(position);
  }
}

// 生成缓存键
function generateCacheKey(params) {
  const { hand, position, stackDepth, communityCards, pot, currentBet, gamePhase } = params;
  const handStr = hand.map(c => `${c.rank}${c.suit}`).sort().join('');
  const communityStr = communityCards.map(c => `${c.rank}${c.suit}`).sort().join('');
  return `advice_${handStr}_${position}_${stackDepth}_${communityStr}_${pot}_${currentBet}_${gamePhase}`;
}

// 从缓存获取
function getFromCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() - cached.timestamp > CACHE_EXPIRE_TIME) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

// 保存到缓存
function saveToCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // 限制缓存大小
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}

// 模拟GTO建议（当API不可用时）
function getMockAdvice(params) {
  const { hand, position, stackDepth } = params;
  
  // 简单的模拟逻辑
  const handStrength = estimateHandStrength(hand);
  
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
  const ranges = {
    UTG: { tight: true, percentage: 15, hands: [] },
    'UTG+1': { tight: true, percentage: 18, hands: [] },
    MP: { tight: false, percentage: 22, hands: [] },
    'MP+1': { tight: false, percentage: 25, hands: [] },
    CO: { tight: false, percentage: 30, hands: [] },
    BTN: { tight: false, percentage: 40, hands: [] },
    SB: { tight: false, percentage: 35, hands: [] },
    BB: { tight: false, percentage: 50, hands: [] }
  };
  
  return ranges[position] || ranges.BTN;
}

// 估算手牌强度
function estimateHandStrength(hand) {
  if (!hand || hand.length !== 2) return 0.3;
  
  const [card1, card2] = hand;
  const isPair = card1.rank === card2.rank;
  const highCard = Math.max(card1.value || 0, card2.value || 0);
  
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
  getRange
};
