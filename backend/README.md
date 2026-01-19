# 后端服务说明

## 安装依赖

```bash
npm install
```

## 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/texas-poker-gto
GTO_API_URL=https://your-gto-api.com
GTO_API_KEY=your-api-key-here
```

## 启动服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

## API接口

### GTO相关
- `POST /api/gto/advice` - 获取GTO建议
- `POST /api/gto/range` - 获取范围建议

### 游戏记录
- `POST /api/games/save` - 保存游戏记录
- `GET /api/games/list` - 获取游戏记录列表
- `GET /api/games/:id` - 获取游戏记录详情
- `DELETE /api/games/:id` - 删除游戏记录

### 用户相关
- `POST /api/users/login` - 用户登录/注册
- `GET /api/users/:id` - 获取用户信息
- `PUT /api/users/:id` - 更新用户信息

### 分析相关
- `POST /api/analysis/game` - 分析游戏记录
- `GET /api/analysis/stats/:userId` - 获取用户统计数据

## 数据库

使用MongoDB存储数据，需要先启动MongoDB服务。

如果没有MongoDB，可以：
1. 安装MongoDB本地服务
2. 使用MongoDB Atlas云服务
3. 暂时注释掉数据库相关代码，使用内存存储

## GTO API集成

如果GTO API不可用，系统会自动使用模拟数据，确保功能可以正常使用。
