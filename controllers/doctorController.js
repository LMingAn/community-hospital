const pool = require('../config/db');

exports.announcements = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, title, content, publish_time AS publishTime FROM announcements WHERE status = 1 ORDER BY publish_time DESC');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.mySchedules = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, weekday, period, max_number AS maxNumber, fee, status FROM weekly_schedules WHERE doctor_id = ? ORDER BY weekday, FIELD(period, "上午","下午","夜间")',
      [req.session.doctor.id]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.myAppointments = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.visit_date AS visitDate, a.period, a.queue_no AS queueNo, a.status, a.symptom,
              p.name AS patientName, p.gender, p.age, p.phone, dp.name AS departmentName
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN departments dp ON a.department_id = dp.id
       WHERE a.doctor_id = ? AND a.visit_date = ?
       ORDER BY FIELD(a.period, '上午','下午','夜间'), a.queue_no`, [req.session.doctor.id, date]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.callPatient = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT id, status FROM appointments WHERE id = ? AND doctor_id = ? FOR UPDATE', [id, req.session.doctor.id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: '挂号记录不存在' });
    }
    if (rows[0].status !== '待叫号') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '当前状态不可叫号' });
    }
    await conn.query("UPDATE appointments SET status = '已叫号' WHERE id = ?", [id]);
    await conn.query('INSERT INTO appointment_logs (appointment_id, action, remark) VALUES (?, ?, ?)', [id, '医生叫号', '医生已对患者进行叫号']);
    await conn.commit();
    res.json({ success: true, message: '叫号成功' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

exports.saveVisit = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { appointmentId, diagnosis, adviceHtml, prescription, needHospitalization, wardNo, bedNo, reasonText } = req.body;
    await conn.beginTransaction();
    const [rows] = await conn.query(
      'SELECT id, patient_id AS patientId, status FROM appointments WHERE id = ? AND doctor_id = ? FOR UPDATE',
      [appointmentId, req.session.doctor.id]
    );
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: '挂号记录不存在' });
    }
    const appointment = rows[0];
    if (!['已叫号', '就诊中', '待叫号'].includes(appointment.status)) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '当前挂号状态不可就诊' });
    }
    await conn.query("UPDATE appointments SET status = '已完成' WHERE id = ?", [appointmentId]);
    await conn.query(
      `INSERT INTO visit_records (appointment_id, patient_id, doctor_id, diagnosis, advice_html, prescription, need_hospitalization)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE diagnosis = VALUES(diagnosis), advice_html = VALUES(advice_html), prescription = VALUES(prescription), need_hospitalization = VALUES(need_hospitalization)`,
      [appointmentId, appointment.patientId, req.session.doctor.id, diagnosis || '', adviceHtml || '', prescription || '', needHospitalization ? 1 : 0]
    );
    const [[visitRow]] = await conn.query('SELECT id FROM visit_records WHERE appointment_id = ?', [appointmentId]);
    if (needHospitalization) {
      await conn.query(
        `INSERT INTO hospitalization_records (patient_id, visit_record_id, ward_no, bed_no, reason_text, status)
         VALUES (?, ?, ?, ?, ?, '待入院')`,
        [appointment.patientId, visitRow.id, wardNo || '', bedNo || '', reasonText || diagnosis || '根据病情建议住院观察']
      );
    }
    await conn.query('INSERT INTO appointment_logs (appointment_id, action, remark) VALUES (?, ?, ?)', [appointmentId, '完成就诊', '医生已填写病历并完成就诊']);
    await conn.commit();
    res.json({ success: true, message: '就诊记录保存成功' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};
