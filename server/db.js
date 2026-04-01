const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');

function next7DaysSlots(baseDate = new Date()) {
  const slots = [];
  const times = ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    times.forEach(time => slots.push({ date, time, remaining: Math.floor(Math.random() * 6) + 4 }));
  }
  return slots;
}

function createSeedData() {
  const departments = [
    { id: 1, name: '全科门诊', icon: '🩺', desc: '适合常见病、慢性病复诊、基础问诊' },
    { id: 2, name: '儿科', icon: '👶', desc: '儿童发热、咳嗽、疫苗咨询与生长评估' },
    { id: 3, name: '口腔科', icon: '🦷', desc: '牙痛、洁牙、龋齿检查与修复建议' },
    { id: 4, name: '中医科', icon: '🌿', desc: '体质调理、失眠调理、颈肩腰腿痛辅助治疗' }
  ];

  const doctors = [
    { id: 1, departmentId: 1, name: '李清', title: '主任医师', specialty: '高血压、糖尿病、呼吸系统常见病', avatar: 'LQ', score: 4.9, intro: '20年基层医疗经验，擅长慢病管理与家庭签约指导', slots: next7DaysSlots() },
    { id: 2, departmentId: 1, name: '周远', title: '副主任医师', specialty: '发热、腹痛、社区常见急症初筛', avatar: 'ZY', score: 4.8, intro: '重视分诊效率与就诊体验，擅长快速判断就诊方向', slots: next7DaysSlots() },
    { id: 3, departmentId: 2, name: '陈沐', title: '主治医师', specialty: '儿童呼吸道感染、过敏、营养咨询', avatar: 'CM', score: 4.9, intro: '善于与儿童沟通，家长满意度较高', slots: next7DaysSlots() },
    { id: 4, departmentId: 3, name: '王雅', title: '口腔医师', specialty: '牙周护理、龋齿修复、儿童口腔检查', avatar: 'WY', score: 4.7, intro: '注重轻疼痛治疗与口腔预防保健', slots: next7DaysSlots() },
    { id: 5, departmentId: 4, name: '许衡', title: '中医师', specialty: '亚健康调理、颈肩不适、睡眠问题', avatar: 'XH', score: 4.8, intro: '结合社区人群特征提供个性化调理建议', slots: next7DaysSlots() }
  ];

  return {
    admins: [{ username: 'admin', password: '123456', name: '系统管理员' }],
    departments,
    doctors,
    appointments: [
      {
        id: 1001,
        patientName: '张敏',
        phone: '13800000001',
        gender: '女',
        age: 32,
        departmentId: 1,
        doctorId: 1,
        date: next7DaysSlots()[0].date,
        time: '09:30',
        symptom: '咳嗽三天，伴低热',
        triageLevel: '普通',
        status: '已预约',
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function ensureDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(createSeedData(), null, 2), 'utf-8');
  }
}

function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readDB, writeDB, ensureDB };
