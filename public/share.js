const shareTitle = document.getElementById('shareTitle');
const shareMeta = document.getElementById('shareMeta');
const shareActions = document.getElementById('shareActions');
const shareHead = document.getElementById('shareHead');
const shareList = document.getElementById('shareList');

function formatDate(iso) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleString();
}

function formatSize(bytes) {
  if (bytes === null || bytes === undefined) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 || unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function renderHead() {
  shareHead.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Size</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  `;
}

function addRow(name, size, date, downloadUrl, status) {
  const tr = document.createElement('tr');
  const nameTd = document.createElement('td');
  nameTd.textContent = name;
  const sizeTd = document.createElement('td');
  sizeTd.textContent = formatSize(size);
  const dateTd = document.createElement('td');
  dateTd.textContent = date ? new Date(date).toLocaleString() : '';
  const actionTd = document.createElement('td');
  if (downloadUrl) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.textContent = 'Download';
    actionTd.appendChild(link);
  } else if (status) {
    actionTd.textContent = status;
  }
  tr.appendChild(nameTd);
  tr.appendChild(sizeTd);
  tr.appendChild(dateTd);
  tr.appendChild(actionTd);
  shareList.appendChild(tr);
}

async function loadShare() {
  const parts = location.pathname.split('/');
  const token = parts[parts.length - 1] || parts[parts.length - 2];
  const res = await fetch(`/api/public/shares/${token}`);
  if (!res.ok) {
    shareTitle.textContent = 'Link expired or not found';
    return;
  }
  const data = await res.json();
  renderHead();
  shareTitle.textContent = data.name || 'Shared link';
  shareMeta.textContent = `Expires: ${formatDate(data.expiresAt)}`;
  shareList.innerHTML = '';

  if (data.type === 'archive') {
    const downloadUrl = `/api/public/shares/${token}/download`;
    const button = document.createElement('a');
    button.href = downloadUrl;
    button.textContent = 'Download full';
    shareActions.appendChild(button);

    const archive = data.archive;
    if (archive?.isBundle && archive.files?.length) {
      archive.files.forEach((file, index) => {
        const fileUrl = archive.status === 'ready'
          ? `/api/public/shares/${token}/download?fileIndex=${index}`
          : null;
        addRow(file.originalName || file.name, file.size, archive.createdAt, fileUrl, archive.status);
      });
    } else if (archive) {
      const link = archive.status === 'ready' ? downloadUrl : null;
      addRow(archive.name || data.name, archive.originalSize, archive.createdAt, link, archive.status);
    }
    return;
  }

  if (data.type === 'folder') {
    const archives = data.archives || [];
    for (const archive of archives) {
      if (archive.isBundle && archive.files?.length) {
        archive.files.forEach((file, index) => {
          const url = archive.status === 'ready'
            ? `/api/public/shares/${token}/archive/${archive.id}/download?fileIndex=${index}`
            : null;
          addRow(file.originalName || file.name, file.size, archive.createdAt, url, archive.status);
        });
      } else {
        const url = archive.status === 'ready'
          ? `/api/public/shares/${token}/archive/${archive.id}/download`
          : null;
        addRow(archive.name, archive.originalSize, archive.createdAt, url, archive.status);
      }
    }
  }
}

loadShare();
