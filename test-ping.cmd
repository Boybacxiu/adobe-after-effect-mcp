@echo off
chcp 65001 > nul
title Adobe After Effects MCP - Quick Ping & Tools Dashboard

:: Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo =================================================================
  echo   [LOI] KHONG TIM THAY NODE.JS TREN MAY TINH!
  echo =================================================================
  echo Vui long cai dat Node.js tai https://nodejs.org/ truoc.
  echo.
  pause
  exit /b 1
)

:: Kiem tra ban build neu chua co
if not exist "build\index.js" (
  echo [!] Ban build chua ton tai. Dang chay npm run build...
  call npm run build
  echo.
)

:: Chay script quick-ping
node scripts\quick-ping.js

echo.
echo Nhan phim bat ky de thoat...
pause > nul
exit /b 0
