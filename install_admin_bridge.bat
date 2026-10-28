@echo off
copy /Y "%~dp0build\scripts\mcp-bridge-auto.jsx" "C:\Program Files\Adobe\Adobe After Effects 2025\Support Files\Scripts\Startup\mcp-bridge-auto.jsx"
if %errorlevel% equ 0 (
    echo [THANH CONG] Da copy mcp-bridge-auto.jsx vao Startup!
) else (
    echo [THAT BAI] Vui long chuot phai vao file nay va chon 'Run as administrator'! 
)
pause
