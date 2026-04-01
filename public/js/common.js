async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: 'same-origin',
    ...options,
  });
  const data = await response.json();
  if (!response.ok || data.success === false) {
    throw new Error(data.message || '请求失败');
  }
  return data;
}

function showMessage(el, message, type = 'success') {
  el.className = `notice ${type}`;
  el.textContent = message;
  el.classList.remove('hidden');
}

function hideMessage(el) {
  el.classList.add('hidden');
}

function getQuery(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function refreshAdminUI() {
  const adminArea = document.getElementById('adminArea');
  const loginEntry = document.getElementById('loginEntry');
  const manageEntry = document.getElementById('manageEntry');
  const logoutBtn = document.getElementById('logoutBtn');
  if (!adminArea || !loginEntry || !manageEntry || !logoutBtn) return;

  try {
    const res = await request('/api/session');
    if (res.isAdminLoggedIn) {
      adminArea.classList.remove('hidden');
      loginEntry.classList.add('hidden');
      manageEntry.classList.remove('hidden');
    } else {
      adminArea.classList.add('hidden');
      loginEntry.classList.remove('hidden');
      manageEntry.classList.add('hidden');
    }
  } catch (error) {
    console.error(error.message);
  }

  logoutBtn.onclick = async () => {
    try {
      await request('/api/admin/logout', { method: 'POST' });
      window.location.href = '/index.html';
    } catch (error) {
      alert(error.message);
    }
  };
}

document.addEventListener('DOMContentLoaded', refreshAdminUI);
