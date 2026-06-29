# Launches Chrome with remote-debugging enabled, using a dedicated profile.
# Step 1 of the attended workflow: the HUMAN runs this, logs into the portal,
# and passes any Cloudflare challenge. Then run `npm run attended`.
#
# A dedicated profile (.chrome-profile) keeps this separate from your everyday
# Chrome and lets the login + Cloudflare cookies persist between sessions.

$ErrorActionPreference = "Stop"
$profileDir = Join-Path $PSScriptRoot ".chrome-profile"
$port = if ($env:CDP_PORT) { $env:CDP_PORT } else { "9222" }
$startUrl = if ($args.Count -ge 1) { $args[0] } else { "https://www.cars.co.za/dap/" }

$candidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)
$chrome = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) { Write-Error "Could not find chrome.exe. Edit the paths in launch-chrome.ps1."; exit 1 }

Write-Host "Launching Chrome (debug port $port, profile $profileDir)..."
Write-Host "1) Log in to the portal in the window that opens."
Write-Host "2) Solve any 'Just a moment...' Cloudflare check."
Write-Host "3) Then run:  npm run attended"
# --remote-allow-origins=* is required by Chrome 111+ for Playwright's
# connectOverCDP WebSocket handshake to succeed.
& $chrome "--remote-debugging-port=$port" "--remote-allow-origins=*" "--user-data-dir=$profileDir" $startUrl
