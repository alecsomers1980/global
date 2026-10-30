# Launcher for the weekly client contact-form check (Task Scheduler: ClientFormCheck, MON 07:30).
# Silent unless broken: the log is emailed to Alec only when check-client-forms.mjs finds a problem.
# Needs the Vercel CLI logged in on this machine (it reads env names through `vercel api`).
# Keep this file in git - it is harness, not scratch.

$repo = 'C:\Users\info\OneDrive\Documents\Antigravity'
$logDir = Join-Path $repo 'scripts\logs'
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$today = Get-Date -Format 'yyyy-MM-dd'
$log = Join-Path $logDir ('client-form-check-{0}.log' -f $today)

Set-Location $repo
& node (Join-Path $repo 'scripts\check-client-forms.mjs') | Tee-Object -FilePath $log
$code = $LASTEXITCODE

if ($code -ne 0) {
    & (Join-Path $repo 'scripts\send-digest-email.ps1') -Subject ('Client form check {0}: problems found' -f $today) -LogPath $log
}
exit $code
