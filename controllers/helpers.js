const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
}

function weekdayOf(dateString) {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function normalizeSymptom(text = '') {
  return String(text).trim().toLowerCase();
}

function triageBySymptom(symptom = '') {
  const value = normalizeSymptom(symptom);
  if (!value) return { department: '全科门诊', advice: '症状描述为空，建议先挂全科门诊。' };
  if (/发热|咳嗽|呼吸|感冒|喉咙|腹痛|胃痛|腹泻/.test(value)) {
    return { department: '全科门诊', advice: '建议先由全科门诊进行初步筛查和诊疗。' };
  }
  if (/高血压|血压|糖尿病|血糖|胸闷|心慌/.test(value)) {
    return { department: '慢病管理科', advice: '建议至慢病管理科进行复诊或指标评估。' };
  }
  if (/儿童|小孩|发育|疫苗|婴儿/.test(value)) {
    return { department: '儿科门诊', advice: '建议挂儿科门诊，由儿科医生接诊。' };
  }
  return { department: '全科门诊', advice: '建议先挂全科门诊，必要时再由医生转诊。' };
}

module.exports = { hashPassword, weekdayOf, triageBySymptom };
