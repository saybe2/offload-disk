const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const data = new FormData(form);
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: data.get('username'),
      password: data.get('password')
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    errorEl.textContent = 'Invalid credentials';
    return;
  }
  location.href = '/';
});
