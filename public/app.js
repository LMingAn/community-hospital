const state = {
  departments: [],
  doctors: [],
  currentDepartmentId: null,
  currentDoctorId: null,
  currentSlots: []
};

const $ = selector => document.querySelector(selector);

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}
window.scrollToSection = scrollToSection;

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '请求失败');
  return data;
}

function renderDepartments() {
  const wrap = $('#departmentList');
  const select = $('#departmentSelect');
  wrap.innerHTML = state.departments.map(dep => `
    <div class="department-card card ${state.currentDepartmentId === dep.id ? 'active' : ''}" onclick="selectDepartment(${dep.id})">
      <div class="department-icon">${dep.icon}</div>
      <h3>${dep.name}</h3>
      <p>${dep.desc}</p>
    </div>
  `).join('');

  select.innerHTML = '<option value="">选择科室</option>' + state.departments.map(dep => `<option value="${dep.id}">${dep.name}</option>`).join('');
}

window.selectDepartment = async function(departmentId) {
  state.currentDepartmentId = departmentId;
  $('#departmentSelect').value = departmentId;
  renderDepartments();
  await loadDoctors(departmentId);
};

async function loadDepartments() {
  const res = await request('/api/departments');
  state.departments = res.data;
  if (!state.currentDepartmentId && state.departments.length) {
    state.currentDepartmentId = state.departments[0].id;
  }
  renderDepartments();
  $('#departmentSelect').onchange = e => selectDepartment(Number(e.target.value));
}

function renderDoctors() {
  const wrap = $('#doctorList');
  const doctorSelect = $('#doctorSelect');
  wrap.innerHTML = state.doctors.map(doc => `
    <div class="doctor-card ${state.currentDoctorId === doc.id ? 'active' : ''}" onclick="selectDoctor(${doc.id})">
      <div class="avatar">${doc.avatar}</div>
      <div class="doctor-main">
        <h3>${doc.name} · ${doc.title}</h3>
        <div class="doctor-meta">
          <span>专长：${doc.specialty}</span>
          <span>评分：${doc.score}</span>
        </div>
        <p>${doc.intro}</p>
      </div>
    </div>
  `).join('');

  doctorSelect.innerHTML = '<option value="">选择医生</option>' + state.doctors.map(doc => `<option value="${doc.id}">${doc.name}（${doc.title}）</option>`).join('');
}

async function loadDoctors(departmentId) {
  const res = await request(`/api/doctors?departmentId=${departmentId}`);
  state.doctors = res.data;
  state.currentDoctorId = state.doctors[0]?.id || null;
  renderDoctors();
  $('#doctorSelect').value = state.currentDoctorId || '';
  $('#doctorSelect').onchange = e => selectDoctor(Number(e.target.value));
  if (state.currentDoctorId) await loadSlots(state.currentDoctorId);
}

window.selectDoctor = async function(doctorId) {
  state.currentDoctorId = doctorId;
  $('#doctorSelect').value = doctorId;
  renderDoctors();
  await loadSlots(doctorId);
};

function renderSlots() {
  const board = $('#slotBoard');
  if (!state.currentSlots.length) {
    board.className = 'slot-board empty';
    board.textContent = '暂无可预约号源';
    return;
  }
  board.className = 'slot-board';
  board.innerHTML = state.currentSlots.slice(0, 12).map(slot => `
    <div class="slot-chip" onclick="selectSlot('${slot.date}','${slot.time}')">
      <strong>${slot.date} ${slot.time}</strong>
      <small class="heat-${slot.heat}">${slot.heat} · 剩余 ${slot.remaining} 号</small>
    </div>
  `).join('');
}

async function loadSlots(doctorId) {
  const res = await request(`/api/slots/${doctorId}`);
  state.currentSlots = res.data;
  renderSlots();
}

window.selectSlot = function(date, time) {
  $('#dateInput').value = date;
  $('#timeInput').value = time;
  document.querySelectorAll('.slot-chip').forEach(el => {
    el.classList.toggle('active', el.textContent.includes(`${date} ${time}`));
  });
};

async function loadStats() {
  const res = await request('/api/admin/stats');
  $('#statTotal').textContent = res.data.total;
  $('#statToday').textContent = res.data.todayCount;
}

$('#triageBtn').addEventListener('click', async () => {
  const symptom = $('#symptomInput').value.trim();
  if (!symptom) return alert('请先输入症状描述');
  const res = await request('/api/triage', { method: 'POST', body: JSON.stringify({ symptom }) });
  const box = $('#triageBox');
  box.classList.remove('hidden');
  box.innerHTML = `<strong>分诊等级：${res.data.level}</strong><p>${res.data.suggestion}</p>`;
});

$('#bookingForm').addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  try {
    const res = await request('/api/appointments', { method: 'POST', body: JSON.stringify(payload) });
    const box = $('#resultBox');
    box.classList.remove('hidden');
    box.innerHTML = `
      <strong>预约成功</strong>
      <p>预约编号：${res.data.appointmentId}</p>
      <p>科室：${res.data.departmentName} ｜ 医生：${res.data.doctorName}</p>
      <p>系统建议：${res.data.triage.suggestion}</p>
    `;
    e.target.reset();
    $('#dateInput').value = '';
    $('#timeInput').value = '';
    $('#triageBox').classList.add('hidden');
    await loadSlots(state.currentDoctorId);
    await loadStats();
  } catch (err) {
    alert(err.message);
  }
});

$('#queryBtn').addEventListener('click', async () => {
  const phone = $('#queryPhone').value.trim();
  if (!phone) return alert('请输入手机号');
  const res = await request(`/api/appointments?phone=${phone}`);
  const wrap = $('#appointmentTimeline');
  if (!res.data.length) {
    wrap.innerHTML = '<div class="timeline-item">未查询到预约记录</div>';
    return;
  }
  wrap.innerHTML = res.data.map(item => `
    <div class="timeline-item">
      <strong>${item.patientName} · ${item.departmentName} · ${item.doctorName}</strong>
      <p>预约时间：${item.date} ${item.time}</p>
      <p>分诊等级：${item.triageLevel} ｜ 当前状态：${item.status}</p>
      <p>症状描述：${item.symptom}</p>
    </div>
  `).join('');
});

$('#adminLoginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  try {
    const res = await request('/api/admin/login', { method: 'POST', body: JSON.stringify(payload) });
    $('#adminLoginMsg').textContent = `登录成功：${res.data.name}`;
    $('#dashboard').classList.remove('hidden');
    await renderDashboard();
  } catch (err) {
    $('#adminLoginMsg').textContent = err.message;
  }
});

function renderBarList(targetId, data, keyName = 'name', keyValue = 'count') {
  const max = Math.max(...data.map(item => item[keyValue]), 1);
  $(targetId).innerHTML = data.map(item => `
    <div class="bar-row">
      <div class="bar-label"><span>${item[keyName] || item.status}</span><span>${item[keyValue]}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(item[keyValue] / max) * 100}%"></div></div>
    </div>
  `).join('');
}

async function renderDashboard() {
  const statRes = await request('/api/admin/stats');
  const appRes = await request('/api/appointments');
  $('#dashTotal').textContent = statRes.data.total;
  $('#dashToday').textContent = statRes.data.todayCount;
  $('#dashDone').textContent = statRes.data.statusMap.find(i => i.status === '已完成')?.count || 0;
  renderBarList('#deptBars', statRes.data.byDept);
  renderBarList('#statusBars', statRes.data.statusMap, 'status');

  $('#adminTableBody').innerHTML = appRes.data.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.patientName}</td>
      <td>${item.departmentName}</td>
      <td>${item.doctorName}</td>
      <td>${item.date} ${item.time}</td>
      <td>${item.status}</td>
      <td>
        <select class="status-select" onchange="updateStatus(${item.id}, this.value)">
          <option ${item.status === '已预约' ? 'selected' : ''}>已预约</option>
          <option ${item.status === '已完成' ? 'selected' : ''}>已完成</option>
          <option ${item.status === '已取消' ? 'selected' : ''}>已取消</option>
        </select>
      </td>
    </tr>
  `).join('');
}

window.updateStatus = async function(id, status) {
  await request(`/api/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  await renderDashboard();
};

async function bootstrap() {
  await loadDepartments();
  await loadDoctors(state.currentDepartmentId);
  await loadStats();
}

bootstrap();
