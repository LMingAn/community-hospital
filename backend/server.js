const express = require('express');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'community-hospital-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 3 }
}));

app.use('/api', require('./routes/publicRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patient', require('./routes/patientRoutes'));
app.use('/api/doctor', require('./routes/doctorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const legacyPublicDir = path.join(__dirname, 'public');
const frontendDistDir = path.join(__dirname, '..', 'frontend', 'dist');
const fs = require('fs');
const staticDir = fs.existsSync(frontendDistDir) ? frontendDistDir : legacyPublicDir;
app.use(express.static(staticDir));

app.get('/', (req, res) => {
  const entry = fs.existsSync(path.join(frontendDistDir, 'index.html'))
    ? path.join(frontendDistDir, 'index.html')
    : path.join(legacyPublicDir, 'index.html');
  res.sendFile(entry);
});
app.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ success: true, database: rows[0].ok === 1 ? 'connected' : 'unknown' });
  } catch (error) {
    res.status(500).json({ success: false, message: '数据库连接失败', error: error.message });
  }
});
app.get(/^(?!\/api|\/health).*/, (req, res) => {
  const entry = fs.existsSync(path.join(frontendDistDir, 'index.html'))
    ? path.join(frontendDistDir, 'index.html')
    : path.join(legacyPublicDir, 'index.html');
  res.sendFile(entry);
});

app.use((req, res) => res.status(404).json({ success: false, message: '请求地址不存在' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ success: false, message: '服务器内部错误', error: error.message });
});

app.listen(PORT, () => {
  console.log(`社区医院在线预约管理系统已启动：http://localhost:${PORT}`);
});
