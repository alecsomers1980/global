# Daily: run the /learning-digest slash command headlessly.
# Scheduled via Task Scheduler task "ClaudeLearningDigest" (daily 08:00).
# (Filename kept as weekly-*.ps1 so the existing task action path stays valid.)
# The digest is written into the Obsidian vault (logs/YYYY-MM-DD-learning-digest.md).
# On days with no new playlist videos it does nothing but log "no new videos".
$env:PYTHONUTF8 = "1"
Set-Location "C:\Users\info\OneDrive\Documents\Antigravity"
$log = "$env:TEMP\weekly-learning-digest.log"
"[$(Get-Date -Format s)] starting learning digest" | Out-File -FilePath $log -Encoding utf8
claude -p "/learning-digest" --allowedTools "Bash,Read,Write,Edit,Glob,Grep,WebSearch,WebFetch" 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
"[$(Get-Date -Format s)] done" | Out-File -FilePath $log -Append -Encoding utf8
& "$PSScriptRoot\send-digest-email.ps1" -Subject "Learning digest - $(Get-Date -Format 'yyyy-MM-dd')" -BodyFile $log
