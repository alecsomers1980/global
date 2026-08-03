# One-off repair for the ClaudeLearningDigest scheduled task. MUST run elevated:
# the task is owned by BUILTIN\Administrators, so the normal user can only read it.
# Sets: daily 08:30, catch up after a missed/powered-off run, kill a stale instance
# instead of refusing to start (the bug that made it never run), 1h cap.
# Uses the COM API rather than XML editing - the exported XML omits optional elements
# like StartWhenAvailable, and hand-inserting them can violate the schema's element order.
$ErrorActionPreference = "Stop"
$name = "ClaudeLearningDigest"

$svc = New-Object -ComObject Schedule.Service
$svc.Connect()
$folder = $svc.GetFolder("\")
$def = $folder.GetTask($name).Definition

$def.Settings.StartWhenAvailable = $true
$def.Settings.MultipleInstances  = 3          # 3 = TASK_INSTANCES_STOP_EXISTING
$def.Settings.ExecutionTimeLimit = "PT1H"
$def.Settings.DisallowStartIfOnBatteries = $false
$def.Settings.StopIfGoingOnBatteries     = $false

$daily = $def.Triggers | Where-Object { $_.Type -eq 2 }   # 2 = TASK_TRIGGER_DAILY
if (-not $daily) { throw "No daily trigger found on $name" }
$daily.StartBoundary = "2026-07-21T08:30:00"

# 6 = TASK_CREATE_OR_UPDATE, 3 = TASK_LOGON_INTERACTIVE_TOKEN
$folder.RegisterTaskDefinition($name, $def, 6, $null, $null, 3) | Out-Null

$t = Get-ScheduledTask -TaskName $name
$i = Get-ScheduledTaskInfo -TaskName $name
"NextRun            : $($i.NextRunTime)"
"StartWhenAvailable : $($t.Settings.StartWhenAvailable)"
"MultipleInstances  : $($t.Settings.MultipleInstances)"
"ExecutionTimeLimit : $($t.Settings.ExecutionTimeLimit)"
Read-Host "`nDone. Press Enter to close"
