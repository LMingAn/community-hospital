document.addEventListener('DOMContentLoaded', () => {
  const triageForm = document.getElementById('triageForm');
  const triageResult = document.getElementById('triageResult');
  const deptList = document.getElementById('deptList');

  if (triageForm) {
    triageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const symptom = document.getElementById('symptom').value.trim();
        const res = await request('/api/triage', {
          method: 'POST',
          body: JSON.stringify({ symptom })
        });
        triageResult.innerHTML = `推荐科室：<strong>${res.data.department}</strong><br>分诊建议：${res.data.advice}`;
        triageResult.classList.remove('hidden');
      } catch (error) {
        showMessage(triageResult, error.message, 'error');
      }
    });
  }

  if (deptList) {
    loadDepartments();
  }
});

async function loadDepartments() {
  const deptList = document.getElementById('deptList');
  try {
    const res = await request('/api/departments');
    deptList.innerHTML = res.data.map((item) => `
      <div class="card">
        <h3>${item.name}</h3>
        <p class="muted">${item.introduction}</p>
        <div class="badge">位置：${item.floorNo}</div>
      </div>
    `).join('');
  } catch (error) {
    deptList.innerHTML = `<div class="notice error">${error.message}</div>`;
  }
}
