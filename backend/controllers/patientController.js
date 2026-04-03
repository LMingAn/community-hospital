const pool = require('../config/db');
const { triageBySymptom, weekdayOf } = require('./helpers');

exports.todayDoctors = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const weekday = weekdayOf(date);
    const [rows] = await pool.query(
      `SELECT w.id AS scheduleId, w.period, w.max_slots AS maxNumber, w.fee,
              d.id AS doctorId, d.name AS doctorName, d.title, d.specialty,
              dp.id AS departmentId, dp.name AS departmentName,
              (SELECT COUNT(*) FROM appointments a
                WHERE a.doctor_id = d.id AND a.visit_date = ? AND a.period = w.period AND a.status <> '已取消') AS bookedNumber
       FROM weekly_schedules w
       JOIN doctors d ON w.doctor_id = d.id
       JOIN departments dp ON dp.id = d.dept_id
       WHERE w.weekday = ? AND w.status = 1 AND d.status = 1
       ORDER BY dp.id, d.id, FIELD(w.period, '上午','下午','夜间')`, [date, weekday]
    );
    res.json({ success: true, data: rows.map(i => ({ ...i, visitDate: date, remainingNumber: Math.max(i.maxNumber - i.bookedNumber, 0) })) });
  } catch (error) { next(error); }
};

exports.createAppointment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { doctorId, departmentId, visitDate, period, symptom } = req.body;
    const patientId = req.session.patient.id;
    if (!doctorId || !departmentId || !visitDate || !period) {
      return res.status(400).json({ success: false, message: '挂号信息不完整' });
    }
    await conn.beginTransaction();
    const weekday = weekdayOf(visitDate);
    const [scheduleRows] = await conn.query(
      `SELECT id, max_slots AS maxNumber, fee, status FROM weekly_schedules
       WHERE doctor_id = ? AND weekday = ? AND period = ? FOR UPDATE`, [doctorId, weekday, period]
    );
    if (!scheduleRows.length || !scheduleRows[0].status) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '该医生当前时段未排班' });
    }
    const schedule = scheduleRows[0];
    const [[countRow]] = await conn.query(
      `SELECT COUNT(*) AS total FROM appointments
       WHERE doctor_id = ? AND visit_date = ? AND period = ? AND status <> '已取消'`, [doctorId, visitDate, period]
    );
    if (countRow.total >= schedule.maxNumber) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '当前时段号源已满' });
    }
    const [[repeatRow]] = await conn.query(
      `SELECT id FROM appointments WHERE patient_id = ? AND visit_date = ? AND period = ? AND status <> '已取消' LIMIT 1`,
      [patientId, visitDate, period]
    );
    if (repeatRow) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '同一时间段不可重复挂号' });
    }
    const queueNo = countRow.total + 1;
    const appointmentNo = `YY${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
    const triage = triageBySymptom(symptom || '');
    const [result] = await conn.query(
      `INSERT INTO appointments (appointment_no, patient_id, doctor_id, dept_id, visit_date, period, queue_number, fee, symptom, triage_advice, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待叫号')`,
      [appointmentNo, patientId, doctorId, departmentId, visitDate, period, queueNo, schedule.fee, symptom || '', triage.department]
    );
    await conn.query('INSERT INTO appointment_logs (appointment_id, action, remark) VALUES (?, ?, ?)', [result.insertId, '创建挂号', '患者完成线上预约挂号']);
    await conn.commit();
    res.json({ success: true, message: '挂号成功', data: { appointmentNo, queueNo, fee: schedule.fee } });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

exports.cancelAppointment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const patientId = req.session.patient.id;
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT id, status FROM appointments WHERE id = ? AND patient_id = ? FOR UPDATE', [id, patientId]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: '挂号记录不存在' });
    }
    if (rows[0].status !== '待叫号') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '医生叫号后不可在线取消' });
    }
    await conn.query("UPDATE appointments SET status = '已取消' WHERE id = ?", [id]);
    await conn.query('INSERT INTO appointment_logs (appointment_id, action, remark) VALUES (?, ?, ?)', [id, '取消挂号', '患者在叫号前取消挂号']);
    await conn.commit();
    res.json({ success: true, message: '挂号已取消' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

exports.myAppointments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.visit_date AS visitDate, a.period, a.queue_number AS queueNo, a.fee, a.symptom,
              a.triage_advice AS triageResult, a.status, d.name AS doctorName, d.title, dp.name AS departmentName
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN departments dp ON a.dept_id = dp.id
       WHERE a.patient_id = ?
       ORDER BY a.visit_date DESC, FIELD(a.period, '上午','下午','夜间')`, [req.session.patient.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.myVisits = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT v.id, v.diagnosis, v.advice_content_html AS adviceHtml, v.prescription, v.need_inpatient AS needHospitalization,
              DATE_FORMAT(v.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt, d.name AS doctorName, a.appointment_no AS appointmentNo, a.visit_date AS visitDate
       FROM visit_records v
       JOIN doctors d ON v.doctor_id = d.id
       JOIN appointments a ON v.appointment_id = a.id
       WHERE v.patient_id = ?
       ORDER BY v.created_at DESC`, [req.session.patient.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.myHospitalizations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT h.id, h.ward_no AS wardNo, h.bed_no AS bedNo, h.admission_reason AS reasonText, h.status, DATE_FORMAT(h.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
              d.name AS doctorName, v.diagnosis
       FROM hospitalization_records h
       JOIN visit_records v ON h.visit_id = v.id
       JOIN doctors d ON v.doctor_id = d.id
       WHERE h.patient_id = ?
       ORDER BY h.created_at DESC`, [req.session.patient.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};
