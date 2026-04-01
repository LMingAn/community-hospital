const crypto = require('crypto');
const { pool } = require('../config/db');

function createToken(username) {
  return crypto
    .createHash('sha256')
    .update(`${username}-${Date.now()}-${Math.random()}`)
    .digest('hex');
}

function mapHeatLevel(remaining) {
  if (remaining >= 8) return '推荐';
  if (remaining >= 4) return '较忙';
  return '高峰';
}

function triageDepartment(symptomText) {
  const text = String(symptomText || '').trim();
  if (!text) {
    return { department: '全科门诊', advice: '请先填写主要症状，系统会给出推荐科室。' };
  }

  const rules = [
    { keywords: ['发热', '咳嗽', '喉咙', '感冒', '鼻塞', '流涕'], department: '全科门诊', advice: '建议先到全科门诊进行基础检查，必要时转诊呼吸相关专科。' },
    { keywords: ['胸闷', '心慌', '心悸', '血压', '胸痛'], department: '内科', advice: '该症状与心血管或内科相关，建议优先预约内科。' },
    { keywords: ['胃痛', '腹痛', '腹泻', '反酸', '恶心'], department: '内科', advice: '建议预约内科进行消化系统问诊。' },
    { keywords: ['皮疹', '过敏', '瘙痒', '皮肤'], department: '皮肤科', advice: '该症状与皮肤问题相关，建议预约皮肤科。' },
    { keywords: ['关节', '扭伤', '骨折', '腰痛', '颈椎', '腿疼'], department: '外科', advice: '建议到外科或骨伤相关门诊进一步检查。' },
    { keywords: ['孕', '月经', '妇科', '白带', '产检'], department: '妇科', advice: '建议预约妇科进行专业问诊。' },
    { keywords: ['儿童', '小孩', '婴儿', '儿科', '宝宝'], department: '儿科', advice: '建议预约儿科，由儿科医生进行诊断。' }
  ];

  const hit = rules.find((item) => item.keywords.some((keyword) => text.includes(keyword)));
  return hit || { department: '全科门诊', advice: '症状未命中明确规则，建议优先选择全科门诊进行初步诊疗。' };
}

async function getSessionStatus(req, res, next) {
  try {
    res.json({ success: true, isAdminLoggedIn: Boolean(req.signedCookies.adminToken) });
  } catch (error) {
    next(error);
  }
}

async function getDepartments(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name, introduction, floor_no AS floorNo FROM departments ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getDoctors(req, res, next) {
  try {
    const { departmentId } = req.query;
    let sql = `
      SELECT d.id, d.name, d.title, d.specialty, d.photo, dp.name AS departmentName
      FROM doctors d
      INNER JOIN departments dp ON d.department_id = dp.id
    `;
    const params = [];

    if (departmentId) {
      sql += ' WHERE d.department_id = ?';
      params.push(departmentId);
    }

    sql += ' ORDER BY d.id';
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getDoctorSlots(req, res, next) {
  try {
    const { doctorId } = req.params;
    const [rows] = await pool.query(
      `SELECT id, work_date AS workDate, time_period AS timePeriod, total_count AS totalCount, remaining_count AS remainingCount
       FROM schedules WHERE doctor_id = ? ORDER BY work_date, id`,
      [doctorId]
    );
    const data = rows.map((item) => ({ ...item, heatLevel: mapHeatLevel(item.remainingCount) }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

async function postTriage(req, res, next) {
  try {
    const { symptom } = req.body;
    const result = triageDepartment(symptom);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

async function createAppointment(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { patientName, gender, age, phone, idCard, departmentId, doctorId, scheduleId, symptom } = req.body;

    if (!patientName || !gender || !age || !phone || !departmentId || !doctorId || !scheduleId || !symptom) {
      return res.status(400).json({ success: false, message: '请完整填写预约信息' });
    }

    await connection.beginTransaction();

    const [scheduleRows] = await connection.query(
      'SELECT id, remaining_count FROM schedules WHERE id = ? AND doctor_id = ? FOR UPDATE',
      [scheduleId, doctorId]
    );

    if (!scheduleRows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: '未找到对应号源' });
    }

    if (scheduleRows[0].remaining_count <= 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: '当前号源已满，请重新选择时间段' });
    }

    const appointmentNo = `YY${Date.now().toString().slice(-10)}`;
    await connection.query(
      `INSERT INTO appointments
      (appointment_no, patient_name, gender, age, phone, id_card, department_id, doctor_id, schedule_id, symptom, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '待就诊', NOW())`,
      [appointmentNo, patientName, gender, age, phone, idCard || '', departmentId, doctorId, scheduleId, symptom]
    );

    await connection.query(
      'UPDATE schedules SET remaining_count = remaining_count - 1 WHERE id = ?',
      [scheduleId]
    );

    await connection.commit();
    res.json({ success: true, message: '预约成功', data: { appointmentNo } });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

async function queryAppointmentsByPhone(req, res, next) {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: '请输入手机号' });
    }

    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.patient_name AS patientName, a.gender, a.age, a.phone, a.symptom,
              a.status, DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt,
              dp.name AS departmentName, d.name AS doctorName,
              s.work_date AS workDate, s.time_period AS timePeriod
       FROM appointments a
       INNER JOIN departments dp ON a.department_id = dp.id
       INNER JOIN doctors d ON a.doctor_id = d.id
       INNER JOIN schedules s ON a.schedule_id = s.id
       WHERE a.phone = ?
       ORDER BY a.created_at DESC`,
      [phone]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '请输入账号和密码' });
    }

    const [rows] = await pool.query('SELECT id, username, password FROM admins WHERE username = ? LIMIT 1', [username]);
    if (!rows.length || rows[0].password !== password) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    const token = createToken(username);
    res.cookie('adminToken', token, {
      httpOnly: true,
      signed: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8
    });

    res.json({ success: true, message: '登录成功' });
  } catch (error) {
    next(error);
  }
}

async function adminLogout(req, res, next) {
  try {
    res.clearCookie('adminToken');
    res.json({ success: true, message: '已退出登录' });
  } catch (error) {
    next(error);
  }
}

async function getAdminStats(req, res, next) {
  try {
    const [[appointmentStats]] = await pool.query(
      `SELECT
         COUNT(*) AS totalAppointments,
         SUM(CASE WHEN status = '待就诊' THEN 1 ELSE 0 END) AS pendingCount,
         SUM(CASE WHEN status = '已完成' THEN 1 ELSE 0 END) AS completedCount,
         SUM(CASE WHEN status = '已取消' THEN 1 ELSE 0 END) AS cancelledCount
       FROM appointments`
    );

    const [deptStats] = await pool.query(
      `SELECT dp.name AS departmentName, COUNT(a.id) AS count
       FROM departments dp
       LEFT JOIN appointments a ON a.department_id = dp.id
       GROUP BY dp.id, dp.name
       ORDER BY count DESC, dp.id ASC`
    );

    res.json({ success: true, data: { appointmentStats, deptStats } });
  } catch (error) {
    next(error);
  }
}

async function getAllAppointments(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT a.id, a.appointment_no AS appointmentNo, a.patient_name AS patientName, a.phone, a.gender, a.age, a.status,
              dp.name AS departmentName, d.name AS doctorName, s.work_date AS workDate, s.time_period AS timePeriod,
              DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS createdAt
       FROM appointments a
       INNER JOIN departments dp ON a.department_id = dp.id
       INNER JOIN doctors d ON a.doctor_id = d.id
       INNER JOIN schedules s ON a.schedule_id = s.id
       ORDER BY a.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowStatus = ['待就诊', '已完成', '已取消'];
    if (!allowStatus.includes(status)) {
      return res.status(400).json({ success: false, message: '状态值不合法' });
    }

    const [result] = await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: '未找到预约记录' });
    }

    res.json({ success: true, message: '状态更新成功' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSessionStatus,
  getDepartments,
  getDoctors,
  getDoctorSlots,
  postTriage,
  createAppointment,
  queryAppointmentsByPhone,
  adminLogin,
  adminLogout,
  getAdminStats,
  getAllAppointments,
  updateAppointmentStatus,
};
