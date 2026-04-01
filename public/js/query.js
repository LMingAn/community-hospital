document.addEventListener('DOMContentLoaded', () => {
  const queryForm = document.getElementById('queryForm');
  const resultBody = document.getElementById('resultBody');
  const resultWrap = document.getElementById('resultWrap');
  const messageBox = document.getElementById('messageBox');

  queryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(messageBox);
    const phone = document.getElementById('phone').value.trim();
    try {
      const res = await request(`/api/appointments?phone=${encodeURIComponent(phone)}`);
      resultWrap.classList.remove('hidden');
      resultBody.innerHTML = res.data.map((item) => `
        <tr>
          <td>${item.appointmentNo}</td>
          <td>${item.patientName}</td>
          <td>${item.departmentName}</td>
          <td>${item.doctorName}</td>
          <td>${item.workDate} ${item.timePeriod}</td>
          <td class="${statusClass(item.status)}">${item.status}</td>
          <td>
            <ol class="timeline">
              <li>创建：${item.createdAt}</li>
              <li>当前：${item.status}</li>
            </ol>
          </td>
        </tr>
      `).join('') || '<tr><td colspan="7">未查询到相关预约记录</td></tr>';
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  });
});

function statusClass(status) {
  if (status === '已完成') return 'status-completed';
  if (status === '已取消') return 'status-cancelled';
  return 'status-pending';
}
