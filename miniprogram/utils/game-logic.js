// utils/game-logic.js
// 德州扑克游戏逻辑（适配小程序）

// 卡牌花色和点数
const suits = ['♠', '♥', '♦', '♣'];
const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 获取卡牌数值
function getCardValue(rank) {
  if (rank === 'A') return 14;
  if (rank === 'K') return 13;
  if (rank === 'Q') return 12;
  if (rank === 'J') return 11;
  return parseInt(rank);
}

// 创建一副牌
function createDeck() {
  const deck = [];
  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push({ suit, rank, value: getCardValue(rank) });
    }
  }
  return shuffleDeck(deck);
}

// 洗牌
function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 创建玩家
function createPlayer(id, name, isHuman = false, initialChips = 1000) {
  return {
    id: id,
    name: name,
    isHuman: isHuman,
    cards: [],
    chips: initialChips,
    currentBet: 0,
    action: null,
    folded: false,
    allIn: false
  };
}

// 初始化游戏
function initGame(playerCount = 2, settings = {}) {
  const initialChips = settings.initialChips || 1000;
  const smallBlind = settings.smallBlind || 10;
  const bigBlind = settings.bigBlind || 20;

  const deck = createDeck();
  const players = [];
  
  // 创建玩家
  players.push(createPlayer(0, '你', true, initialChips));
  for (let i = 1; i < playerCount; i++) {
    players.push(createPlayer(i, `AI${i}`, false, initialChips));
  }

  // 发牌
  for (let i = 0; i < 2; i++) {
    for (let player of players) {
      player.cards.push(deck.pop());
    }
  }

  // 设置庄家位置
  const dealerIndex = Math.floor(Math.random() * players.length);
  const smallBlindIndex = (dealerIndex + 1) % players.length;
  const bigBlindIndex = (dealerIndex + 2) % players.length;

  // 设置盲注
  const smallBlindPlayer = players[smallBlindIndex];
  const bigBlindPlayer = players[bigBlindIndex];
  
  smallBlindPlayer.chips -= smallBlind;
  smallBlindPlayer.currentBet = smallBlind;
  bigBlindPlayer.chips -= bigBlind;
  bigBlindPlayer.currentBet = bigBlind;

  const gameState = {
    deck: deck,
    players: players,
    communityCards: [],
    pot: smallBlind + bigBlind,
    currentBet: bigBlind,
    gamePhase: 'preflop',
    currentPlayerIndex: (bigBlindIndex + 1) % players.length,
    dealerIndex: dealerIndex,
    smallBlindIndex: smallBlindIndex,
    bigBlindIndex: bigBlindIndex,
    activePlayers: players.map(p => p.id),
    bettingRoundComplete: false,
    lastBet: bigBlind,
    actions: [] // 记录所有动作
  };

  return gameState;
}

// 处理玩家动作
function processAction(gameState, action) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const newState = JSON.parse(JSON.stringify(gameState)); // 深拷贝
  const currentPlayer = newState.players[newState.currentPlayerIndex];

  // 记录动作
  newState.actions.push({
    playerIndex: currentPlayer.id,
    action: action,
    phase: newState.gamePhase,
    timestamp: Date.now()
  });

  switch (action.type) {
    case 'bet':
      handleBet(newState, currentPlayer, action.amount);
      break;
    case 'call':
      handleCall(newState, currentPlayer);
      break;
    case 'check':
      handleCheck(newState, currentPlayer);
      break;
    case 'fold':
      handleFold(newState, currentPlayer);
      break;
    case 'allin':
      handleAllIn(newState, currentPlayer);
      break;
  }

  // 移动到下一个玩家
  moveToNextPlayer(newState);

  return newState;
}

// 处理下注
function handleBet(gameState, player, amount) {
  if (amount > player.chips) {
    throw new Error('筹码不足');
  }

  const additionalBet = amount - player.currentBet;
  player.chips -= additionalBet;
  player.currentBet = amount;
  gameState.pot += additionalBet;
  gameState.lastBet = amount;

  if (amount > gameState.currentBet) {
    gameState.currentBet = amount;
  }

  if (player.chips === 0) {
    player.allIn = true;
    player.action = 'allin';
  } else {
    player.action = amount > gameState.currentBet ? 'raise' : 'bet';
  }
}

// 处理跟注
function handleCall(gameState, player) {
  const callAmount = gameState.currentBet - player.currentBet;
  if (callAmount > player.chips) {
    // 全押
    handleAllIn(gameState, player);
    return;
  }

  player.chips -= callAmount;
  player.currentBet = gameState.currentBet;
  gameState.pot += callAmount;
  player.action = 'call';
}

// 处理过牌
function handleCheck(gameState, player) {
  if (player.currentBet < gameState.currentBet) {
    throw new Error('不能过牌，需要跟注或加注');
  }
  player.action = 'check';
}

// 处理弃牌
function handleFold(gameState, player) {
  player.action = 'fold';
  player.folded = true;
  gameState.activePlayers = gameState.activePlayers.filter(id => id !== player.id);
}

// 处理全押
function handleAllIn(gameState, player) {
  const allInAmount = player.chips;
  player.chips = 0;
  player.currentBet += allInAmount;
  gameState.pot += allInAmount;
  player.allIn = true;
  player.action = 'allin';

  if (player.currentBet > gameState.currentBet) {
    gameState.currentBet = player.currentBet;
    gameState.lastBet = player.currentBet;
  }
}

// 移动到下一个玩家
function moveToNextPlayer(gameState) {
  // 检查是否完成一轮下注
  if (isBettingRoundComplete(gameState)) {
    nextPhase(gameState);
    return;
  }

  // 移动到下一个活跃玩家
  do {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  } while (
    gameState.players[gameState.currentPlayerIndex].folded ||
    !gameState.activePlayers.includes(gameState.players[gameState.currentPlayerIndex].id)
  );
}

// 检查是否完成一轮下注
function isBettingRoundComplete(gameState) {
  const activePlayers = gameState.players.filter(
    p => !p.folded && gameState.activePlayers.includes(p.id)
  );

  if (activePlayers.length <= 1) {
    return true;
  }

  // 所有活跃玩家都已行动，且下注相等
  const allActed = activePlayers.every(p => p.action !== null);
  const allBetsEqual = activePlayers.every(
    p => p.currentBet === gameState.currentBet || p.allIn
  );

  return allActed && allBetsEqual;
}

// 进入下一阶段
function nextPhase(gameState) {
  // 重置玩家动作
  gameState.players.forEach(player => {
    if (!player.folded) {
      player.action = null;
      player.currentBet = 0;
    }
  });
  gameState.currentBet = 0;

  if (gameState.gamePhase === 'preflop') {
    gameState.gamePhase = 'flop';
    gameState.communityCards = [
      gameState.deck.pop(),
      gameState.deck.pop(),
      gameState.deck.pop()
    ];
  } else if (gameState.gamePhase === 'flop') {
    gameState.gamePhase = 'turn';
    gameState.communityCards.push(gameState.deck.pop());
  } else if (gameState.gamePhase === 'turn') {
    gameState.gamePhase = 'river';
    gameState.communityCards.push(gameState.deck.pop());
  } else if (gameState.gamePhase === 'river') {
    gameState.gamePhase = 'ended';
    determineWinner(gameState);
    return;
  }

  // 移动到第一个活跃玩家
  gameState.currentPlayerIndex = gameState.smallBlindIndex;
  while (
    gameState.players[gameState.currentPlayerIndex].folded ||
    !gameState.activePlayers.includes(gameState.players[gameState.currentPlayerIndex].id)
  ) {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
  }
}

// 确定获胜者
function determineWinner(gameState) {
  const activePlayers = gameState.players.filter(
    p => !p.folded && gameState.activePlayers.includes(p.id)
  );

  if (activePlayers.length === 1) {
    const winner = activePlayers[0];
    winner.chips += gameState.pot;
    gameState.finalResult = {
      winner: winner.id,
      message: `${winner.name} 获胜！获得 ${gameState.pot} 筹码`
    };
    return;
  }

  // 评估所有玩家的手牌
  const hands = activePlayers.map(player => ({
    player: player,
    hand: evaluateHand([...player.cards, ...gameState.communityCards])
  }));

  // 排序找出最佳手牌
  hands.sort((a, b) => {
    if (a.hand.rank !== b.hand.rank) {
      return b.hand.rank - a.hand.rank;
    }
    return b.hand.highCard - a.hand.highCard;
  });

  const bestHand = hands[0];
  const winners = hands
    .filter(
      h => h.hand.rank === bestHand.hand.rank && h.hand.highCard === bestHand.hand.highCard
    )
    .map(h => h.player);

  const potPerWinner = Math.floor(gameState.pot / winners.length);
  winners.forEach(winner => {
    winner.chips += potPerWinner;
  });

  if (winners.length === 1) {
    gameState.finalResult = {
      winner: winners[0].id,
      message: `${winners[0].name} 获胜！${bestHand.hand.name} 获得 ${potPerWinner} 筹码`
    };
  } else {
    const winnerNames = winners.map(w => w.name).join('、');
    gameState.finalResult = {
      winners: winners.map(w => w.id),
      message: `平局！${winnerNames} 都是 ${bestHand.hand.name}，各获得 ${potPerWinner} 筹码`
    };
  }
}

// 评估手牌（从Texas Hold'em poker/game.js移植）
function evaluateHand(cards) {
  const sortedCards = [...cards].sort((a, b) => b.value - a.value);
  const ranks = sortedCards.map(c => c.value);
  const suits = sortedCards.map(c => c.suit);

  const rankCounts = {};
  const suitCounts = {};

  ranks.forEach(r => (rankCounts[r] = (rankCounts[r] || 0) + 1));
  suits.forEach(s => (suitCounts[s] = (suitCounts[s] || 0) + 1));

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = Object.values(suitCounts).some(count => count >= 5);
  const isStraight = checkStraight(ranks);

  // 检查皇家同花顺
  if (
    isFlush &&
    isStraight &&
    ranks.includes(14) &&
    ranks.includes(13) &&
    ranks.includes(12) &&
    ranks.includes(11) &&
    ranks.includes(10)
  ) {
    return { name: '皇家同花顺', rank: 10, highCard: 14 };
  }

  // 检查同花顺
  if (isFlush && isStraight) {
    return { name: '同花顺', rank: 9, highCard: Math.max(...ranks) };
  }

  // 检查四条
  if (counts[0] === 4) {
    const fourOfKind = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 4));
    return { name: '四条', rank: 8, highCard: fourOfKind };
  }

  // 检查葫芦
  if (counts[0] === 3 && counts[1] === 2) {
    const threeOfKind = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 3));
    return { name: '葫芦', rank: 7, highCard: threeOfKind };
  }

  // 检查同花
  if (isFlush) {
    return { name: '同花', rank: 6, highCard: Math.max(...ranks) };
  }

  // 检查顺子
  if (isStraight) {
    return { name: '顺子', rank: 5, highCard: Math.max(...ranks) };
  }

  // 检查三条
  if (counts[0] === 3) {
    const threeOfKind = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 3));
    return { name: '三条', rank: 4, highCard: threeOfKind };
  }

  // 检查两对
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.keys(rankCounts)
      .filter(k => rankCounts[k] === 2)
      .map(k => parseInt(k))
      .sort((a, b) => b - a);
    return { name: '两对', rank: 3, highCard: pairs[0] };
  }

  // 检查一对
  if (counts[0] === 2) {
    const pair = parseInt(Object.keys(rankCounts).find(k => rankCounts[k] === 2));
    return { name: '一对', rank: 2, highCard: pair };
  }

  // 高牌
  return { name: '高牌', rank: 1, highCard: Math.max(...ranks) };
}

// 检查顺子
function checkStraight(ranks) {
  const uniqueRanks = [...new Set(ranks)].sort((a, b) => a - b);

  // 检查A-2-3-4-5的顺子
  if (
    uniqueRanks.includes(14) &&
    uniqueRanks.includes(2) &&
    uniqueRanks.includes(3) &&
    uniqueRanks.includes(4) &&
    uniqueRanks.includes(5)
  ) {
    return true;
  }

  // 检查其他顺子
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    let consecutive = true;
    for (let j = 1; j < 5; j++) {
      if (uniqueRanks[i + j] !== uniqueRanks[i] + j) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) return true;
  }

  return false;
}

// 获取AI动作（简单策略）
function getAIAction(gameState) {
  const player = gameState.players[gameState.currentPlayerIndex];
  const handStrength = evaluateHandStrength([...player.cards, ...gameState.communityCards]);
  const callAmount = gameState.currentBet - player.currentBet;

  // 简单AI策略
  if (handStrength > 0.7) {
    // 强牌，加注或全押
    if (player.chips > gameState.currentBet * 2) {
      return { type: 'bet', amount: Math.min(gameState.currentBet * 2, player.chips) };
    } else {
      return { type: 'allin' };
    }
  } else if (handStrength > 0.4) {
    // 中等牌力，跟注
    if (callAmount <= player.chips * 0.2) {
      return { type: 'call' };
    } else {
      return { type: 'fold' };
    }
  } else {
    // 弱牌，弃牌或过牌
    if (callAmount === 0) {
      return { type: 'check' };
    } else {
      return { type: 'fold' };
    }
  }
}

// 评估手牌强度
function evaluateHandStrength(cards) {
  if (cards.length < 5) return 0.3;

  const hand = evaluateHand(cards);
  const strengthMap = {
    高牌: 0.1,
    一对: 0.3,
    两对: 0.4,
    三条: 0.5,
    顺子: 0.6,
    同花: 0.65,
    葫芦: 0.75,
    四条: 0.9,
    同花顺: 0.95,
    皇家同花顺: 1.0
  };

  return strengthMap[hand.name] || 0.1;
}

module.exports = {
  initGame,
  processAction,
  getAIAction,
  evaluateHand,
  evaluateHandStrength
};
