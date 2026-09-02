# Emails a digest run result. Called by the digest scripts after they finish.
# Reads RESEND_API_KEY from ember-automations/.env.local so the secret lives in one place.
param(
    [Parameter(Mandatory = $true)][string]$Subject,
    [Parameter(Mandatory = $true)][string]$BodyFile
)

$envFile = "C:\Users\info\OneDrive\Documents\Antigravity\ember-automations\.env.local"
$key = (Select-String -Path $envFile -Pattern '^RESEND_API_KEY=(.+)$').Matches.Groups[1].Value.Trim()
if (-not $key) { Write-Error "RESEND_API_KEY not found in $envFile"; exit 1 }

# [string] cast matters: Get-Content -Raw returns a PSObject-wrapped string whose
# PSPath/PSDrive notes would otherwise get serialized into the JSON body.
$body = if (Test-Path $BodyFile) { [string](Get-Content $BodyFile -Raw -Encoding utf8) } else { "(no log output)" }
if (-not $body.Trim()) { $body = "(no log output)" }

$payload = @{
    from    = "Ember Digests <intake@emb3r.co.za>"
    to      = @("alec@emb3r.co.za")
    subject = $Subject
    text    = $body
} | ConvertTo-Json -Depth 4

$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
try {
    Invoke-RestMethod -Uri "https://api.resend.com/emails" -Method Post -Body $bytes `
        -ContentType "application/json; charset=utf-8" `
        -Headers @{ Authorization = "Bearer $key" } -ErrorAction Stop | Out-Null
    "sent"
}
catch {
    Write-Error "Resend send failed: $($_.Exception.Message)"
    exit 1
}
