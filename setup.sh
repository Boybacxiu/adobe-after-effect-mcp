#!/usr/bin/env bash
# ==============================================================================
# Adobe After Effects MCP - 1-Click Setup & Connect (macOS / Linux)
# ==============================================================================

# Ensure script runs from the repository root directory
cd "$(dirname "$0")"

# 1. Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "================================================================="
  echo "  [ERROR / LỖI] NODE.JS IS NOT FOUND / KHÔNG TÌM THẤY NODE.JS!"
  echo "================================================================="
  echo "- Please download and install Node.js (LTS 20+) from: https://nodejs.org/"
  echo "- Vui lòng tải và cài đặt Node.js (khuyên dùng bản LTS 20+) tại: https://nodejs.org/"
  echo "================================================================="
  echo ""
  read -n 1 -s -r -p "Press any key to exit / Nhấn phím bất kỳ để thoát..."
  echo ""
  exit 1
fi

# 2. Check Node.js version (requires >= 18.0.0)
node -e "if (parseInt(process.version.slice(1).split('.')[0], 10) < 18) process.exit(1);" >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "================================================================="
  echo "  [ERROR / LỖI] NODE.JS VERSION TOO OLD / PHIÊN BẢN NODE.JS QUÁ CŨ!"
  echo "================================================================="
  echo "- Node.js version >= 18.0.0 is required. Please update at: https://nodejs.org/"
  echo "- Phiên bản Node.js hiện tại không đạt yêu cầu (>= 18.0.0). Cập nhật tại: https://nodejs.org/"
  echo "================================================================="
  echo ""
  read -n 1 -s -r -p "Press any key to exit / Nhấn phím bất kỳ để thoát..."
  echo ""
  exit 1
fi

# 3. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  echo "[1/3] Installing dependencies / Đang cài đặt dependencies..."
  npm install
  if [ $? -ne 0 ]; then
    echo "================================================================="
    echo "  [ERROR / LỖI] npm install failed / npm install thất bại!"
    echo "================================================================="
    echo "Please check your internet connection and re-run setup.sh."
    echo "Vui lòng kiểm tra kết nối Internet và chạy lại setup.sh."
    echo "================================================================="
    echo ""
    read -n 1 -s -r -p "Press any key to exit / Nhấn phím bất kỳ để thoát..."
    echo ""
    exit 1
  fi
  echo ""
fi

# 4. Compile TypeScript source code if build is missing
if [ ! -f "build/index.js" ]; then
  echo "[2/3] Compiling TypeScript / Đang biên dịch mã nguồn..."
  npm run build
  if [ $? -ne 0 ]; then
    echo "================================================================="
    echo "  [ERROR / LỖI] npm run build failed / npm run build thất bại!"
    echo "================================================================="
    echo "Please inspect the source code or re-run setup.sh."
    echo "Vui lòng kiểm tra mã nguồn hoặc chạy lại setup.sh."
    echo "================================================================="
    echo ""
    read -n 1 -s -r -p "Press any key to exit / Nhấn phím bất kỳ để thoát..."
    echo ""
    exit 1
  fi
  echo ""
fi

# 5. Run system diagnostics, bridge installer, and MCP Client configurations
echo "[3/3] Running system diagnostics / Đang kiểm tra kết nối..."
echo ""
node scripts/setup-check.js "$@"

echo ""
node -e "import('./scripts/lang-detect.js').then(m => process.stdout.write(m.detectSystemLanguage() === 'vi' ? 'Nhấn phím bất kỳ để thoát...' : 'Press any key to exit...'))"
read -n 1 -s -r
echo ""
exit 0
