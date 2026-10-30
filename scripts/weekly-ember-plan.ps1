# Launcher for the Monday /ember-weekly-plan run (Task Scheduler: EmberWeeklyPlan, MON 08:30).
# Claude writes scripts\logs\ember-weekly-plan-<monday>.json, this posts it to Ember OS (/admin/weekly)
# and emails the run log (the readable list) to Alec.
# Keep this file in git - it is harness, not scratch.

$repo = 'C:\Users\info\OneDrive\Documents\Antigravity'
$claude = Join-Path $env:APPDATA 'npm\claude.cmd'
$logDir = Join-Path $repo 'scripts\logs'

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$today = Get-Date -Format 'yyyy-MM-dd'
$log = Join-Path $logDir ('ember-weekly-plan-{0}.log' -f $today)
# The week starts on Monday; a manual rerun later in the week still files under that Monday.
$monday = (Get-Date).AddDays(-(((Get-Date).DayOfWeek.value__ + 6) % 7)).ToString('yyyy-MM-dd')
$json = Join-Path $logDir ('ember-weekly-plan-{0}.json' -f $monday)

Set-Location $repo
"=== /ember-weekly-plan started $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Tee-Object -FilePath $log -Append

& $claude -p "/ember-weekly-plan $monday" --dangerously-skip-permissions | Tee-Object -FilePath $log -Append
$code = $LASTEXITCODE

& node (Join-Path $repo 'scripts\post-weekly-plan.mjs') $json | Tee-Object -FilePath $log -Append
$posted = $LASTEXITCODE
if ($code -eq 0) { $code = $posted }

"=== finished $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') exit=$code ===" | Tee-Object -FilePath $log -Append
# The send result is appended after the email has gone, so the log shows whether it went out.
& (Join-Path $repo 'scripts\send-digest-email.ps1') -Subject ('Ember weekly plan {0} (exit {1})' -f $monday, $code) -LogPath $log 2>&1 | Tee-Object -FilePath $log -Append
exit $code
