$port = 3000
$conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conns) {
  $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($procId in $pids) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
  }
  Write-Output "stopped"
} else {
  Write-Output "not_listening"
}
