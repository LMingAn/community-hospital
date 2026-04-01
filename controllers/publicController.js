const pool = require('../config/db');

function normalizeSymptom(text = '') {
  return String(text).trim().toLowerCase();
}

function triageBySymptom(symptom = '') {
  const value = normalizeSymptom(symptom);
  if (!value) return { department: '全科门诊', level: '常规', advice: '请先描述主要症状后再进行分诊。' };
  if (/发热|咳嗽|流感|感冒|嗓子|呼吸/.test(value)) return { department: '全科门诊', level: '优先', advice: '建议优先前往全科门诊，必要时进行血常规或呼吸道相关检查。' };
  if (/高血压|心慌|胸闷|胸痛|心脏/.test(value)) return { department: '慢病管理科', level: '优先', advice: '建议先测量血压、心率，如胸痛明显请尽快就医。' };
  if (/糖尿病|血糖|口渴|乏力/.test(value)) return { department: '慢病管理科', level: '常规', advice: '建议空腹检测血糖并咨询慢病管理科医生。' };
  if (/胃痛|腹痛|腹泻|恶心|呕吐/.test(value)) return { department: '全科门诊', level: '常规', advice: '建议挂全科门诊，必要时转消化相关专科。' };
  if (/儿童|小孩|发育|疫苗/.test(value)) return { department: '儿保门诊', level: '常规', advice: '建议前往儿保门诊进行咨询或接种评估。' };
  return { department: '全科门诊', level: '常规', advice: '建议先由全科门诊初步评估，再根据诊断结果分诊。' };
}

exports.getDepartments = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, location FROM departments WHERE status = 1 ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const params = [];
    let sql = `SELECT d.id, d.name, d.title, d.specialty, d.intro, d.avatar, d.department_id AS departmentId, dp.name AS departmentName
               FROM doctors d LEFT JOIN departments dp ON d.department_id = dp.id WHERE d.status = 1`;
    if (departmentId) {
      sql += ' AND d.department_id = ?';
      params.push(departmentId);
    }
    sql += ' ORDER BY d.id';
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getDoctorSchedules = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const [rows] = await pool.query(
      `SELECT s.id, s.doctor_id AS doctorId, s.schedule_date AS scheduleDate, s.period, s.max_number AS maxNumber,
              s.booked_number AS bookedNumber,
              (s.max_number - s.booked_number) AS remainingNumber,
              s.fee, s.status
       FROM doctor_schedules s
       WHERE s.doctor_id = ? AND s.status = 'available'
       ORDER BY s.schedule_date, FIELD(s.period, '上午','下午','夜间')`,
      [doctorId]
    );
    const data = rows.map((item) => ({
      ...item,
      heatLevel: item.remainingNumber <= 2 ? '高峰' : item.remainingNumber <= 5 ? '较忙' : '推荐'
    }));
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.triage = async (req, res) => {
  const { symptom } = req.body;
  const result = triageBySymptom(symptom);
  res.json({ success: true, data: result });
};

exports.createAppointment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { patientName, gender, age, phone, idCard, symptom, departmentId, doctorId, scheduleId, visitDate, period } = req.body;
    if (!patientName || !phone || !departmentId || !doctorId || !scheduleId || !visitDate || !period) {
      return res.status(400).json({ success: false, message: '请完整填写预约信息' });
    }
    await conn.beginTransaction();
    const [scheduleRows] = await conn.query(
      'SELECT id, max_number AS maxNumber, booked_number AS bookedNumber, status FROM doctor_schedules WHERE id = ? FOR UPDATE',
      [scheduleId]
    );
    if (!scheduleRows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: '号源不存在' });
    }
    const schedule = scheduleRows[0];
    if (schedule.status !== 'available' || schedule.bookedNumber >= schedule.maxNumber) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '该号源已满或不可预约' });
    }

    const [repeatRows] = await conn.query(
      `SELECT id FROM appointments WHERE phone = ? AND schedule_id = ? AND status IN ('待就诊','已签到','就诊中') LIMIT 1`,
      [phone, scheduleId]
    );
    if (repeatRows.length) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '当前号源已存在同手机号预约记录，请勿重复预约' });
    }

    const appointmentNo = `YY${Date.now()}${Math.floor(Math.random() * 90 + 10)}`;
    const [result] = await conn.query(
      `INSERT INTO appointments
      (appointment_no, patient_name, gender, age, phone, id_card, symptom, department_id, doctor_id, schedule_id, visit_date, period, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待就诊', NOW())`,
      [appointmentNo, patientName, gender || '未填写', age || null, phone, idCard || '', symptom || '', departmentId, doctorId, scheduleId, visitDate, period]
    );

    await conn.query('UPDATE doctor_schedules SET booked_number = booked_number + 1 WHERE id = ?', [scheduleId]);
    await conn.query(
      `INSERT INTO appointment_logs (appointment_id, action, remark, created_at)
       VALUES (?, '创建预约', '患者成功提交预约', NOW())`,
      [result.insertId]
    );
    await conn.commit();
    res.json({ success: true, message: '预约成功', data: { appointmentId: result.insertId, appointmentNo } });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};

exports.queryAppointments = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: '请输入手机号查询预约记录' });
    }
    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.patient_name AS patientName, a.phone, a.visit_date AS visitDate, a.period, a.status,
              a.symptom, d.name AS doctorName, d.title, dp.name AS departmentName, s.fee
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       LEFT JOIN departments dp ON a.department_id = dp.id
       LEFT JOIN doctor_schedules s ON a.schedule_id = s.id
       WHERE a.phone = ?
       ORDER BY a.created_at DESC`, [phone]
    );
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getAppointmentTimeline = async (req, res, next) => {
  try {
    const { appointmentNo } = req.params;
    const [appointmentRows] = await pool.query('SELECT id, appointment_no AS appointmentNo, status FROM appointments WHERE appointment_no = ?', [appointmentNo]);
    if (!appointmentRows.length) {
      return res.status(404).json({ success: false, message: '未找到对应预约单号' });
    }
    const [logs] = await pool.query(
      'SELECT action, remark, created_at AS createdAt FROM appointment_logs WHERE appointment_id = ? ORDER BY created_at ASC',
      [appointmentRows[0].id]
    );
    res.json({ success: true, data: { appointment: appointmentRows[0], logs } });
  } catch (error) { next(error); }
};

exports.cancelAppointment = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    await conn.beginTransaction();
    const [rows] = await conn.query('SELECT id, schedule_id AS scheduleId, status FROM appointments WHERE id = ? FOR UPDATE', [id]);
    if (!rows.length) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: '预约记录不存在' });
    }
    const item = rows[0];
    if (item.status === '已取消') {
      await conn.rollback();
      return res.status(400).json({ success: false, message: '该预约已取消' });
    }
    await conn.query("UPDATE appointments SET status = '已取消' WHERE id = ?", [id]);
    await conn.query('UPDATE doctor_schedules SET booked_number = GREATEST(booked_number - 1, 0) WHERE id = ?', [item.scheduleId]);
    await conn.query(
      `INSERT INTO appointment_logs (appointment_id, action, remark, created_at)
       VALUES (?, '取消预约', '患者主动取消预约', NOW())`, [id]
    );
    await conn.commit();
    res.json({ success: true, message: '已成功取消预约' });
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    conn.release();
  }
};
