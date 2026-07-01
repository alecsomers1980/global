$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$out = Join-Path $root "release\app"

Write-Host "Preparing release directory..." -ForegroundColor Cyan
$releaseDir = Join-Path $root "release"
if (Test-Path $releaseDir) {
    Remove-Item -Recurse -Force $releaseDir
}
New-Item -ItemType Directory -Force -Path $out | Out-Null
Write-Host "Release directory ready." -ForegroundColor Green

# Copy source folders with robocopy
Write-Host "Copying src..." -ForegroundColor Cyan
$srcSrc = Join-Path $root "src"
$srcDest = Join-Path $out "src"
robocopy $srcSrc $srcDest /E /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) {
    throw "robocopy for src failed with exit code $LASTEXITCODE"
}
Write-Host "src copied." -ForegroundColor Green

Write-Host "Copying node_modules..." -ForegroundColor Cyan
$modSrc = Join-Path $root "node_modules"
$modDest = Join-Path $out "node_modules"
robocopy $modSrc $modDest /E /NFL /NDL /NJH /NJS /NP
if ($LASTEXITCODE -ge 8) {
    throw "robocopy for node_modules failed with exit code $LASTEXITCODE"
}
Write-Host "node_modules copied." -ForegroundColor Green

# Copy individual files
$files = @(
    "package.json",
    "tsconfig.json",
    "Start-Agent.ps1",
    "Start-Agent.bat",
    "CLIENT-SETUP.md",
    ".env.example"
)
Write-Host "Copying individual files..." -ForegroundColor Cyan
foreach ($file in $files) {
    $srcPath = Join-Path $root $file
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $out -Force
        Write-Host "Copied $file" -ForegroundColor Green
    } else {
        Write-Warning "$file not found, skipping."
    }
}
# Copy .env if it exists
$envFile = Join-Path $root ".env"
if (Test-Path $envFile) {
    Copy-Item $envFile $out -Force
    Write-Host "Copied .env" -ForegroundColor Green
} else {
    Write-Warning ".env not found, skipping."
}

# Copy Node runtime
Write-Host "Copying Node runtime..." -ForegroundColor Cyan
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeSrc = $nodeCmd.Source
    Copy-Item $nodeSrc (Join-Path $out "node.exe") -Force
    Write-Host "Node.exe copied." -ForegroundColor Green
} else {
    Write-Warning "Node.js not found on this machine. Package will not include node.exe."
}

# Calculate size
$sizeBytes = (Get-ChildItem -Path $out -Recurse -File | Measure-Object -Property Length -Sum).Sum
$sizeMB = [math]::Round($sizeBytes / 1MB, 2)
Write-Host "Total package size: $sizeMB MB" -ForegroundColor Green
Write-Host "Release assembled at $out" -ForegroundColor Green
