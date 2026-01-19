// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 路由
const gtoRoutes = require('./routes/gto');
const gamesRoutes = require('./routes/games');
const usersRoutes = require('./routes/users');
const analysisRoutes = require('./routes/analysis');
const roomsRoutes = require('./routes/rooms');

app.use('/api/gto', gtoRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/rooms', roomsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/texas-poker-gto';

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('数据库连接成功');
  })
  .catch(err => {
    console.error('数据库连接失败', err);
  });

// WebSocket 连接管理
const socketHandlers = require('./services/socket-handlers');
socketHandlers.initialize(io);

// 启动服务器
server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`WebSocket 服务器已启动`);
});

module.exports = { app, server, io };
