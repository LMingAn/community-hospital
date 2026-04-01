const pool = require('../config/db');
const { weekdayOf, triageBySymptom } = require('./helpers');

exports.getAnnouncements = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, title, content, publish_time AS publishTime FROM announcements WHERE status = 1 ORDER BY publish_time DESC LIMIT 10');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description, location FROM departments WHERE status = 1 ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
};

exports.getTodayDoctors = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().slice(0, 10);
    const weekday = weekdayOf(targetDate);
    const [rows] = await pool.query(
      `SELECT w.id AS scheduleId, w.weekday, w.period, w.max_number AS maxNumber, w.fee,
              d.id AS doctorId, d.name AS doctorName, d.title, d.specialty, d.intro,
              dp.id AS departmentId, dp.name AS departmentName,
              (SELECT COUNT(*) FROM appointments a
               WHERE a.doctor_id = d.id AND a.visit_date = ? AND a.period = w.period AND a.status <> '已取消') AS bookedNumber
       FROM weekly_schedules w
       JOIN doctors d ON w.doctor_id = d.id
       JOIN departments dp ON d.department_id = dp.id
       WHERE w.weekday = ? AND w.status = 1 AND d.status = 1
       ORDER BY dp.id, d.id, FIELD(w.period, '上午','下午','夜间')`,
      [targetDate, weekday]
    );
    const data = rows.map((item) => ({
      ...item,
      visitDate: targetDate,
      remainingNumber: Math.max(item.maxNumber - item.bookedNumber, 0)
    }));
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.triage = async (req, res) => {
  const { symptom } = req.body;
  res.json({ success: true, data: triageBySymptom(symptom) });
};
