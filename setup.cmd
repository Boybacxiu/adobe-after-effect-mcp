@echo off
chcp 65001 > nul
title Adobe After Effects MCP - Setup and Connect

:: 1. Kiem tra Node.js co tren may khong
where node >nul 2>nul
if %errorlevel% neq 0 goto :NO_NODE

:: 2. Kiem tra phien ban Node.js (yeu cau >= 18.0.0)
node -e "if (parseInt(process.version.slice(1).split('.')[0], 10) < 18) process.exit(1);" >nul 2>nul
if %errorlevel% neq 0 goto :OLD_NODE

:: 3. Kiem tra va cai dat dependencies neu chua co
if exist "node_modules\" goto :SKIP_INSTALL
echo [1/3] Installing dependencies / Dang cai dat dependencies...
call npm install
if %errorlevel% neq 0 goto :INSTALL_FAIL
echo.

:SKIP_INSTALL

:: 4. Kiem tra va bien dich ma nguon
if exist "build\index.js" goto :SKIP_BUILD
echo [2/3] Compiling TypeScript / Dang bien dich ma nguon...
call npm run build
if %errorlevel% neq 0 goto :BUILD_FAIL
echo.

:SKIP_BUILD

:: 5. Chay kiem tra chi tiet he thong, bridge va cau hinh Client
echo [3/3] Running system diagnostics / Dang kiem tra ket noi...
echo.
node scripts\setup-check.js %*

echo.
node -e "const isVi = Intl.DateTimeFormat().resolvedOptions().locale.startsWith('vi'); process.stdout.write(isVi ? 'Nhan phim bat ky de thoat...' : 'Press any key to exit...');"
pause > nul
exit /b 0

:NO_NODE
echo =================================================================
echo   [ERROR / LOI] NODE.JS IS NOT FOUND / KHONG TIM THAY NODE.JS!
echo =================================================================
echo - Please download and install Node.js (LTS 20+) from:
echo   https://nodejs.org/
echo - Vui long tai va cai dat Node.js (khuyen dung ban LTS 20+) tai:
echo   https://nodejs.org/
echo =================================================================
echo.
pause
exit /b 1

:OLD_NODE
echo =================================================================
echo   [ERROR / LOI] NODE.JS VERSION TOO OLD / PHIEN BAN NODE.JS QUA CU!
echo =================================================================
echo - Node.js version >= 18.0.0 is required. Please update at:
echo   https://nodejs.org/
echo - Phien ban Node.js hien tai khong dat yeu cau (>= 18.0.0). Cap nhat tai:
echo   https://nodejs.org/
echo =================================================================
echo.
pause
exit /b 1

:INSTALL_FAIL
echo.
echo =================================================================
echo   [ERROR / LOI] npm install failed / npm install that bai!
echo =================================================================
echo Please check your internet connection and re-run setup.cmd.
echo Vui long kiem tra ket noi Internet va chay lai setup.cmd.
echo =================================================================
echo.
pause
exit /b 1

:BUILD_FAIL
echo.
echo =================================================================
echo   [ERROR / LOI] npm run build failed / npm run build that bai!
echo =================================================================
echo Please inspect the source code or re-run setup.cmd.
echo Vui long kiem tra ma nguon hoac chay lai setup.cmd.
echo =================================================================
echo.
pause
exit /b 1
