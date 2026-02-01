#!/usr/bin/env bash
set -euo pipefail

SMB_PORT="${SMB_PORT:-445}"
SMB_SHARE_NAME="${SMB_SHARE_NAME:-offload}"
APP_UID="${APP_UID:-101}"
APP_GID="${APP_GID:-103}"

export HOME="/home/container"

mkdir -p /home/container/data/samba /home/container/logs /home/container/offload_mount /home/container/runtime /home/container/.npm
chown -R "${APP_UID}:${APP_GID}" /home/container
chmod +x /home/container/tools/smb_user.sh || true

CONF_PATH="/home/container/runtime/smb.conf"
cat > "$CONF_PATH" <<EOF
[global]
  workgroup = WORKGROUP
  server string = Offload Disk
  server role = standalone server
  map to guest = never
  smb ports = ${SMB_PORT}
  min protocol = SMB2
  max protocol = SMB3
  log level = 1
  log file = /home/container/logs/samba.log
  max log size = 1000
  load printers = no
  disable spoolss = yes
  printing = bsd
  printcap name = /dev/null
  passdb backend = tdbsam
  obey pam restrictions = no
  unix password sync = no
  state directory = /home/container/data/samba
  cache directory = /home/container/data/samba
  lock directory = /home/container/data/samba
  private dir = /home/container/data/samba
  pid directory = /home/container/data/samba

[${SMB_SHARE_NAME}]
  path = /home/container/offload_mount/%U
  browseable = yes
  read only = no
  guest ok = no
  valid users = %U
  create mask = 0664
  directory mask = 0775
EOF

if command -v smbd >/dev/null 2>&1; then
  /usr/sbin/smbd -F --no-process-group -s "$CONF_PATH" &
else
  echo "smbd not found in PATH"
fi

# TODO: start FUSE layer here once implemented.

if command -v gosu >/dev/null 2>&1; then
  exec gosu "${APP_UID}:${APP_GID}" bash -lc "npm_config_cache=/home/container/.npm npm install && npm run dev"
else
  exec bash -lc "npm_config_cache=/home/container/.npm npm install && npm run dev"
fi
