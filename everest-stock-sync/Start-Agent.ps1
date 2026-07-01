$ErrorActionPreference = "Stop"

try {
    $root = $PSScriptRoot

    function Test-PortListening {
        param([int]$Port)
        $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
    }

    # --- Chrome (remote debugging) ---
    Write-Host "Checking Chrome remote debugging port (9222)..." -ForegroundColor Cyan
    if (-not (Test-PortListening 9222)) {
        $chromePaths = @(
            "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
            "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
            "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
        )
        $chromeExe = $null
        foreach ($path in $chromePaths) {
            if (Test-Path $path) {
                $chromeExe = $path
                break
            }
        }
        if ($chromeExe) {
            Write-Host "Launching Chrome with remote debugging..." -ForegroundColor Cyan
            $chromeArgs = @(
                "--remote-debugging-port=9222",
                "--remote-allow-origins=*",
                "--user-data-dir=$root\.chrome-profile",
                "https://www.cars.co.za/dap/",
                "https://connect.autotrader.co.za/"
            )
            Start-Process -FilePath $chromeExe -ArgumentList $chromeArgs
            Write-Host "Please log into BOTH portals and solve any 'Just a moment' checks in the Chrome window." -ForegroundColor Yellow
        }
        else {
            Write-Warning "Chrome executable not found at any expected location. Skipping Chrome launch."
        }
    }
    else {
        Write-Host "Chrome remote debugging port 9222 already in use — assuming Chrome is already running." -ForegroundColor Green
    }

    # --- Node bridge server ---
    Write-Host "Checking bridge port (8799)..." -ForegroundColor Cyan
    if (-not (Test-PortListening 8799)) {
        Write-Host "Starting Node bridge server..." -ForegroundColor Cyan
        Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$root'; npm run bridge" -WindowStyle Minimized

        $timeout = 20000   # milliseconds
        $elapsed = 0
        $bridgeUp = $false
        while ($elapsed -lt $timeout) {
            if (Test-PortListening 8799) {
                $bridgeUp = $true
                break
            }
            Start-Sleep -Milliseconds 500
            $elapsed += 500
        }
        if (-not $bridgeUp) {
            Write-Warning "Bridge did not start within 20 seconds — check the bridge window."
        }
        else {
            Write-Host "Bridge is ready." -ForegroundColor Green
        }
    }
    else {
        Write-Host "Bridge port 8799 already in use — bridge is already running." -ForegroundColor Green
    }

    # --- Dashboard ---
    if (Test-PortListening 8799) {
        Write-Host "Opening dashboard (http://localhost:8799)..." -ForegroundColor Cyan
        Start-Process "http://localhost:8799"
    }
    else {
        Write-Warning "Cannot open dashboard because bridge is not running."
    }

    # Final summary
    Write-Host ""
    Write-Host "All done! Here's what to do next:" -ForegroundColor Green
    Write-Host "1. In the Chrome window, log into both portals and complete any 'Just a moment' checks." -ForegroundColor Cyan
    Write-Host "2. In the dashboard that just opened (or is already open), click the buttons to start filling forms. The tool will stop before submitting." -ForegroundColor Cyan
}
catch {
    Write-Host "Script failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
