const crypto = require('crypto');
const pool = require('../config/db');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请输入账号和密码' });
    }
    const [rows] = await pool.query('SELECT id, username, password_hash AS passwordHash, nickname FROM admins WHERE username = ? LIMIT 1', [username]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }
    const admin = rows[0];
    const ok = crypto.createHash('sha256').update(password).digest('hex') === admin.passwordHash;
    if (!ok) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }
    req.session.admin = { id: admin.id, username: admin.username, nickname: admin.nickname };
    res.json({ success: true, message: '登录成功', data: req.session.admin });
  } catch (error) { next(error); }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ success: true, message: '已退出登录' });
  });
};

exports.check = (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ success: false, message: '未登录' });
  }
  res.json({ success: true, data: req.session.admin });
};

exports.stats = async (req, res, next) => {
  try {
    const [[appointmentCount]] = await pool.query('SELECT COUNT(*) AS total FROM appointments');
    const [[todayCount]] = await pool.query('SELECT COUNT(*) AS total FROM appointments WHERE visit_date = CURDATE()');
    const [[doctorCount]] = await pool.query('SELECT COUNT(*) AS total FROM doctors WHERE status = 1');
    const [[departmentCount]] = await pool.query('SELECT COUNT(*) AS total FROM departments WHERE status = 1');
    const [statusDistribution] = await pool.query('SELECT status, COUNT(*) AS total FROM appointments GROUP BY status');
    const [recentAppointments] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.patient_name AS patientName, a.phone, a.visit_date AS visitDate, a.period, a.status,
              d.name AS doctorName, dp.name AS departmentName
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN departments dp ON a.department_id = dp.id
       ORDER BY a.created_at DESC LIMIT 8`
    );
    res.json({
      success: true,
      data: {
        appointmentCount: appointmentCount.total,
        todayCount: todayCount.total,
        doctorCount: doctorCount.total,
        departmentCount: departmentCount.total,
        statusDistribution,
        recentAppointments
      }
    });
  } catch (error) { next(error); }
};

exports.listSchedules = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.schedule_date AS scheduleDate, s.period, s.max_number AS maxNumber, s.booked_number AS bookedNumber, s.status, s.fee,
              d.name AS doctorName, dp.name AS departmentName
       FROM doctor_schedules s
       LEFT JOIN doctors d ON s.doctor_id = d.id
       LEFT JOIN departments dp ON d.department_id = dp.id
       ORDER BY s.schedule_date DESC, FIELD(s.period, '上午','下午','夜间')`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allow = ['待就诊', '已签到', '就诊中', '已完成', '已取消'];
    if (!allow.includes(status)) {
      return res.status(400).json({ success: false, message: '状态值不合法' });
    }
    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    await pool.query(
      `INSERT INTO appointment_logs (appointment_id, action, remark, created_at)
       VALUES (?, '状态变更', ?, NOW())`, [id, `管理员将预约状态更新为：${status}`]
    );
    res.json({ success: true, message: '预约状态更新成功' });
  } catch (error) { next(error); }
};

exports.updateScheduleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allow = ['available', 'stopped'];
    if (!allow.includes(status)) {
      return res.status(400).json({ success: false, message: '排班状态不合法' });
    }
    await pool.query('UPDATE doctor_schedules SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: '排班状态更新成功' });
  } catch (error) { next(error); }
};
