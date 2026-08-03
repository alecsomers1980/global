# Weekly: run the /passive-income-digest slash command headlessly.
# Scheduled via Task Scheduler task "PassiveIncomeDigest" (weekly, Mon 08:15).
# Digest is written into the Obsidian vault (logs/YYYY-MM-DD-passive-income-digest.md).
# On weeks with no new playlist videos it does nothing but log "no new videos".
$env:PYTHONUTF8 = "1"
Set-Location "C:\Users\info\OneDrive\Documents\Antigravity"
$log = "$env:TEMP\weekly-passive-income-digest.log"
"[$(Get-Date -Format s)] starting passive-income digest" | Out-File -FilePath $log -Encoding utf8
claude -p "/passive-income-digest" --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch" 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
"[$(Get-Date -Format s)] done" | Out-File -FilePath $log -Append -Encoding utf8
& "$PSScriptRoot\send-digest-email.ps1" -Subject "Passive income digest - $(Get-Date -Format 'yyyy-MM-dd')" -BodyFile $log
