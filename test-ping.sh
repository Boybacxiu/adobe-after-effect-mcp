#!/usr/bin/env bash
# ==============================================================================
# Adobe After Effects MCP - Quick Ping & Tools Dashboard (macOS / Linux)
# ==============================================================================

# Ensure script runs from the repository root directory
cd "$(dirname "$0")"

# 1. Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "================================================================="
  echo "  [ERROR / LỖI] NODE.JS IS NOT FOUND / KHÔNG TÌM THẤY NODE.JS!"
  echo "================================================================="
  echo "- Please download and install Node.js (LTS 20+) from: https://nodejs.org/"
  echo "- Vui lòng tải và cài đặt Node.js tại https://nodejs.org/"
  echo "================================================================="
  echo ""
  read -n 1 -s -r -p "Press any key to exit / Nhấn phím bất kỳ để thoát..."
  echo ""
  exit 1
fi

# 2. Compile source code if build does not exist
if [ ! -f "build/index.js" ]; then
  npm run build
  echo ""
fi

# 3. Run quick-ping (automatically detects Vietnamese / English)
node scripts/quick-ping.js "$@"

echo ""
node -e "import('./scripts/lang-detect.js').then(m => process.stdout.write(m.detectSystemLanguage() === 'vi' ? 'Nhấn phím bất kỳ để thoát...' : 'Press any key to exit...'))"
read -n 1 -s -r
echo ""
exit 0
