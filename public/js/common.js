async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || '请求失败');
  return data;
}

function showNotice(id, message, type = 'info') {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `notice show ${type}`;
  el.textContent = message;
}

function clearNotice(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'notice';
  el.textContent = '';
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

async function getAdminStatus() {
  try {
    const res = await request('/api/admin/check');
    return res.data;
  } catch {
    return null;
  }
}

async function mountNavState() {
  const info = await getAdminStatus();
  const loginEntry = document.getElementById('loginEntry');
  const logoutEntry = document.getElementById('logoutEntry');
  const adminName = document.getElementById('adminName');
  if (info) {
    if (loginEntry) loginEntry.style.display = 'none';
    if (logoutEntry) logoutEntry.style.display = 'inline-block';
    if (adminName) adminName.textContent = `当前管理员：${info.nickname || info.username}`;
  } else {
    if (loginEntry) loginEntry.style.display = 'inline-block';
    if (logoutEntry) logoutEntry.style.display = 'none';
    if (adminName) adminName.textContent = '当前未登录';
  }
}

async function bindLogout() {
  const btn = document.getElementById('logoutEntry');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await request('/api/admin/logout', { method: 'POST' });
    alert('已退出管理员登录');
    window.location.href = '/index.html';
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await mountNavState();
  await bindLogout();
});
