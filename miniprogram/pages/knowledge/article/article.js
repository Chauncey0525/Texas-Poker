// pages/knowledge/article/article.js
const knowledgeData = require('../../../utils/knowledge-data.js');

Page({
  data: {
    article: null,
    articleId: null
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadArticle(id);
    }
  },

  // 加载文章
  loadArticle(id) {
    const article = knowledgeData.getArticleById(id);
    if (article) {
      this.setData({ 
        article,
        articleId: id
      });
      wx.setNavigationBarTitle({
        title: article.title
      });
    } else {
      wx.showToast({
        title: '文章不存在',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.article ? this.data.article.title : '德州扑克GTO知识库',
      path: `/pages/knowledge/article?id=${this.data.articleId}`
    };
  }
});
