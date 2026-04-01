const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const apiRoutes = require('./routes/api');
const { testDbConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'community_hospital_secret_2026'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: '请求的资源不存在' });
});

app.use((err, req, res, next) => {
  console.error('服务器异常：', err);
  res.status(500).json({ success: false, message: err.message || '服务器内部错误' });
});

app.listen(PORT, async () => {
  console.log(`系统启动成功：http://localhost:${PORT}`);
  try {
    await testDbConnection();
    console.log('MySQL 连接检测通过');
  } catch (error) {
    console.log('MySQL 连接检测未通过，请先导入 SQL 并检查 .env 配置');
    console.log(error.message);
  }
});
