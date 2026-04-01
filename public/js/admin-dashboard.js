document.addEventListener('DOMContentLoaded', async () => {
  const statTotal = document.getElementById('statTotal');
  const statPending = document.getElementById('statPending');
  const statCompleted = document.getElementById('statCompleted');
  const statCancelled = document.getElementById('statCancelled');
  const deptStatBody = document.getElementById('deptStatBody');
  const appointmentBody = document.getElementById('appointmentBody');
  const messageBox = document.getElementById('messageBox');

  try {
    await request('/api/session').then((res) => {
      if (!res.isAdminLoggedIn) {
        const current = encodeURIComponent('/admin-dashboard.html');
        window.location.href = `/admin-login.html?returnTo=${current}`;
        throw new Error('redirect');
      }
    });
  } catch (error) {
    if (error.message !== 'redirect') {
      showMessage(messageBox, error.message, 'error');
    }
    return;
  }

  await loadStats();
  await loadAppointments();

  async function loadStats() {
    try {
      const res = await request('/api/admin/stats');
      const stats = res.data.appointmentStats;
      statTotal.textContent = stats.totalAppointments || 0;
      statPending.textContent = stats.pendingCount || 0;
      statCompleted.textContent = stats.completedCount || 0;
      statCancelled.textContent = stats.cancelledCount || 0;
      deptStatBody.innerHTML = res.data.deptStats.map((item) => `
        <tr><td>${item.departmentName}</td><td>${item.count}</td></tr>
      `).join('');
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  }

  async function loadAppointments() {
    try {
      const res = await request('/api/admin/appointments');
      appointmentBody.innerHTML = res.data.map((item) => `
        <tr>
          <td>${item.appointmentNo}</td>
          <td>${item.patientName}</td>
          <td>${item.phone}</td>
          <td>${item.departmentName}</td>
          <td>${item.doctorName}</td>
          <td>${item.workDate} ${item.timePeriod}</td>
          <td>
            <select data-id="${item.id}" class="status-select">
              <option value="待就诊" ${item.status === '待就诊' ? 'selected' : ''}>待就诊</option>
              <option value="已完成" ${item.status === '已完成' ? 'selected' : ''}>已完成</option>
              <option value="已取消" ${item.status === '已取消' ? 'selected' : ''}>已取消</option>
            </select>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="7">暂无预约数据</td></tr>';

      document.querySelectorAll('.status-select').forEach((select) => {
        select.addEventListener('change', async () => {
          try {
            await request(`/api/admin/appointments/${select.dataset.id}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status: select.value })
            });
            showMessage(messageBox, '预约状态更新成功', 'success');
            await loadStats();
          } catch (error) {
            showMessage(messageBox, error.message, 'error');
          }
        });
      });
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  }
});
