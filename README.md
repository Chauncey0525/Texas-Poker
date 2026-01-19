# 德州扑克GTO微信小程序

一个功能完整的德州扑克GTO学习与训练微信小程序，帮助用户学习GTO策略、复盘历史牌局、进行模拟练习。

## 功能特点

- 🎮 **模拟练习**: 与AI对手进行模拟对局，实时获取GTO建议
- 📊 **复盘分析**: 记录并回放历史牌局，对比用户决策与GTO建议
- 💡 **GTO建议**: 实时获取博弈论最优策略建议
- 📚 **知识库**: GTO基础理论、策略分析、视频教程
- 🔍 **手牌分析器**: 分析手牌胜率和牌力强度
- 📈 **范围分析器**: 可视化不同位置的起手牌范围

## 项目结构

```
Texas poker GTO/
├── miniprogram/          # 微信小程序前端
│   ├── app.js           # 小程序入口
│   ├── app.json         # 全局配置
│   ├── pages/           # 页面目录
│   ├── components/      # 组件目录
│   └── utils/           # 工具函数
├── backend/             # 后端服务
│   ├── server.js        # 服务器入口
│   ├── routes/          # 路由
│   ├── services/        # 服务层
│   └── models/          # 数据模型
└── README.md
```

## 技术栈

### 前端
- 微信小程序原生开发
- 参考项目结构：南城麻将

### 后端
- Node.js + Express
- MongoDB
- GTO API集成

## 开发指南

### 前端开发

1. 使用微信开发者工具打开 `miniprogram` 目录
2. 配置 `app.json` 中的页面路径
3. 在 `utils/config.js` 中配置API地址

### 后端开发

1. 安装依赖：
```bash
cd backend
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，填入实际配置
```

3. 启动服务器：
```bash
npm start
# 或使用开发模式
npm run dev
```

## 配置说明

### GTO API配置

在 `backend/.env` 中配置GTO API地址和密钥：
```
GTO_API_URL=https://your-gto-api.com
GTO_API_KEY=your-api-key-here
```

如果GTO API不可用，系统会自动使用模拟数据。

### 数据库配置

在 `backend/.env` 中配置MongoDB连接：
```
MONGODB_URI=mongodb://localhost:27017/texas-poker-gto
```

## 功能模块

### 1. 模拟练习
- 支持2-6人对局
- AI对手智能决策
- 实时GTO建议
- 游戏记录自动保存

### 2. 复盘分析
- 完整牌局记录
- 逐步回放功能
- 决策对比分析
- 错误识别和统计

### 3. GTO建议
- 实时策略建议
- 动作频率分析
- 期望价值计算

### 4. 知识库
- GTO基础理论
- 翻牌前后策略
- 手牌范围分析
- 高级技巧

### 5. 手牌分析器
- 手牌类型识别
- 牌力强度评估
- 胜率计算

### 6. 范围分析器
- 位置范围可视化
- 范围对比功能

## Git 工作流程

本项目使用双分支策略：

- **main 分支**：生产环境代码，稳定版本
- **dev 分支**：日常开发分支，用于功能开发和bug修复

### 开发流程

1. **日常开发在 dev 分支进行**
   ```bash
   git checkout dev
   git pull origin dev
   # 进行开发...
   git add .
   git commit -m "feat: 功能描述"
   git push origin dev
   ```

2. **合并到 main 分支**
   - 通过 GitHub Pull Request：`dev` → `main`
   - 或本地合并（需要审查）

详细说明请查看 [.git-workflow.md](.git-workflow.md)

## 注意事项

1. 微信小程序包体大小限制（2MB），需要优化资源
2. GTO API可能有调用频率限制，已实现请求缓存
3. 确保用户数据隐私安全
4. 遵守微信小程序审核规范（避免涉及赌博相关内容）
5. 后端服务需要处理跨域和认证问题

## 许可证

MIT
