#!/bin/bash
# Test script để verify fix thành công

echo "========================================"
echo "🧪 TESTING FIX: Server Crash Issue"
echo "========================================"
echo ""

# 1. Check Node.js memory limit
echo "1️⃣ Checking Node.js Memory Limit..."
node -e "console.log('✅ Max Old Space:', Math.round(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024), 'MB')"
echo ""

# 2. Check Chromium downloaded
echo "2️⃣ Checking Chromium Installation..."
if [ -d "$HOME/.cache/puppeteer/chrome" ] || [ -d "$USERPROFILE/.cache/puppeteer/chrome" ]; then
  echo "✅ Chromium is downloaded"
  # Count chrome directories
  CHROME_COUNT=$(find "$HOME/.cache/puppeteer/chrome" -name "chrome*" 2>/dev/null | wc -l)
  if [ "$CHROME_COUNT" -gt 0 ]; then
    echo "   Found $CHROME_COUNT Chrome installation(s)"
  fi
else
  echo "⚠️ Chromium NOT found - will download on first use"
  echo "   Suggested: Run 'npx puppeteer browsers install chrome'"
fi
echo ""

# 3. Check server.ts patch
echo "3️⃣ Checking server.ts patch..."
if grep -q "Browser service will be initialized on first use" apps/customer-backend/src/server.ts; then
  echo "✅ server.ts is patched (lazy load enabled)"
else
  echo "❌ server.ts NOT patched - preInitialize() still active!"
  echo "   Please apply PATCH_server.ts.txt"
fi
echo ""

# 4. Check browser.service.js patch
echo "4️⃣ Checking browser.service.js patch..."
if grep -q "@deprecated.*preInitialize" apps/customer-backend/src/modules/chat/services/browser.service.js; then
  echo "✅ browser.service.js is patched (preInitialize deprecated)"
else
  echo "⚠️ browser.service.js might not be patched"
  echo "   Please check PATCH_browser.service.js.txt"
fi
echo ""

# 5. Check package.json
echo "5️⃣ Checking package.json for NODE_OPTIONS..."
if grep -q "NODE_OPTIONS.*max-old-space-size" package.json; then
  echo "✅ package.json has NODE_OPTIONS configured"
  grep "NODE_OPTIONS" package.json | head -1
else
  echo "⚠️ package.json might not have NODE_OPTIONS"
  echo "   Consider applying PATCH_package.json.txt"
fi
echo ""

# 6. Check cross-env
echo "6️⃣ Checking cross-env installation..."
if pnpm list cross-env 2>/dev/null | grep -q "cross-env"; then
  echo "✅ cross-env is installed"
else
  echo "⚠️ cross-env NOT installed"
  echo "   Run: pnpm add -D cross-env"
fi
echo ""

# 7. Summary
echo "========================================"
echo "📊 SUMMARY"
echo "========================================"
echo ""

ALL_GOOD=true

# Check each requirement
if node -e "process.exit(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024 < 3000 ? 1 : 0)" 2>/dev/null; then
  echo "✅ Memory limit OK (>= 3GB)"
else
  echo "❌ Memory limit too low"
  ALL_GOOD=false
fi

if grep -q "Browser service will be initialized on first use" apps/customer-backend/src/server.ts 2>/dev/null; then
  echo "✅ server.ts patched"
else
  echo "❌ server.ts NOT patched"
  ALL_GOOD=false
fi

if grep -q "@deprecated.*preInitialize" apps/customer-backend/src/modules/chat/services/browser.service.js 2>/dev/null; then
  echo "✅ browser.service.js patched"
else
  echo "⚠️ browser.service.js might need patch"
fi

echo ""

if [ "$ALL_GOOD" = true ]; then
  echo "🎉 ALL CHECKS PASSED!"
  echo ""
  echo "Next steps:"
  echo "1. Stop server: Ctrl+C"
  echo "2. Clear cache: rm -rf node_modules/.cache apps/customer-backend/dist"
  echo "3. Start server: pnpm run dev"
  echo "4. Wait 3-5s for server to start (should be fast!)"
  echo "5. Test by sending a Canva URL in chat"
  echo ""
  echo "Expected behavior:"
  echo "- Server starts quickly without hanging"
  echo "- First URL takes 15-20s (Puppeteer lazy load)"
  echo "- Subsequent URLs are faster"
else
  echo "⚠️ SOME CHECKS FAILED"
  echo ""
  echo "Please review the checklist above and apply missing patches."
  echo "Refer to FIX_SERVER_CRASH.md for detailed instructions."
fi

echo "========================================"
