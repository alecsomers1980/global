@echo off
REM Double-click this to stitch every project that has clips waiting for a reel.
cd /d "%~dp0"
echo ============================================
echo   Aloe Signs - rendering pending reels
echo ============================================
echo.
node render-project.mjs %*
echo.
echo Done. You can close this window.
pause
