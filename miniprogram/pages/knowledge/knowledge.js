// pages/knowledge/knowledge.js
const knowledgeData = require('../../utils/knowledge-data.js');

Page({
  data: {
    categories: [
      { id: 'basics', name: '基础知识', icon: '📚' },
      { id: 'preflop', name: '翻牌前策略', icon: '🎯' },
      { id: 'postflop', name: '翻牌后策略', icon: '🃏' },
      { id: 'ranges', name: '手牌范围', icon: '📊' },
      { id: 'advanced', name: '高级技巧', icon: '🚀' }
    ],
    articles: [],
    filteredArticles: [],
    selectedCategory: null,
    searchKeyword: ''
  },

  onLoad() {
    this.loadArticles();
  },

  // 加载文章列表
  loadArticles() {
    const articles = knowledgeData.articles.map(article => ({
      id: article.id,
      title: article.title,
      category: article.category,
      categoryName: article.categoryName,
      summary: article.summary,
      date: article.date
    }));
    
    this.setData({ 
      articles,
      filteredArticles: articles
    });
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    const newCategory = category === this.data.selectedCategory ? null : category;
    this.setData({
      selectedCategory: newCategory
    });
    this.filterArticles();
  },

  // 搜索
  onSearch(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword
    });
    this.filterArticles();
  },

  // 筛选文章
  filterArticles() {
    let filtered = [...this.data.articles];
    
    // 按分类筛选
    if (this.data.selectedCategory) {
      filtered = filtered.filter(article => article.category === this.data.selectedCategory);
    }
    
    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(keyword) ||
        article.summary.toLowerCase().includes(keyword)
      );
    }
    
    this.setData({ filteredArticles: filtered });
  },

  // 查看文章详情
  viewArticle(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/knowledge/article/article?id=${id}`
    });
  }
});
