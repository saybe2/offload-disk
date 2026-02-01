#!/usr/bin/env bash
set -euo pipefail

echo "=== basic ==="
date
uname -a || true
id || true
whoami || true
pwd || true

echo "=== os ==="
cat /etc/os-release 2>/dev/null || true

echo "=== fuse ==="
grep -i fuse /proc/filesystems || echo "fuse not listed in /proc/filesystems"
ls -l /dev/fuse 2>/dev/null || echo "/dev/fuse not found"
if command -v fusermount3 >/dev/null 2>&1; then
  fusermount3 --version || true
elif command -v fusermount >/dev/null 2>&1; then
  fusermount --version || true
else
  echo "fusermount not found"
fi

echo "=== capabilities ==="
if command -v capsh >/dev/null 2>&1; then
  capsh --print | sed -n '1,10p'
else
  echo "capsh not found"
fi
grep -E "CapEff|CapPrm|CapBnd" /proc/self/status || true

echo "=== samba ==="
if command -v smbd >/dev/null 2>&1; then
  smbd --version || true
else
  echo "smbd not found"
fi

echo "=== package manager ==="
if command -v apt-get >/dev/null 2>&1; then
  echo "apt-get available"
elif command -v apk >/dev/null 2>&1; then
  echo "apk available"
elif command -v yum >/dev/null 2>&1; then
  echo "yum available"
elif command -v dnf >/dev/null 2>&1; then
  echo "dnf available"
else
  echo "no known package manager found"
fi

echo "=== write access ==="
if [ -w /dev/fuse ]; then
  echo "/dev/fuse is writable"
else
  echo "/dev/fuse is not writable"
fi
