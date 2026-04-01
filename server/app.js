const express = require('express');
const path = require('path');
const { readDB, writeDB, ensureDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

ensureDB();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function getDepartmentName(db, departmentId) {
  const d = db.departments.find(item => item.id === Number(departmentId));
  return d ? d.name : '';
}

function triageBySymptom(symptom = '') {
  const text = symptom.toLowerCase();
  if (/胸痛|呼吸困难|晕厥|抽搐|剧烈/.test(symptom)) {
    return { level: '紧急', suggestion: '建议立即前往急诊或拨打急救电话，不建议仅做普通预约。' };
  }
  if (/发热|低热|高烧|咳嗽|持续咳嗽|腹痛|呕吐|牙痛/.test(symptom)) {
    return { level: '优先', suggestion: '建议选择近24小时内号源，优先安排就诊。' };
  }
  if (/失眠|复诊|体检|咨询|调理/.test(symptom)) {
    return { level: '普通', suggestion: '可按个人时间灵活预约，系统建议错峰时段。' };
  }
  return { level: '普通', suggestion: '请完善症状描述，系统将给出更精准的分诊建议。' };
}

app.get('/api/departments', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.departments });
});

app.get('/api/doctors', (req, res) => {
  const db = readDB();
  const departmentId = req.query.departmentId;
  let data = db.doctors;
  if (departmentId) data = data.filter(d => d.departmentId === Number(departmentId));
  res.json({ success: true, data });
});

app.get('/api/slots/:doctorId', (req, res) => {
  const db = readDB();
  const doctor = db.doctors.find(d => d.id === Number(req.params.doctorId));
  if (!doctor) return res.status(404).json({ success: false, message: '医生不存在' });
  const enriched = doctor.slots.map(slot => ({
    ...slot,
    heat: slot.remaining <= 3 ? '高峰' : slot.remaining <= 6 ? '较忙' : '推荐'
  }));
  res.json({ success: true, data: enriched });
});

app.post('/api/triage', (req, res) => {
  const { symptom } = req.body;
  res.json({ success: true, data: triageBySymptom(symptom) });
});

app.post('/api/appointments', (req, res) => {
  const { patientName, phone, gender, age, departmentId, doctorId, date, time, symptom } = req.body;
  if (!patientName || !phone || !departmentId || !doctorId || !date || !time) {
    return res.status(400).json({ success: false, message: '请完整填写预约信息' });
  }

  const db = readDB();
  const doctor = db.doctors.find(d => d.id === Number(doctorId));
  if (!doctor) return res.status(404).json({ success: false, message: '未找到医生' });

  const slot = doctor.slots.find(s => s.date === date && s.time === time);
  if (!slot || slot.remaining <= 0) {
    return res.status(400).json({ success: false, message: '该时段号源已满，请重新选择' });
  }

  const triage = triageBySymptom(symptom);
  const id = Date.now();
  db.appointments.unshift({
    id,
    patientName,
    phone,
    gender,
    age: Number(age || 0),
    departmentId: Number(departmentId),
    doctorId: Number(doctorId),
    date,
    time,
    symptom,
    triageLevel: triage.level,
    status: '已预约',
    createdAt: new Date().toISOString()
  });
  slot.remaining -= 1;
  writeDB(db);

  res.json({
    success: true,
    message: '预约成功',
    data: {
      appointmentId: id,
      departmentName: getDepartmentName(db, departmentId),
      doctorName: doctor.name,
      triage
    }
  });
});

app.get('/api/appointments', (req, res) => {
  const { phone } = req.query;
  const db = readDB();
  let data = db.appointments.map(item => ({
    ...item,
    departmentName: getDepartmentName(db, item.departmentId),
    doctorName: (db.doctors.find(d => d.id === item.doctorId) || {}).name || ''
  }));
  if (phone) data = data.filter(item => item.phone === phone);
  res.json({ success: true, data });
});

app.patch('/api/appointments/:id/status', (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const appointment = db.appointments.find(a => a.id === Number(req.params.id));
  if (!appointment) return res.status(404).json({ success: false, message: '预约不存在' });
  appointment.status = status || appointment.status;
  writeDB(db);
  res.json({ success: true, message: '状态更新成功' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const admin = db.admins.find(a => a.username === username && a.password === password);
  if (!admin) return res.status(401).json({ success: false, message: '账号或密码错误' });
  res.json({ success: true, data: { name: admin.name, username: admin.username } });
});

app.get('/api/admin/stats', (req, res) => {
  const db = readDB();
  const total = db.appointments.length;
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = db.appointments.filter(a => a.date === today).length;
  const byDept = db.departments.map(dep => ({
    name: dep.name,
    count: db.appointments.filter(a => a.departmentId === dep.id).length
  }));
  const statusMap = ['已预约', '已完成', '已取消'].map(status => ({
    status,
    count: db.appointments.filter(a => a.status === status).length
  }));
  res.json({ success: true, data: { total, todayCount, byDept, statusMap } });
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
