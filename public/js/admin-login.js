document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('loginForm');
  const messageBox = document.getElementById('messageBox');
  const returnTo = getQuery('returnTo') || '/index.html';

  try {
    const res = await request('/api/session');
    if (res.isAdminLoggedIn) {
      window.location.href = returnTo;
      return;
    }
  } catch (error) {
    console.error(error.message);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(messageBox);
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      await request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      window.location.href = returnTo;
    } catch (error) {
      showMessage(messageBox, error.message, 'error');
    }
  });
});
