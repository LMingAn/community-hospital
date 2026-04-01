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

function weekdayLabel(weekday) {
  return ['','周一','周二','周三','周四','周五','周六','周日'][Number(weekday)] || '-';
}

function badgeClass(status) {
  if (['已完成','启用','正常','推荐','待入院'].includes(status)) return 'success';
  if (['已叫号','就诊中','较忙'].includes(status)) return 'warning';
  if (['已取消','停用','停诊','高峰'].includes(status)) return 'danger';
  return 'primary';
}

function setHtml(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}
