document.addEventListener('DOMContentLoaded', () => {
  const departmentSelect = document.getElementById('departmentId');
  const doctorSelect = document.getElementById('doctorId');
  const scheduleSelect = document.getElementById('scheduleId');
  const bookingForm = document.getElementById('bookingForm');
  const messageBox = document.getElementById('messageBox');

  initDepartments();

  departmentSelect.addEventListener('change', async () => {
    scheduleSelect.innerHTML = '<option value="">请先选择医生</option>';
    if (!departmentSelect.value) {
      doctorSelect.innerHTML = '<option value="">请先选择科室</option>';
      return;
    }
    try {
      const res = await request(`/api/doctors?departmentId=${departmentSelect.value}`);
      doctorSelect.innerHTML = '<option value="">请选择医生</option>' + res.data.map((item) => `
        <option value="${item.id}">${item.name}（${item.title}）</option>
      `).join('');
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  });

  doctorSelect.addEventListener('change', async () => {
    if (!doctorSelect.value) {
      scheduleSelect.innerHTML = '<option value="">请先选择医生</option>';
      return;
    }
    try {
      const res = await request(`/api/slots/${doctorSelect.value}`);
      scheduleSelect.innerHTML = '<option value="">请选择就诊时段</option>' + res.data.map((item) => `
        <option value="${item.id}">${item.workDate} ${item.timePeriod}｜余号 ${item.remainingCount}/${item.totalCount}｜${item.heatLevel}</option>
      `).join('');
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  });

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(messageBox);
    const formData = Object.fromEntries(new FormData(bookingForm).entries());
    formData.age = Number(formData.age);
    try {
      const res = await request('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showMessage(messageBox, `预约成功，预约编号：${res.data.appointmentNo}`, 'success');
      bookingForm.reset();
      doctorSelect.innerHTML = '<option value="">请先选择科室</option>';
      scheduleSelect.innerHTML = '<option value="">请先选择医生</option>';
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  });
});

async function initDepartments() {
  const departmentSelect = document.getElementById('departmentId');
  const messageBox = document.getElementById('messageBox');
  try {
    const res = await request('/api/departments');
    departmentSelect.innerHTML = '<option value="">请选择科室</option>' + res.data.map((item) => `
      <option value="${item.id}">${item.name}</option>
    `).join('');
  } catch (error) {
    showMessage(messageBox, error.message, 'error');
  }
}
