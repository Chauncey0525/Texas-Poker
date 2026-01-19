// utils/range-data.js
// GTO起手牌范围数据（基于常见策略）

// 不同位置的起手牌范围
const positionRanges = {
  // UTG (Under The Gun) - 最紧的范围
  UTG: {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true,
    'AJs': true, 'KQs': true, 'KJs': true, 'QJs': true,
    '99': true, '88': true, '77': true, '66': true,
    'A10s': true, 'A9s': true, 'K10s': true, 'Q10s': true,
    'J10s': true, '109s': true, '98s': true, '87s': true,
    '76s': true, '65s': true, '54s': true
  },
  
  // UTG+1 - 稍宽一些
  'UTG+1': {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true, 'AJo': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'QJs': true, 'QJo': true,
    'J10s': true, '109s': true, '98s': true, '88': true, '77': true, '66': true,
    'A10s': true, 'A9s': true, 'A8s': true, 'A7s': true, 'A6s': true, 'A5s': true,
    'K10s': true, 'Q10s': true, 'J9s': true, '108s': true, '97s': true,
    '87s': true, '76s': true, '65s': true, '54s': true, '43s': true
  },
  
  // MP (Middle Position) - 中等范围
  MP: {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true, '88': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true, 'AJo': true,
    'A10s': true, 'A10o': true, 'A9s': true, 'A8s': true, 'A7s': true, 'A6s': true,
    'A5s': true, 'A4s': true, 'A3s': true, 'A2s': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'KJo': true, 'K10s': true,
    'QJs': true, 'QJo': true, 'Q10s': true, 'J10s': true, 'J9s': true,
    '109s': true, '108s': true, '98s': true, '97s': true,
    '87s': true, '86s': true, '76s': true, '75s': true, '65s': true, '64s': true,
    '54s': true, '53s': true, '43s': true, '77': true, '66': true, '55': true
  },
  
  // MP+1 - 更宽
  'MP+1': {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true, '88': true, '77': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true, 'AJo': true,
    'A10s': true, 'A10o': true, 'A9s': true, 'A9o': true, 'A8s': true, 'A7s': true,
    'A6s': true, 'A5s': true, 'A4s': true, 'A3s': true, 'A2s': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'KJo': true, 'K10s': true, 'K10o': true,
    'QJs': true, 'QJo': true, 'Q10s': true, 'Q10o': true, 'J10s': true, 'J10o': true,
    'J9s': true, '109s': true, '108s': true, '98s': true, '97s': true,
    '87s': true, '86s': true, '76s': true, '75s': true, '65s': true, '64s': true,
    '54s': true, '53s': true, '43s': true, '32s': true,
    '66': true, '55': true, '44': true, '33': true, '22': true
  },
  
  // CO (Cut Off) - 较宽
  CO: {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true, '88': true, '77': true, '66': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true, 'AJo': true,
    'A10s': true, 'A10o': true, 'A9s': true, 'A9o': true, 'A8s': true, 'A8o': true,
    'A7s': true, 'A6s': true, 'A5s': true, 'A4s': true, 'A3s': true, 'A2s': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'KJo': true, 'K10s': true, 'K10o': true,
    'K9s': true, 'QJs': true, 'QJo': true, 'Q10s': true, 'Q10o': true, 'Q9s': true,
    'J10s': true, 'J10o': true, 'J9s': true, 'J8s': true,
    '109s': true, '108s': true, '98s': true, '97s': true, '96s': true,
    '87s': true, '86s': true, '76s': true, '75s': true, '65s': true, '64s': true,
    '54s': true, '53s': true, '43s': true, '32s': true,
    '55': true, '44': true, '33': true, '22': true
  },
  
  // BTN (Button) - 最宽
  BTN: {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true, '88': true, '77': true, '66': true, '55': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true, 'AJo': true,
    'A10s': true, 'A10o': true, 'A9s': true, 'A9o': true, 'A8s': true, 'A8o': true,
    'A7s': true, 'A7o': true, 'A6s': true, 'A5s': true, 'A4s': true, 'A3s': true, 'A2s': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'KJo': true, 'K10s': true, 'K10o': true,
    'K9s': true, 'K9o': true, 'K8s': true, 'QJs': true, 'QJo': true, 'Q10s': true, 'Q10o': true,
    'Q9s': true, 'Q8s': true, 'J10s': true, 'J10o': true, 'J9s': true, 'J8s': true, 'J7s': true,
    '109s': true, '108s': true, '107s': true, '98s': true, '97s': true, '96s': true,
    '87s': true, '86s': true, '85s': true, '76s': true, '75s': true, '74s': true,
    '65s': true, '64s': true, '63s': true, '54s': true, '53s': true, '52s': true,
    '43s': true, '42s': true, '32s': true,
    '44': true, '33': true, '22': true
  },
  
  // SB (Small Blind) - 较紧（因为位置不利）
  SB: {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true, '88': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true, 'AJo': true,
    'A10s': true, 'A10o': true, 'A9s': true, 'A8s': true, 'A7s': true,
    'A6s': true, 'A5s': true, 'A4s': true, 'A3s': true, 'A2s': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'KJo': true, 'K10s': true,
    'QJs': true, 'QJo': true, 'Q10s': true, 'J10s': true, 'J9s': true,
    '109s': true, '108s': true, '98s': true, '97s': true,
    '87s': true, '86s': true, '76s': true, '75s': true, '65s': true,
    '54s': true, '53s': true, '43s': true,
    '77': true, '66': true, '55': true, '44': true, '33': true, '22': true
  },
  
  // BB (Big Blind) - 最紧（位置最不利）
  BB: {
    'AA': true, 'KK': true, 'QQ': true, 'JJ': true, '1010': true, '99': true,
    'AKs': true, 'AKo': true, 'AQs': true, 'AQo': true, 'AJs': true,
    'A10s': true, 'A9s': true, 'A8s': true, 'A7s': true,
    'A6s': true, 'A5s': true, 'A4s': true, 'A3s': true, 'A2s': true,
    'KQs': true, 'KQo': true, 'KJs': true, 'K10s': true,
    'QJs': true, 'QJo': true, 'Q10s': true, 'J10s': true,
    '109s': true, '98s': true, '87s': true, '76s': true, '65s': true,
    '54s': true, '53s': true, '43s': true,
    '88': true, '77': true, '66': true, '55': true, '44': true, '33': true, '22': true
  }
};

// 获取指定位置的起手牌范围
function getRangeForPosition(position) {
  return positionRanges[position] || {};
}

// 计算范围的百分比
function calculateRangePercentage(range) {
  const totalHands = 169; // 总共169种起手牌组合（13对子 + 78同花 + 78不同花）
  const handsInRange = Object.keys(range).filter(hand => range[hand]).length;
  return Math.round((handsInRange / totalHands) * 100);
}

// 检查手牌是否在范围内
function isHandInRange(hand, range) {
  return range[hand] === true;
}

module.exports = {
  positionRanges,
  getRangeForPosition,
  calculateRangePercentage,
  isHandInRange
};
