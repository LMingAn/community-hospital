const pool = require('../config/db');
const { hashPassword } = require('./helpers');

async function findOne(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows[0] || null;
}

exports.patientRegister = async (req, res, next) => {
  try {
    const { username, password, name, gender, age, phone, idCard } = req.body;
    if (!username || !password || !name || !phone) {
      return res.status(400).json({ success: false, message: '请完整填写患者注册信息' });
    }
    const exists = await findOne('SELECT id FROM patients WHERE username = ? OR phone = ? LIMIT 1', [username, phone]);
    if (exists) return res.status(400).json({ success: false, message: '用户名或手机号已存在' });
    await pool.query(
      `INSERT INTO patients (username, password_hash, name, gender, age, phone, id_card, balance)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [username, hashPassword(password), name, gender || '男', age || null, phone, idCard || '']
    );
    res.json({ success: true, message: '患者注册成功，请登录' });
  } catch (error) { next(error); }
};

exports.patientLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const patient = await findOne(
      'SELECT id, username, name, phone, balance, password_hash AS passwordHash FROM patients WHERE username = ? LIMIT 1',
      [username]
    );
    if (!patient || patient.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: '患者账号或密码错误' });
    }
    req.session.patient = { id: patient.id, username: patient.username, name: patient.name, phone: patient.phone, balance: Number(patient.balance) };
    res.json({ success: true, message: '患者登录成功', data: req.session.patient });
  } catch (error) { next(error); }
};

exports.patientLogout = (req, res) => {
  delete req.session.patient;
  res.json({ success: true, message: '患者已退出登录' });
};

exports.patientProfile = async (req, res, next) => {
  try {
    const patient = await findOne(
      'SELECT id, username, name, gender, age, phone, id_card AS idCard, balance, created_at AS createdAt FROM patients WHERE id = ?',
      [req.session.patient.id]
    );
    res.json({ success: true, data: patient });
  } catch (error) { next(error); }
};

exports.patientChangePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const patient = await findOne('SELECT password_hash AS passwordHash FROM patients WHERE id = ?', [req.session.patient.id]);
    if (!patient || patient.passwordHash !== hashPassword(oldPassword)) {
      return res.status(400).json({ success: false, message: '原密码错误' });
    }
    await pool.query('UPDATE patients SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), req.session.patient.id]);
    res.json({ success: true, message: '患者密码修改成功' });
  } catch (error) { next(error); }
};

exports.doctorRegister = async (req, res, next) => {
  try {
    const { username, password, name, gender, departmentId, title, specialty, phone, intro } = req.body;
    if (!username || !password || !name || !departmentId || !title || !phone) {
      return res.status(400).json({ success: false, message: '请完整填写医生注册信息' });
    }
    const exists = await findOne('SELECT id FROM doctors WHERE username = ? LIMIT 1', [username]);
    if (exists) return res.status(400).json({ success: false, message: '医生账号已存在' });
    await pool.query(
      `INSERT INTO doctors (department_id, username, password_hash, name, gender, title, specialty, phone, intro, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [departmentId, username, hashPassword(password), name, gender || '男', title, specialty || '', phone, intro || '']
    );
    res.json({ success: true, message: '医生注册成功，请登录' });
  } catch (error) { next(error); }
};

exports.doctorLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const doctor = await findOne(
      `SELECT d.id, d.username, d.name, d.title, d.department_id AS departmentId, dp.name AS departmentName,
              d.password_hash AS passwordHash
       FROM doctors d LEFT JOIN departments dp ON d.department_id = dp.id
       WHERE d.username = ? LIMIT 1`, [username]
    );
    if (!doctor || doctor.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: '医生账号或密码错误' });
    }
    req.session.doctor = {
      id: doctor.id,
      username: doctor.username,
      name: doctor.name,
      title: doctor.title,
      departmentId: doctor.departmentId,
      departmentName: doctor.departmentName
    };
    res.json({ success: true, message: '医生登录成功', data: req.session.doctor });
  } catch (error) { next(error); }
};

exports.doctorLogout = (req, res) => {
  delete req.session.doctor;
  res.json({ success: true, message: '医生已退出登录' });
};

exports.doctorProfile = async (req, res, next) => {
  try {
    const doctor = await findOne(
      `SELECT d.id, d.username, d.name, d.gender, d.title, d.specialty, d.phone, d.intro,
              d.department_id AS departmentId, dp.name AS departmentName
       FROM doctors d LEFT JOIN departments dp ON d.department_id = dp.id WHERE d.id = ?`,
      [req.session.doctor.id]
    );
    res.json({ success: true, data: doctor });
  } catch (error) { next(error); }
};

exports.doctorChangePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const doctor = await findOne('SELECT password_hash AS passwordHash FROM doctors WHERE id = ?', [req.session.doctor.id]);
    if (!doctor || doctor.passwordHash !== hashPassword(oldPassword)) {
      return res.status(400).json({ success: false, message: '原密码错误' });
    }
    await pool.query('UPDATE doctors SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), req.session.doctor.id]);
    res.json({ success: true, message: '医生密码修改成功' });
  } catch (error) { next(error); }
};

exports.adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await findOne('SELECT id, username, nickname, password_hash AS passwordHash FROM admins WHERE username = ? LIMIT 1', [username]);
    if (!admin || admin.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: '管理员账号或密码错误' });
    }
    req.session.admin = { id: admin.id, username: admin.username, nickname: admin.nickname };
    res.json({ success: true, message: '管理员登录成功', data: req.session.admin });
  } catch (error) { next(error); }
};

exports.adminLogout = (req, res) => {
  delete req.session.admin;
  res.json({ success: true, message: '管理员已退出登录' });
};

exports.adminCheck = (req, res) => {
  if (!req.session.admin) return res.status(401).json({ success: false, message: '未登录' });
  res.json({ success: true, data: req.session.admin });
};
