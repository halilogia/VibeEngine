@echo off
echo ===================================
echo VibeEngine - Build Portable EXE
echo ===================================
echo.

cd /d "%~dp0"
echo Building TypeScript...
call npm run build

echo.
echo Creating Portable EXE...
call npx electron-builder --win portable

echo.
echo ===================================
echo DONE! Check release folder
echo ===================================
pause
