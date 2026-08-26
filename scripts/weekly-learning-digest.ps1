# Launcher for the daily /learning-digest run (Task Scheduler: ClaudeLearningDigest, 08:30).
# Recreated 2026-08-26 after the original was lost with the rest of scripts\ on 2026-08-20.
# Keep this file in git - it is harness, not scratch.

$repo = 'C:\Users\info\OneDrive\Documents\Antigravity'
$claude = Join-Path $env:APPDATA 'npm\claude.cmd'
$logDir = Join-Path $repo 'scripts\logs'

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$log = Join-Path $logDir ('learning-digest-{0}.log' -f (Get-Date -Format 'yyyy-MM-dd'))

Set-Location $repo
"=== /learning-digest started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Tee-Object -FilePath $log -Append

& $claude -p '/learning-digest' --dangerously-skip-permissions | Tee-Object -FilePath $log -Append
$code = $LASTEXITCODE

"=== finished $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') exit=$code ===" | Tee-Object -FilePath $log -Append
exit $code
