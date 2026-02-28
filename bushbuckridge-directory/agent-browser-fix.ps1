# agent-browser-fix.ps1
# Helper script to run agent-browser on Windows (Workaround for Daemon Socket Error)

$ChromePath = "C:\Users\foota\AppData\Local\ms-playwright\chromium-1208\chrome-win64\chrome.exe"
$Port = 9222

# 1. Check if Chrome is already running on the port
$PortActive = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

if (-not $PortActive) {
    Write-Host "Starting Chromium with Remote Debugging on port $Port..." -ForegroundColor Cyan
    Start-Process -FilePath $ChromePath -ArgumentList "--remote-debugging-port=$Port", "--headless", "--disable-gpu" -PassThru
    Start-Sleep -Seconds 3
}
else {
    Write-Host "Chromium is already running on port $Port." -ForegroundColor Green
}

Write-Host "`nTo use agent-browser on Windows, prepend your commands with --cdp $Port:" -ForegroundColor Yellow
Write-Host "Example: agent-browser --cdp $Port open https://google.com" -ForegroundColor Gray
Write-Host "Example: agent-browser --cdp $Port snapshot" -ForegroundColor Gray
