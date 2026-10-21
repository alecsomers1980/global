# Nightly: export recent Claude Code conversations into the Obsidian vault.
# Scheduled via Task Scheduler task "ClaudeObsidianSync" (daily 22:00).
$env:PYTHONUTF8 = "1"
$extract = "$env:APPDATA\Python\Python314\Scripts\claude-extract.exe"
$dest = "C:\Users\info\OneDrive\Documents\Obsidian\Ember Automation\chats\code"
$log = "$env:TEMP\sync-claude-obsidian.log"
"[$(Get-Date -Format s)] starting sync" | Out-File -FilePath $log -Encoding utf8
& $extract --recent 15 --output $dest 2>&1 | Out-File -FilePath $log -Append -Encoding utf8
"[$(Get-Date -Format s)] done" | Out-File -FilePath $log -Append -Encoding utf8
