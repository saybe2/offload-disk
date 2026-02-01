const userList = document.getElementById('userList');
const webhookList = document.getElementById('webhookList');
const createUserForm = document.getElementById('createUserForm');
const createUserStatus = document.getElementById('createUserStatus');
const addWebhookForm = document.getElementById('addWebhookForm');

async function loadUsers() {
  const res = await fetch('/api/admin/users');
  const data = await res.json();
  userList.innerHTML = '';
  for (const u of data.users) {
    const usedGb = (u.usedBytes / (1024 * 1024 * 1024)).toFixed(2);
    const quotaGb = u.quotaBytes > 0 ? (u.quotaBytes / (1024 * 1024 * 1024)).toFixed(2) : 'unlimited';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>${usedGb}</td>
      <td>${quotaGb}</td>
      <td>
        <input type="number" min="0" value="${u.quotaBytes > 0 ? (u.quotaBytes / (1024 * 1024 * 1024)).toFixed(2) : 0}" data-user="${u._id}" />
        <button data-user="${u._id}">Set</button>
      </td>
    `;
    userList.appendChild(tr);
  }

  userList.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-user');
      const input = userList.querySelector(`input[data-user="${id}"]`);
      const quotaGb = Number(input.value);
      await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotaBytes: Math.floor(quotaGb * 1024 * 1024 * 1024) })
      });
      await loadUsers();
    });
  });
}

async function loadWebhooks() {
  const res = await fetch('/api/admin/webhooks');
  const data = await res.json();
  webhookList.innerHTML = '';
  for (const w of data.webhooks) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${w.url}</td>
      <td>${w.enabled}</td>
      <td><button data-id="${w._id}">${w.enabled ? 'Disable' : 'Enable'}</button></td>
    `;
    webhookList.appendChild(tr);
  }

  webhookList.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const current = btn.textContent === 'Disable';
      await fetch(`/api/admin/webhooks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !current })
      });
      await loadWebhooks();
    });
  });
}

createUserForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  createUserStatus.textContent = '';
  const data = new FormData(createUserForm);
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: data.get('username'),
      password: data.get('password'),
      role: data.get('role'),
      quotaBytes: Math.floor(Number(data.get('quotaGb')) * 1024 * 1024 * 1024)
    })
  });
  if (!res.ok) {
    createUserStatus.textContent = 'Error creating user';
    return;
  }
  createUserStatus.textContent = 'User created';
  createUserForm.reset();
  await loadUsers();
});

addWebhookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(addWebhookForm);
  await fetch('/api/admin/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: data.get('url') })
  });
  addWebhookForm.reset();
  await loadWebhooks();
});

(async () => {
  await loadUsers();
  await loadWebhooks();
})();
