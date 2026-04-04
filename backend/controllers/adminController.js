const pool = require('../config/db');
const { hashPassword } = require('./helpers');

async function getById(table, id) {
  const [rows] = await pool.query(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

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
    if (!row || row.passwordHash !== hashPassword(oldPassword)) return res.status(400).json({ success: false, message: '原密码错误' });
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
    const [todayDoctors] = await pool.query(`SELECT d.name AS doctorName, dp.name AS departmentName, w.period, w.max_slots AS maxNumber FROM weekly_schedules w JOIN doctors d ON w.doctor_id = d.id JOIN departments dp ON d.dept_id = dp.id WHERE w.weekday = WEEKDAY(CURDATE()) + 1 AND w.status = 1 ORDER BY dp.id, d.id, FIELD(w.period, '上午','下午','夜间')`);
    const [announcements] = await pool.query(`SELECT id, title, content, DATE_FORMAT(published_at, '%Y-%m-%d %H:%i:%s') AS publishTime, status FROM announcements ORDER BY published_at DESC LIMIT 5`);
    res.json({ success: true, data: { doctorCount: doctorCount.total, patientCount: patientCount.total, todayReg: todayReg.total, visitCount: visitCount.total, hospitalCount: hospitalCount.total, todayDoctors, announcements } });
  } catch (error) { next(error); }
};

exports.listDepartments = async (req, res, next) => { 
  try { 
    const [rows] = await pool.query('SELECT id, name, description, location, status FROM departments ORDER BY id'); 
    res.json({ success: true, data: rows }); 
  } catch (error) { next(error); } 
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, location, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '请输入科室名称' });
    await pool.query('INSERT INTO departments (name, description, location, status) VALUES (?, ?, ?, ?)', [name, description || '', location || '', status ?? 1]);
    res.json({ success: true, message: '科室新增成功' });
  } catch (error) { next(error); }
};
exports.updateDepartment = async (req, res, next) => {
  try {
    const { name, description, location, status } = req.body;
    await pool.query('UPDATE departments SET name = ?, description = ?, location = ?, status = ? WHERE id = ?', [name, description || '', location || '', status ?? 1, req.params.id]);
    res.json({ success: true, message: '科室更新成功' });
  } catch (error) { next(error); }
};
exports.deleteDepartment = async (req, res, next) => {
  try { await pool.query('DELETE FROM departments WHERE id = ?', [req.params.id]); res.json({ success: true, message: '科室删除成功' }); } catch (error) { next(error); }
};

exports.listDoctors = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT d.id, d.dept_id AS departmentId, d.username, d.name, d.gender, d.title, d.specialty, d.phone, d.profile AS intro, d.status, dp.name AS departmentName FROM doctors d JOIN departments dp ON d.dept_id = dp.id ORDER BY d.id`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.createDoctor = async (req, res, next) => {
  try {
    const { departmentId, username, password, name, gender, title, specialty, phone, intro, profile, status } = req.body;
    if (!departmentId || !username || !password || !name || !title || !phone) return res.status(400).json({ success: false, message: '请完整填写医生信息' });
    await pool.query(`INSERT INTO doctors (dept_id, username, password_hash, name, gender, title, specialty, phone, profile, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [departmentId, username, hashPassword(password), name, gender || '男', title, specialty || '', phone, intro || profile || '', status ?? 1]);
    res.json({ success: true, message: '医生新增成功' });
  } catch (error) { next(error); }
};
exports.updateDoctor = async (req, res, next) => {
  try {
    const { departmentId, username, name, gender, title, specialty, phone, intro, profile, status, password } = req.body;
    await pool.query(`UPDATE doctors SET dept_id = ?, username = ?, name = ?, gender = ?, title = ?, specialty = ?, phone = ?, profile = ?, status = ? WHERE id = ?`, [departmentId, username, name, gender || '男', title, specialty || '', phone, intro || profile || '', status ?? 1, req.params.id]);
    if (password) await pool.query('UPDATE doctors SET password_hash = ? WHERE id = ?', [hashPassword(password), req.params.id]);
    res.json({ success: true, message: '医生更新成功' });
  } catch (error) { next(error); }
};
exports.deleteDoctor = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const doctorId = Number(req.params.id);

    const [[doctor]] = await conn.query(
      'select id, name from doctors where id = ? limit 1',
      [doctorId]
    );
    if (!doctor) {
      return res.status(404).json({ success: false, message: '医生不存在' });
    }

    const [[scheduleRef]] = await conn.query(
      'select id from weekly_schedules where doctor_id = ? limit 1',
      [doctorId]
    );
    const [[appointmentRef]] = await conn.query(
      'select id from appointments where doctor_id = ? limit 1',
      [doctorId]
    );
    const [[visitRef]] = await conn.query(
      'select id from visit_records where doctor_id = ? limit 1',
      [doctorId]
    );

    if (scheduleRef || appointmentRef || visitRef) {
      return res.status(400).json({
        success: false,
        message: '该医生已关联排班、挂号或就诊记录，不能直接删除，请先清理关联数据'
      });
    }

    await conn.query('delete from doctors where id = ?', [doctorId]);
    res.json({ success: true, message: '医生删除成功' });
  } catch (error) {
    next(error);
  } finally {
    conn.release();
  }
};

exports.listPatients = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT id, username, name, gender, age, phone, identity_card_no AS idCard, status, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS createdAt FROM patients ORDER BY id DESC`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.createPatient = async (req, res, next) => {
  try {
    const { username, password, name, gender, age, phone, idCard, status } = req.body;
    if (!username || !password || !name || !phone) return res.status(400).json({ success: false, message: '请完整填写患者信息' });
    await pool.query(`INSERT INTO patients (username, password_hash, name, gender, age, phone, identity_card_no, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [username, hashPassword(password), name, gender || '男', age || null, phone, idCard || '', status ?? 1]);
    res.json({ success: true, message: '患者新增成功' });
  } catch (error) { next(error); }
};
exports.updatePatient = async (req, res, next) => {
  try {
    const { username, name, gender, age, phone, idCard, status, password } = req.body;
    await pool.query(`UPDATE patients SET username = ?, name = ?, gender = ?, age = ?, phone = ?, identity_card_no = ?, status = ? WHERE id = ?`, [username, name, gender || '男', age || null, phone, idCard || '', status ?? 1, req.params.id]);
    if (password) await pool.query('UPDATE patients SET password_hash = ? WHERE id = ?', [hashPassword(password), req.params.id]);
    res.json({ success: true, message: '患者更新成功' });
  } catch (error) { next(error); }
};
exports.deletePatient = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const patientId = Number(req.params.id);

    const [[patient]] = await conn.query(
      'select id, name from patients where id = ? limit 1',
      [patientId]
    );
    if (!patient) {
      return res.status(404).json({ success: false, message: '患者不存在' });
    }

    const [[appointmentRef]] = await conn.query(
      'select id from appointments where patient_id = ? limit 1',
      [patientId]
    );
    const [[visitRef]] = await conn.query(
      'select id from visit_records where patient_id = ? limit 1',
      [patientId]
    );
    const [[hospitalRef]] = await conn.query(
      'select id from hospitalization_records where patient_id = ? limit 1',
      [patientId]
    );

    if (appointmentRef || visitRef || hospitalRef) {
      return res.status(400).json({
        success: false,
        message: '该患者已关联挂号、就诊或住院记录，不能直接删除，请先清理关联数据'
      });
    }

    await conn.query('delete from patients where id = ?', [patientId]);
    res.json({ success: true, message: '患者删除成功' });
  } catch (error) {
    next(error);
  } finally {
    conn.release();
  }
};

exports.listAnnouncements = async (req, res, next) => { 
  try { 
    const [rows] = await pool.query(`SELECT id, title, content, DATE_FORMAT(published_at, '%Y-%m-%d %H:%i:%s') AS publishTime, status FROM announcements ORDER BY published_at DESC`); 
    res.json({ success: true, data: rows }); 
  } catch (error) { next(error); } 
};

exports.createAnnouncement = async (req, res, next) => { 
  try { 
    const { title, content, status } = req.body; 
    if (!title || !content) return res.status(400).json({ success: false, message: '请输入公告标题和内容' }); 
    await pool.query('INSERT INTO announcements (title, content, status) VALUES (?, ?, ?)', [title, content, status ?? 1]); 
    res.json({ success: true, message: '公告发布成功' }); 
  } catch (error) { next(error); } 
};

exports.updateAnnouncement = async (req, res, next) => { 
  try { 
    const { title, content, status } = req.body; 
    await pool.query('UPDATE announcements SET title = ?, content = ?, status = ? WHERE id = ?', [title, content, status ?? 1, req.params.id]); 
    res.json({ success: true, message: '公告更新成功' }); 
  } catch (error) { next(error); } 
};
exports.deleteAnnouncement = async (req, res, next) => { 
  try { 
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]); 
    res.json({ success: true, message: '公告删除成功' }); 
  } catch (error) { next(error); } 
};

exports.listSchedules = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT w.id, w.doctor_id AS doctorId, w.weekday, w.period, w.max_slots AS maxNumber, w.fee, w.status, d.name AS doctorName, dp.name AS departmentName FROM weekly_schedules w JOIN doctors d ON w.doctor_id = d.id JOIN departments dp ON d.dept_id = dp.id ORDER BY w.weekday, d.id, FIELD(w.period, '上午','下午','夜间')`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.createSchedule = async (req, res, next) => { 
  try { 
    const { doctorId, weekday, period, maxNumber, fee, status } = req.body; 
    if (!doctorId || !weekday || !period) return res.status(400).json({ success: false, message: '请完整填写排班信息' }); 
    await pool.query(`INSERT INTO weekly_schedules (doctor_id, weekday, period, max_slots, fee, status) VALUES (?, ?, ?, ?, ?, ?)`, [doctorId, weekday, period, maxNumber || 20, fee || 15, status ?? 1]); 
    res.json({ success: true, message: '排班新增成功' }); 
  } catch (error) { next(error); } 
};
exports.updateSchedule = async (req, res, next) => { 
  try { 
    const { doctorId, weekday, period, maxNumber, fee, status } = req.body; 
    await pool.query(`UPDATE weekly_schedules SET doctor_id = ?, weekday = ?, period = ?, max_slots = ?, fee = ?, status = ? WHERE id = ?`, [doctorId, weekday, period, maxNumber || 20, fee || 15, status ?? 1, req.params.id]); 
    res.json({ success: true, message: '排班更新成功' }); 
  } catch (error) { next(error); } 
};
exports.deleteSchedule = async (req, res, next) => { 
  try { 
    await pool.query('DELETE FROM weekly_schedules WHERE id = ?', [req.params.id]); 
    res.json({ success: true, message: '排班删除成功' }); 
  } catch (error) { next(error); } 
};

exports.listAppointments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT a.id, a.appointment_no AS appointmentNo, a.patient_id AS patientId, a.doctor_id AS doctorId, a.dept_id AS departmentId, DATE_FORMAT(a.visit_date, '%Y-%m-%d') AS visitDate, a.period, a.queue_number AS queueNo, a.fee, a.symptom, a.triage_advice AS triageResult, a.status, p.name AS patientName, p.phone, d.name AS doctorName, dp.name AS departmentName FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id JOIN departments dp ON a.dept_id = dp.id ORDER BY a.visit_date DESC, FIELD(a.period, '上午','下午','夜间'), a.queue_number`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.createAppointment = async (req, res, next) => {
  try {
    const { appointmentNo, patientId, doctorId, departmentId, visitDate, period, queueNo, fee, symptom, triageResult, status } = req.body;
    await pool.query(`INSERT INTO appointments (appointment_no, patient_id, doctor_id, dept_id, visit_date, period, queue_number, fee, symptom, triage_advice, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [appointmentNo, patientId, doctorId, departmentId, visitDate, period, queueNo || 1, fee || 0, symptom || '', triageResult || '', status || '待叫号']);
    res.json({ success: true, message: '挂号记录新增成功' });
  } catch (error) { next(error); }
};
exports.updateAppointment = async (req, res, next) => {
  try {
    const { appointmentNo, patientId, doctorId, departmentId, visitDate, period, queueNo, fee, symptom, triageResult, status } = req.body;
    await pool.query(`UPDATE appointments SET appointment_no = ?, patient_id = ?, doctor_id = ?, dept_id = ?, visit_date = ?, period = ?, queue_number = ?, fee = ?, symptom = ?, triage_advice = ?, status = ? WHERE id = ?`, [appointmentNo, patientId, doctorId, departmentId, visitDate, period, queueNo || 1, fee || 0, symptom || '', triageResult || '', status || '待叫号', req.params.id]);
    res.json({ success: true, message: '挂号记录更新成功' });
  } catch (error) { next(error); }
};
exports.deleteAppointment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const appointmentId = Number(req.params.id);

    const [[appointment]] = await conn.query(
      'select id, appointment_no from appointments where id = ? limit 1',
      [appointmentId]
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: '挂号记录不存在' });
    }

    const [[visitRef]] = await conn.query(
      'select id from visit_records where appointment_id = ? limit 1',
      [appointmentId]
    );

    if (visitRef) {
      return res.status(400).json({
        success: false,
        message: '该挂号记录已生成就诊记录，不能直接删除'
      });
    }

    await conn.beginTransaction();
    await conn.query('delete from appointments where id = ?', [appointmentId]);
    await conn.commit();

    res.json({ success: true, message: '挂号记录删除成功' });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    next(error);
  } finally {
    conn.release();
  }
};

exports.listVisits = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT v.id, v.appointment_id AS appointmentId, v.patient_id AS patientId, v.doctor_id AS doctorId, v.diagnosis, v.advice_content_html AS adviceHtml, v.prescription, v.need_inpatient AS needHospitalization, DATE_FORMAT(v.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt, p.name AS patientName, d.name AS doctorName, a.appointment_no AS appointmentNo FROM visit_records v JOIN patients p ON v.patient_id = p.id JOIN doctors d ON v.doctor_id = d.id JOIN appointments a ON v.appointment_id = a.id ORDER BY v.created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.createVisit = async (req, res, next) => {
  try {
    const { appointmentId, patientId, doctorId, diagnosis, adviceHtml, prescription, needHospitalization } = req.body;
    await pool.query(`INSERT INTO visit_records (appointment_id, patient_id, doctor_id, diagnosis, advice_content_html, prescription, need_inpatient) VALUES (?, ?, ?, ?, ?, ?, ?)`, [appointmentId, patientId, doctorId, diagnosis || '', adviceHtml || '', prescription || '', needHospitalization ? 1 : 0]);
    res.json({ success: true, message: '就诊记录新增成功' });
  } catch (error) { next(error); }
};
exports.updateVisit = async (req, res, next) => {
  try {
    const current = await getById('visit_records', req.params.id);
    if (!current) return res.status(404).json({ success: false, message: '就诊记录不存在' });
    const { appointmentId, patientId, doctorId, diagnosis, adviceHtml, prescription, needHospitalization } = req.body;
    await pool.query(`UPDATE visit_records SET appointment_id = ?, patient_id = ?, doctor_id = ?, diagnosis = ?, advice_content_html = ?, prescription = ?, need_inpatient = ? WHERE id = ?`, [appointmentId || current.appointment_id, patientId || current.patient_id, doctorId || current.doctor_id, diagnosis || '', adviceHtml || '', prescription || '', needHospitalization ? 1 : 0, req.params.id]);
    res.json({ success: true, message: '就诊记录更新成功' });
  } catch (error) { next(error); }
};
exports.deleteVisit = async (req, res, next) => { try { await pool.query('DELETE FROM visit_records WHERE id = ?', [req.params.id]); res.json({ success: true, message: '就诊记录删除成功' }); } catch (error) { next(error); } };

exports.listHospitalizations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT h.id, h.patient_id AS patientId, h.visit_id AS visitRecordId, h.ward_no AS wardNo, h.bed_no AS bedNo, h.admission_reason AS reasonText, h.status, DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt, p.name AS patientName FROM hospitalization_records h JOIN patients p ON h.patient_id = p.id ORDER BY h.created_at DESC`);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
exports.createHospitalization = async (req, res, next) => {
  try {
    const { patientId, visitRecordId, wardNo, bedNo, reasonText, status } = req.body;
    await pool.query(`INSERT INTO hospitalization_records (patient_id, visit_id, ward_no, bed_no, admission_reason, status) VALUES (?, ?, ?, ?, ?, ?)`, [patientId, visitRecordId, wardNo || '', bedNo || '', reasonText || '', status || '待入院']);
    res.json({ success: true, message: '住院登记新增成功' });
  } catch (error) { next(error); }
};
exports.updateHospitalization = async (req, res, next) => {
  try {
    const { patientId, visitRecordId, wardNo, bedNo, reasonText, status } = req.body;
    await pool.query(`UPDATE hospitalization_records SET patient_id = ?, visit_id = ?, ward_no = ?, bed_no = ?, admission_reason = ?, status = ? WHERE id = ?`, [patientId, visitRecordId, wardNo || '', bedNo || '', reasonText || '', status || '待入院', req.params.id]);
    res.json({ success: true, message: '住院登记更新成功' });
  } catch (error) { next(error); }
};
exports.deleteHospitalization = async (req, res, next) => { try { await pool.query('DELETE FROM hospitalization_records WHERE id = ?', [req.params.id]); res.json({ success: true, message: '住院登记删除成功' }); } catch (error) { next(error); } };
