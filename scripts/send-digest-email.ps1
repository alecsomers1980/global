# Emails a digest run's log to Alec via Ember's Resend account.
# Recreated 2026-10-12 after the original was lost with the rest of scripts\ on 2026-08-20
# (the launchers were rebuilt on 08-26 without it, so no digest emails went out in between).
# The API key is read from ember-automations\.env.local at runtime - never copy it here.
# Keep this file in git - it is harness, not scratch.

param(
    [Parameter(Mandatory)] [string] $Subject,
    [Parameter(Mandatory)] [string] $LogPath
)

$envFile = 'C:\Users\info\OneDrive\Documents\Antigravity\ember-automations\.env.local'
$keyLine = Select-String -Path $envFile -Pattern '^RESEND_API_KEY=' | Select-Object -First 1
if (-not $keyLine) { Write-Error "RESEND_API_KEY not found in $envFile"; exit 1 }
$key = ($keyLine.Line -replace '^RESEND_API_KEY=', '').Trim().Trim('"')

# [IO.File] rather than Get-Content -Raw: the latter returns a PSObject that ConvertTo-Json
# serialises with PSPath etc. attached, which Resend rejects. Tee-Object writes UTF-16; the BOM is detected.
$body = [IO.File]::ReadAllText($LogPath)

$payload = @{
    from    = 'Ember Digests <intake@emb3r.co.za>'
    to      = @('alec@emb3r.co.za')
    subject = $Subject
    text    = $body
} | ConvertTo-Json -Depth 3

try {
    $res = Invoke-RestMethod -Method Post -Uri 'https://api.resend.com/emails' `
        -Headers @{ Authorization = "Bearer $key" } `
        -ContentType 'application/json; charset=utf-8' `
        -Body ([Text.Encoding]::UTF8.GetBytes($payload))
    "email sent: $($res.id)"
} catch {
    Write-Error "email failed: $($_.Exception.Message) $($_.ErrorDetails.Message)"
    exit 1
}
