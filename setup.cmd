@echo off
chcp 65001 > nul
title Adobe After Effects MCP - One-Click Setup and Connect

echo =================================================================
echo   ADOBE AFTER EFFECTS MCP - THIET LAP VA KET NOI TU DONG
echo =================================================================
echo.

:: 1. Kiem tra Node.js co tren may khong
where node >nul 2>nul
if %errorlevel% neq 0 goto :NO_NODE

:: 2. Kiem tra phien ban Node.js (yeu cau >= 18.0.0)
node -e "if (parseInt(process.version.slice(1).split('.')[0], 10) < 18) process.exit(1);" >nul 2>nul
if %errorlevel% neq 0 goto :OLD_NODE

:: 3. Kiem tra va cai dat dependencies neu chua co
if exist "node_modules\" goto :SKIP_INSTALL
echo [1/3] Thu muc node_modules chua ton tai. Dang chay npm install...
call npm install
if %errorlevel% neq 0 goto :INSTALL_FAIL
echo.

:SKIP_INSTALL

:: 4. Kiem tra va bien dich ma nguon
if exist "build\index.js" goto :SKIP_BUILD
echo [2/3] Dang bien dich ma nguon (npm run build)...
call npm run build
if %errorlevel% neq 0 goto :BUILD_FAIL
echo.

:SKIP_BUILD

:: 5. Chay kiem tra chi tiet he thong, bridge va cau hinh Client
echo [3/3] Dang kiem tra ket noi After Effects va thiet lap Client...
echo.
node scripts\setup-check.js

echo.
echo Nhan phim bat ky de thoat...
pause > nul
exit /b 0

:NO_NODE
echo =================================================================
echo   [LOI] KHONG TIM THAY NODE.JS TREN MAY TINH!
echo =================================================================
echo.
echo He thong khong tim thay Node.js. MCP Server bat buoc can Node.js.
echo.
echo - BUOC 1: Tai va cai dat Node.js (khuyen dung ban LTS 20+) tai:
echo           https://nodejs.org/
echo.
echo - BUOC 2: Sau khi cai dat xong, hay chay lai file setup.cmd nay!
echo =================================================================
echo.
pause
exit /b 1

:OLD_NODE
echo =================================================================
echo   [LOI] PHIEN BAN NODE.JS QUA CU!
echo =================================================================
echo.
echo Phien ban Node.js hien tai khong dat yeu cau (yeu cau >= 18.0.0).
echo.
echo - BUOC 1: Tai va cap nhat Node.js moi nhat tai:
echo           https://nodejs.org/
echo.
echo - BUOC 2: Sau khi cap nhat xong, hay chay lai file setup.cmd nay!
echo =================================================================
echo.
pause
exit /b 1

:INSTALL_FAIL
echo.
echo =================================================================
echo   [LOI] npm install that bai!
echo =================================================================
echo Vui long kiem tra ket noi Internet va chay lai setup.cmd.
echo =================================================================
echo.
pause
exit /b 1

:BUILD_FAIL
echo.
echo =================================================================
echo   [LOI] npm run build that bai!
echo =================================================================
echo Vui long kiem tra ma nguon hoac chay lai setup.cmd.
echo =================================================================
echo.
pause
exit /b 1
