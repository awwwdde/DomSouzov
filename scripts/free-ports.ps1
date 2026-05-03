$ErrorActionPreference = "SilentlyContinue"

$ports = @(8001, 5173)

foreach ($port in $ports) {
  $pids = @()
  $lines = netstat -ano | Select-String -Pattern ":$port"
  foreach ($line in $lines) {
    $text = $line.ToString().Trim()
    if ($text -match "LISTENING") {
      $parts = $text -split "\s+"
      $pidCandidate = $parts[-1]
      if ($pidCandidate -match "^\d+$") {
        $pids += [int]$pidCandidate
      }
    }
  }
  $pids = $pids | Sort-Object -Unique

  foreach ($procId in $pids) {
    if ($procId -gt 0 -and $procId -ne $PID) {
      Write-Host "Freeing port $port (PID $procId)..."
      taskkill /PID $procId /F | Out-Null
    }
  }
}

Write-Host "Ports check completed."
