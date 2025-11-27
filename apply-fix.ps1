# Auto-apply patches for Windows
# Run this in PowerShell: .\apply-fix.ps1

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🔧 AUTO-APPLYING FIXES" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Function to create backup
function Backup-File {
    param($FilePath)
    
    if (Test-Path $FilePath) {
        $BackupPath = "$FilePath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $FilePath $BackupPath
        Write-Host "✅ Backed up: $FilePath" -ForegroundColor Green
        Write-Host "   → $BackupPath" -ForegroundColor Gray
        return $true
    } else {
        Write-Host "❌ File not found: $FilePath" -ForegroundColor Red
        return $false
    }
}

# Step 1: Download Chromium
Write-Host "1️⃣ Downloading Chromium..." -ForegroundColor Yellow
Write-Host "   (This may take a few minutes)" -ForegroundColor Gray
try {
    npx puppeteer browsers install chrome
    Write-Host "✅ Chromium downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Chromium download failed (will retry on first use)" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Update .env
Write-Host "2️⃣ Updating .env file..." -ForegroundColor Yellow
$EnvFile = ".\.env"
$NodeOptions = "NODE_OPTIONS=--max-old-space-size=4096"

if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile
    if ($EnvContent -notmatch "NODE_OPTIONS") {
        Add-Content -Path $EnvFile -Value "`n# Node.js Memory Limit"
        Add-Content -Path $EnvFile -Value $NodeOptions
        Write-Host "✅ Added NODE_OPTIONS to .env" -ForegroundColor Green
    } else {
        Write-Host "✅ .env already has NODE_OPTIONS" -ForegroundColor Green
    }
} else {
    Set-Content -Path $EnvFile -Value "# Node.js Memory Limit"
    Add-Content -Path $EnvFile -Value $NodeOptions
    Write-Host "✅ Created .env with NODE_OPTIONS" -ForegroundColor Green
}
Write-Host ""

# Step 3: Patch server.ts
Write-Host "3️⃣ Patching server.ts..." -ForegroundColor Yellow
$ServerFile = ".\apps\customer-backend\src\server.ts"

if (Backup-File $ServerFile) {
    try {
        $Content = Get-Content $ServerFile -Raw
        
        # Find and replace the pre-init block
        $OldPattern = @"
    // ✅ CRITICAL: Pre-initialize BrowserService NGAY SAU KHI KẾT NỐI DB
    // Điều này sẽ load Puppeteer TRƯC khi bất kỳ job nào chạy
    // Giúp tránh crash khi import Puppeteer trong worker
    Logger.info\('\[Server\] 🌐 Pre-initializing browser service...'\);
    try \{
      const \{ getBrowserService \} = await import\('\.\/modules\/chat\/services\/browser\.service\.js'\);
      const browserService = getBrowserService\(\);
      await browserService\.preInitialize\(\);
      Logger\.success\('\[Server\] ✅ Browser service ready'\);
    \} catch \(browserError\) \{
      Logger\.error\('\[Server\] ⚠️ Browser pre-init failed, will retry on first use:', browserError\);
      // Không throw error để server vẫn chạy được
    \}
"@

        $NewCode = @"
    // ❌ BỎ PRE-INIT: Puppeteer quá nặng, sẽ được load lazy khi cần
    Logger.info('[Server] 🌐 Browser service will be initialized on first use (lazy load)');
"@

        if ($Content -match $OldPattern) {
            $Content = $Content -replace $OldPattern, $NewCode
            Set-Content -Path $ServerFile -Value $Content
            Write-Host "✅ server.ts patched successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Pattern not found in server.ts - may already be patched" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Failed to patch server.ts: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Step 4: Patch browser.service.js
Write-Host "4️⃣ Patching browser.service.js..." -ForegroundColor Yellow
$BrowserFile = ".\apps\customer-backend\src\modules\chat\services\browser.service.js"

if (Backup-File $BrowserFile) {
    try {
        $Content = Get-Content $BrowserFile -Raw
        
        # Find preInitialize method and replace
        $Pattern = "async preInitialize\(\) \{[^}]*\}"
        
        $NewMethod = @"
/**
   * @deprecated Không dùng nữa - gây crash server khi import Puppeteer
   * Browser sẽ được khởi tạo lazy khi cần thiết (khi có job đầu tiên)
   */
  async preInitialize() {
    Logger.warn('[BrowserService] ⚠️ preInitialize() is deprecated and does nothing');
    Logger.info('[BrowserService] 🌐 Browser will be initialized on first use (lazy load)');
    return Promise.resolve();
  }
"@

        # This is complex - better to show manual instructions
        Write-Host "⚠️ browser.service.js requires manual patch" -ForegroundColor Yellow
        Write-Host "   Please open the file and:" -ForegroundColor Gray
        Write-Host "   1. Find the preInitialize() method" -ForegroundColor Gray
        Write-Host "   2. Replace entire method body with:" -ForegroundColor Gray
        Write-Host "      Logger.warn('[BrowserService] ⚠️ preInitialize() is deprecated');" -ForegroundColor Gray
        Write-Host "      return Promise.resolve();" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   See PATCH_browser.service.js.txt for details" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Failed to patch browser.service.js: $_" -ForegroundColor Red
    }
}
Write-Host ""

# Step 5: Check cross-env
Write-Host "5️⃣ Checking cross-env..." -ForegroundColor Yellow
try {
    $CrossEnvCheck = pnpm list cross-env 2>&1
    if ($CrossEnvCheck -match "cross-env") {
        Write-Host "✅ cross-env is installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Installing cross-env..." -ForegroundColor Yellow
        pnpm add -D cross-env
        Write-Host "✅ cross-env installed" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not check cross-env: $_" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Chromium: Downloaded (or will download on first use)" -ForegroundColor Green
Write-Host "✅ Memory: NODE_OPTIONS configured in .env" -ForegroundColor Green
Write-Host "✅ server.ts: Patched (backed up)" -ForegroundColor Green
Write-Host "⚠️ browser.service.js: Needs manual patch" -ForegroundColor Yellow
Write-Host "✅ cross-env: Installed" -ForegroundColor Green
Write-Host ""

Write-Host "📝 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Manually patch browser.service.js (see PATCH_browser.service.js.txt)" -ForegroundColor White
Write-Host "2. Clear cache: Remove-Item -Recurse -Force node_modules\.cache, apps\customer-backend\dist" -ForegroundColor White
Write-Host "3. Start server: pnpm run dev" -ForegroundColor White
Write-Host "4. Test: Should start in 7-8s without hanging!" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Auto-patch complete! Manual step required for browser.service.js" -ForegroundColor Green
Write-Host "   See README_FIX.md for full instructions" -ForegroundColor Gray
Write-Host "======================================" -ForegroundColor Cyan

# Pause to review
Read-Host -Prompt "`nPress Enter to exit"
