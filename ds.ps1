$running = Get-NetTCPConnection -LocalPort 8082 -State Listen -ErrorAction SilentlyContinue
if (-not $running) {
    Write-Host "Starting free-claude-code proxy on :8082..." -ForegroundColor Cyan
    $proxyDir = "C:\Users\info\OneDrive\Documents\Antigravity\free-claude-code"
    Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$proxyDir'; uv run uvicorn server:app --host 0.0.0.0 --port 8082" -WindowStyle Minimized
    $deadline = (Get-Date).AddSeconds(30)
    while ((Get-Date) -lt $deadline) {
        if (Get-NetTCPConnection -LocalPort 8082 -State Listen -ErrorAction SilentlyContinue) { break }
        Start-Sleep -Milliseconds 500
    }
    if (-not (Get-NetTCPConnection -LocalPort 8082 -State Listen -ErrorAction SilentlyContinue)) {
        Write-Host "Proxy did not start within 30s. Check the proxy window for errors." -ForegroundColor Yellow
        return
    }
    Write-Host "Proxy ready." -ForegroundColor Green
}
$env:ANTHROPIC_AUTH_TOKEN = "freecc"
$env:ANTHROPIC_BASE_URL = "http://localhost:8082"
$env:CLAUDE_CODE_IDE_SKIP_AUTO_INSTALL = "1"
claude $args
