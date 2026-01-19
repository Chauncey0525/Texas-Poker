// utils/knowledge-data.js
// 知识库文章数据

const articles = [
  {
    id: '1',
    title: 'GTO基础理论',
    category: 'basics',
    categoryName: '基础知识',
    date: '2026-01-19',
    summary: '了解博弈论最优策略的基本概念',
    content: `
      <h2>什么是GTO？</h2>
      <p>GTO（Game Theory Optimal，博弈论最优）是一种策略理论，它基于数学和博弈论原理，旨在找到在任何情况下都不会被对手利用的策略。</p>
      
      <h2>GTO的核心概念</h2>
      <h3>1. 平衡策略</h3>
      <p>GTO策略是平衡的，意味着它不会给对手任何可预测的模式。通过混合不同的动作（弃牌、跟注、加注），使得对手无法通过观察你的行为来获得优势。</p>
      
      <h3>2. 频率</h3>
      <p>GTO策略不是每次都做相同的动作，而是按照特定的频率执行不同的动作。例如，在某个情况下，可能70%的时间加注，30%的时间跟注。</p>
      
      <h3>3. 不可剥削性</h3>
      <p>GTO策略的核心优势是它不会被对手利用。即使对手知道你的策略，也无法通过调整自己的策略来获得优势。</p>
      
      <h2>GTO vs 剥削性策略</h2>
      <p><strong>GTO策略</strong>：平衡、不可剥削，适合对抗高水平对手。</p>
      <p><strong>剥削性策略</strong>：针对对手的弱点，适合对抗有明显漏洞的对手。</p>
      
      <h2>如何学习GTO</h2>
      <ol>
        <li>理解基本概念和原理</li>
        <li>学习不同位置的起手牌范围</li>
        <li>掌握翻牌后的决策树</li>
        <li>使用GTO求解器进行练习</li>
        <li>分析自己的决策，找出偏差</li>
      </ol>
    `,
    relatedArticles: ['2', '3']
  },
  {
    id: '2',
    title: '翻牌前起手牌选择',
    category: 'preflop',
    categoryName: '翻牌前策略',
    date: '2026-01-19',
    summary: '学习不同位置的起手牌范围',
    content: `
      <h2>位置的重要性</h2>
      <p>在德州扑克中，位置是决定起手牌范围的最重要因素。位置越靠后，可以玩的牌越宽。</p>
      
      <h2>不同位置的起手牌范围</h2>
      <h3>UTG (Under The Gun)</h3>
      <p>最紧的位置，只应该玩最强的起手牌：</p>
      <ul>
        <li>对子：AA, KK, QQ, JJ, 1010, 99, 88, 77, 66</li>
        <li>高牌：AK, AQ, AJ, KQ, KJ, QJ</li>
        <li>同花连牌：A10s, A9s, K10s, Q10s, J10s, 109s, 98s, 87s, 76s, 65s, 54s</li>
      </ul>
      
      <h3>BTN (Button)</h3>
      <p>最宽的位置，可以玩很多牌：</p>
      <ul>
        <li>几乎所有对子</li>
        <li>大部分高牌组合</li>
        <li>很多同花和连牌</li>
        <li>一些不同花的高牌</li>
      </ul>
      
      <h2>起手牌分类</h2>
      <h3>1. 对子 (Pairs)</h3>
      <p>对子是最强的起手牌类型之一。AA和KK是最强的，22是最弱的。</p>
      
      <h3>2. 高牌 (High Cards)</h3>
      <p>包含A、K、Q、J的牌。同花比不同花更强。</p>
      
      <h3>3. 同花连牌 (Suited Connectors)</h3>
      <p>同花且连续的牌，如76s、54s。有很好的成牌潜力。</p>
      
      <h2>常见错误</h2>
      <ul>
        <li>在不利位置玩太宽的牌</li>
        <li>忽略位置因素</li>
        <li>过度依赖强牌</li>
        <li>不根据对手调整范围</li>
      </ul>
    `,
    relatedArticles: ['1', '4']
  },
  {
    id: '3',
    title: '翻牌后策略基础',
    category: 'postflop',
    categoryName: '翻牌后策略',
    date: '2026-01-19',
    summary: '掌握翻牌后的决策原则',
    content: `
      <h2>翻牌后的关键因素</h2>
      <h3>1. 牌面结构</h3>
      <p>牌面的连接性和同花性决定了你的策略：</p>
      <ul>
        <li><strong>干燥牌面</strong>：如A-7-2不同花，适合持续下注</li>
        <li><strong>湿润牌面</strong>：如9-8-7同花，需要谨慎</li>
        <li><strong>高牌面</strong>：如A-K-Q，对高牌有利</li>
      </ul>
      
      <h3>2. 位置优势</h3>
      <p>在翻牌后，位置优势更加明显。后位可以控制底池大小，观察对手动作。</p>
      
      <h3>3. 范围优势</h3>
      <p>你的范围是否比对手的范围更强？这决定了你是否应该下注。</p>
      
      <h2>持续下注 (Continuation Bet)</h2>
      <p>翻牌前加注后，在翻牌圈继续下注。这是翻牌后最重要的策略之一。</p>
      
      <h3>何时持续下注：</h3>
      <ul>
        <li>你击中了牌面</li>
        <li>牌面对你的范围有利</li>
        <li>对手可能没有击中</li>
      </ul>
      
      <h2>防守策略</h2>
      <h3>跟注范围</h3>
      <p>需要混合以下类型的牌：</p>
      <ul>
        <li>强牌（顶对、两对等）</li>
        <li>听牌（同花听、顺子听）</li>
        <li>诈唬捕获牌（高牌、中对）</li>
      </ul>
      
      <h2>加注策略</h2>
      <p>翻牌后的加注通常表示：</p>
      <ul>
        <li>强牌（价值加注）</li>
        <li>半诈唬（听牌+加注）</li>
        <li>纯诈唬（很少，但有时必要）</li>
      </ul>
    `,
    relatedArticles: ['1', '2']
  },
  {
    id: '4',
    title: '手牌范围详解',
    category: 'ranges',
    categoryName: '手牌范围',
    date: '2026-01-19',
    summary: '深入理解手牌范围的概念和应用',
    content: `
      <h2>什么是手牌范围？</h2>
      <p>手牌范围是指你在某个情况下可能持有的所有手牌的集合。例如，UTG位置的起手牌范围可能包括AA、KK、QQ、AK等强牌。</p>
      
      <h2>范围的可视化</h2>
      <p>手牌范围通常用一个13×13的网格来表示：</p>
      <ul>
        <li>对角线：对子（AA, KK, QQ等）</li>
        <li>对角线上方：同花（suited）</li>
        <li>对角线下方：不同花（offsuit）</li>
      </ul>
      
      <h2>范围大小</h2>
      <p>范围大小通常用百分比表示：</p>
      <ul>
        <li><strong>紧范围</strong>：10-15%（如UTG位置）</li>
        <li><strong>中等范围</strong>：20-30%（如MP位置）</li>
        <li><strong>宽范围</strong>：40-60%（如BTN位置）</li>
      </ul>
      
      <h2>范围的优势</h2>
      <h3>1. 范围优势</h3>
      <p>你的范围比对手的范围更强。例如，你在UTG加注，对手在BB跟注，你的范围通常更强。</p>
      
      <h3>2. 坚果优势</h3>
      <p>你的范围中包含更多强牌。例如，在A-K-Q牌面上，你的范围可能包含更多顺子。</p>
      
      <h2>如何构建范围</h2>
      <ol>
        <li>从GTO求解器获取基础范围</li>
        <li>根据对手调整</li>
        <li>考虑筹码深度</li>
        <li>考虑游戏阶段</li>
      </ol>
      
      <h2>常见错误</h2>
      <ul>
        <li>范围太紧或太宽</li>
        <li>不根据位置调整</li>
        <li>忽略对手的范围</li>
        <li>不更新范围</li>
      </ul>
    `,
    relatedArticles: ['2', '5']
  },
  {
    id: '5',
    title: '高级GTO技巧',
    category: 'advanced',
    categoryName: '高级技巧',
    date: '2026-01-19',
    summary: '掌握高级GTO策略和技巧',
    content: `
      <h2>混合策略</h2>
      <p>GTO策略不是每次都做相同的动作，而是按照特定频率混合不同的动作。这使你的策略不可预测。</p>
      
      <h3>频率示例：</h3>
      <ul>
        <li>70%加注，30%跟注</li>
        <li>60%持续下注，40%过牌</li>
        <li>80%价值下注，20%诈唬</li>
      </ul>
      
      <h2>范围平衡</h2>
      <p>确保你的价值范围和诈唬范围是平衡的。价值下注的频率应该与诈唬下注的频率相匹配。</p>
      
      <h2>多街策略</h2>
      <p>考虑整个决策树，而不仅仅是当前街。你的翻牌圈决策应该考虑转牌和河牌的可能情况。</p>
      
      <h2>筹码深度的影响</h2>
      <p>筹码深度（以BB为单位）显著影响策略：</p>
      <ul>
        <li><strong>深筹码</strong>（>100BB）：可以玩更多听牌</li>
        <li><strong>中等筹码</strong>（50-100BB）：标准策略</li>
        <li><strong>短筹码</strong>（<50BB）：更激进的策略</li>
      </ul>
      
      <h2>剥削性调整</h2>
      <p>虽然GTO是基础，但针对对手的弱点进行调整也很重要：</p>
      <ul>
        <li>对手弃牌太多 → 增加诈唬频率</li>
        <li>对手跟注太多 → 减少诈唬，增加价值下注</li>
        <li>对手加注太多 → 增加跟注范围</li>
      </ul>
      
      <h2>使用GTO求解器</h2>
      <p>GTO求解器是学习GTO策略的强大工具：</p>
      <ol>
        <li>输入游戏参数（位置、筹码深度等）</li>
        <li>获取最优策略</li>
        <li>分析频率和范围</li>
        <li>应用到实际游戏中</li>
      </ol>
    `,
    relatedArticles: ['1', '3', '4']
  }
];

// 根据ID获取文章
function getArticleById(id) {
  return articles.find(article => article.id === id);
}

// 根据分类获取文章
function getArticlesByCategory(category) {
  if (!category) return articles;
  return articles.filter(article => article.category === category);
}

// 搜索文章
function searchArticles(keyword) {
  if (!keyword) return articles;
  const lowerKeyword = keyword.toLowerCase();
  return articles.filter(article => 
    article.title.toLowerCase().includes(lowerKeyword) ||
    article.summary.toLowerCase().includes(lowerKeyword) ||
    article.content.toLowerCase().includes(lowerKeyword)
  );
}

// 获取所有分类
function getCategories() {
  const categories = [
    { id: 'basics', name: '基础知识' },
    { id: 'preflop', name: '翻牌前策略' },
    { id: 'postflop', name: '翻牌后策略' },
    { id: 'ranges', name: '手牌范围' },
    { id: 'advanced', name: '高级技巧' }
  ];
  return categories;
}

module.exports = {
  articles,
  getArticleById,
  getArticlesByCategory,
  searchArticles,
  getCategories
};
