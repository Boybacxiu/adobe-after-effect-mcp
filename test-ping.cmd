@echo off
chcp 65001 > nul
title Adobe After Effects MCP - Quick Ping & Tools Dashboard

:: Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo =================================================================
  echo   [ERROR / LOI] NODE.JS IS NOT FOUND / KHONG TIM THAY NODE.JS!
  echo =================================================================
  echo - Please download and install Node.js (LTS 20+) from: https://nodejs.org/
  echo - Vui long tai va cai dat Node.js tai https://nodejs.org/
  echo =================================================================
  echo.
  pause
  exit /b 1
)

:: Kiem tra ban build neu chua co
if not exist "build\index.js" (
  call npm run build
  echo.
)

:: Chay script quick-ping (tu dong nhan dien Tieng Viet / English)
node scripts\quick-ping.js %*

echo.
node -e "import('./scripts/lang-detect.js').then(m => process.stdout.write(m.detectSystemLanguage() === 'vi' ? 'Nhan phim bat ky de thoat...' : 'Press any key to exit...'))"
pause > nul
exit /b 0
