const pool = require('../config/db');
const { hashPassword } = require('./helpers');

exports.profile = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT id, username, nickname, phone, email FROM admins WHERE id = ?', [req.session.admin.id]);
    res.json({ success: true, data: row });
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const [[row]] = await pool.query('SELECT password_hash AS passwordHash FROM admins WHERE id = ?', [req.session.admin.id]);
    if (!row || row.passwordHash !== hashPassword(oldPassword)) {
      return res.status(400).json({ success: false, message: '原密码错误' });
    }
    await pool.query('UPDATE admins SET password_hash = ? WHERE id = ?', [hashPassword(newPassword), req.session.admin.id]);
    res.json({ success: true, message: '管理员密码修改成功' });
  } catch (error) { next(error); }
};

exports.stats = async (req, res, next) => {
  try {
    const [[doctorCount]] = await pool.query('SELECT COUNT(*) AS total FROM doctors');
    const [[patientCount]] = await pool.query('SELECT COUNT(*) AS total FROM patients');
    const [[todayReg]] = await pool.query("SELECT COUNT(*) AS total FROM appointments WHERE visit_date = CURDATE() AND status <> '已取消'");
    const [[visitCount]] = await pool.query('SELECT COUNT(*) AS total FROM visit_records');
    const [[hospitalCount]] = await pool.query("SELECT COUNT(*) AS total FROM hospitalization_records WHERE status <> '已出院'");
    const [todayDoctors] = await pool.query(
      `SELECT d.name AS doctorName, dp.name AS departmentName, w.period, w.max_number AS maxNumber
       FROM weekly_schedules w
       JOIN doctors d ON w.doctor_id = d.id
       JOIN departments dp ON d.department_id = dp.id
       WHERE w.weekday = WEEKDAY(CURDATE()) + 1 AND w.status = 1
       ORDER BY dp.id, d.id, FIELD(w.period, '上午','下午','夜间')`
    );
    res.json({ success: true, data: { doctorCount: doctorCount.total, patientCount: patientCount.total, todayReg: todayReg.total, visitCount: visitCount.total, hospitalCount: hospitalCount.total, todayDoctors } });
  } catch (error) { next(error); }
};

exports.listDepartments = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, location, status FROM departments ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.listDoctors = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.id, d.username, d.name, d.gender, d.title, d.specialty, d.phone, d.status, dp.name AS departmentName
       FROM doctors d JOIN departments dp ON d.department_id = dp.id ORDER BY d.id`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.listPatients = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, username, name, gender, age, phone, balance, status, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt FROM patients ORDER BY id DESC`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.listAnnouncements = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, title, content, DATE_FORMAT(publish_time, '%Y-%m-%d %H:%i:%s') AS publishTime, status FROM announcements ORDER BY publish_time DESC`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: '请输入公告标题和内容' });
    await pool.query('INSERT INTO announcements (title, content, status) VALUES (?, ?, 1)', [title, content]);
    res.json({ success: true, message: '公告发布成功' });
  } catch (error) { next(error); }
};

exports.listSchedules = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.id, w.weekday, w.period, w.max_number AS maxNumber, w.fee, w.status,
              d.name AS doctorName, dp.name AS departmentName
       FROM weekly_schedules w
       JOIN doctors d ON w.doctor_id = d.id
       JOIN departments dp ON d.department_id = dp.id
       ORDER BY w.weekday, d.id, FIELD(w.period, '上午','下午','夜间')`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const { doctorId, weekday, period, maxNumber, fee } = req.body;
    if (!doctorId || !weekday || !period) return res.status(400).json({ success: false, message: '请完整填写排班信息' });
    await pool.query(
      `INSERT INTO weekly_schedules (doctor_id, weekday, period, max_number, fee, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [doctorId, weekday, period, maxNumber || 20, fee || 15]
    );
    res.json({ success: true, message: '排班新增成功' });
  } catch (error) { next(error); }
};

exports.listAppointments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.visit_date AS visitDate, a.period, a.queue_no AS queueNo, a.status,
              p.name AS patientName, p.phone, d.name AS doctorName, dp.name AS departmentName
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN departments dp ON a.department_id = dp.id
       ORDER BY a.visit_date DESC, FIELD(a.period, '上午','下午','夜间'), a.queue_no`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.listVisits = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.diagnosis, v.prescription, v.need_hospitalization AS needHospitalization, DATE_FORMAT(v.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
              p.name AS patientName, d.name AS doctorName, a.appointment_no AS appointmentNo
       FROM visit_records v
       JOIN patients p ON v.patient_id = p.id
       JOIN doctors d ON v.doctor_id = d.id
       JOIN appointments a ON v.appointment_id = a.id
       ORDER BY v.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.listHospitalizations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.id, h.ward_no AS wardNo, h.bed_no AS bedNo, h.reason_text AS reasonText, h.status, DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
              p.name AS patientName
       FROM hospitalization_records h
       JOIN patients p ON h.patient_id = p.id
       ORDER BY h.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
