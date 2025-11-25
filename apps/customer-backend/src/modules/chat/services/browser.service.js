// apps/customer-backend/src/modules/chat/services/browser.service.js
// ✅ FINAL FIX: Complete error isolation to prevent server crash
// ✅ CRITICAL: Lazy import puppeteer để tránh hang khi import module

import { Logger } from '../../../shared/utils/index.js';
import { BaseException } from '../../../shared/exceptions/BaseException.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let browserInstance = null;
let browserLaunchPromise = null;
let browserCleanupTimeout = null;
let puppeteerModule = null; // Lazy load puppeteer

export class BrowserService {
  async getBrowser() {
    if (browserInstance && browserInstance.isConnected()) {
      Logger.debug(`[BrowserService] ♻️ Tái sử dụng browser instance hiện có`);
      this._resetBrowserCleanupTimeout();
      return browserInstance;
    }

    if (browserLaunchPromise) {
      Logger.debug(`[BrowserService] ⏳ Đang chờ browser launch hoàn tất...`);
      return browserLaunchPromise;
    }

    browserLaunchPromise = this._launchBrowserSafe();
    
    try {
      browserInstance = await browserLaunchPromise;
      this._resetBrowserCleanupTimeout();
      return browserInstance;
    } finally {
      browserLaunchPromise = null;
    }
  }

  _resetBrowserCleanupTimeout() {
    if (browserCleanupTimeout) {
      clearTimeout(browserCleanupTimeout);
    }
    
    browserCleanupTimeout = setTimeout(async () => {
      Logger.info(`[BrowserService] 🧹 Auto-closing idle browser after 60s...`);
      await this.closeBrowser();
    }, 60000);
  }

  async _getPuppeteer() {
    // ✅ CRITICAL: Lazy load puppeteer để tránh hang khi import module
    if (!puppeteerModule) {
      Logger.info(`[BrowserService] 📦 Đang load puppeteer (lazy load)...`);
      
      try {
        // ✅ CRITICAL: Sử dụng require thay vì import để tránh hang
        // require có thể nhanh hơn và ít bị block hơn dynamic import
        Logger.info(`[BrowserService] 🔄 Loading puppeteer với require...`);
        const requireStartTime = Date.now();
        
        // ✅ Wrap trong Promise và defer sang tick tiếp theo để tránh block
        const loadPromise = new Promise((resolve, reject) => {
          // ✅ Defer require sang tick tiếp theo của event loop
          setImmediate(() => {
            try {
              // ✅ Set env để skip chromium check
              const originalSkipDownload = process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD;
              process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
              
              Logger.info(`[BrowserService] 🔄 Executing require('puppeteer')...`);
              // ✅ Use require thay vì import
              const puppeteer = require('puppeteer');
              
              // ✅ Restore env
              if (originalSkipDownload !== undefined) {
                process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = originalSkipDownload;
              } else {
                delete process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD;
              }
              
              Logger.info(`[BrowserService] ✅ Require puppeteer completed`);
              resolve(puppeteer);
            } catch (requireError) {
              Logger.error(`[BrowserService] ❌ Require error: ${requireError?.message || 'Unknown'}`);
              reject(requireError);
            }
          });
        });
        
        // ✅ Timeout cho require
        const loadTimeout = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Load puppeteer timeout sau 10 giây'));
          }, 10000);
        });
        
        puppeteerModule = await Promise.race([loadPromise, loadTimeout]);
        
        const loadDuration = ((Date.now() - requireStartTime) / 1000).toFixed(2);
        Logger.info(`[BrowserService] ✅ Đã load puppeteer thành công trong ${loadDuration}s`);
        
        // ✅ Kiểm tra xem puppeteer có đúng format không
        if (!puppeteerModule || typeof puppeteerModule.launch !== 'function') {
          throw new Error('Puppeteer module không hợp lệ - không có method launch');
        }
        Logger.info(`[BrowserService] ✅ Puppeteer module hợp lệ, có method launch`);
        
      } catch (loadError) {
        Logger.error(`[BrowserService] ❌ Lỗi load puppeteer: ${loadError?.message || 'Unknown'}`);
        Logger.error(`[BrowserService] Error type: ${loadError?.name || 'Unknown'}`);
        Logger.error(`[BrowserService] Error stack: ${loadError?.stack || 'No stack'}`);
        throw new Error(`Không thể load puppeteer: ${loadError?.message || 'Unknown error'}`);
      }
    }
    return puppeteerModule;
  }

  async _launchBrowserSafe() {
    try {
      Logger.info(`[BrowserService] 🚀 Launching Puppeteer browser...`);
      
      const puppeteer = await this._getPuppeteer();
      
      // ✅ CRITICAL: Wrap launch trong timeout để tránh hang
      Logger.info(`[BrowserService] 🔄 Bắt đầu launch browser...`);
      const launchPromise = puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-translate',
          '--disable-sync',
          '--metrics-recording-only',
          '--mute-audio',
          '--no-default-browser-check',
          '--js-flags=--max-old-space-size=256',
          '--disable-breakpad',
          '--disable-crash-reporter',
        ],
        timeout: 30000,
        ignoreDefaultArgs: ['--enable-automation'],
        handleSIGINT: false,
        handleSIGTERM: false,
        handleSIGHUP: false,
        dumpio: false,
      });

      // ✅ CRITICAL: Timeout cho launch (30s)
      let launchTimeoutHandle = null;
      const launchTimeout = new Promise((_, reject) => {
        launchTimeoutHandle = setTimeout(() => {
          Logger.error(`[BrowserService] ⏱️ Browser launch timeout sau 30 giây`);
          reject(new Error('Browser launch timeout sau 30 giây - có thể Chrome không được cài đặt hoặc không tìm thấy'));
        }, 30000);
      });

      Logger.info(`[BrowserService] 🔄 Waiting for browser launch...`);
      let browser;
      try {
        browser = await Promise.race([launchPromise, launchTimeout]);
        // ✅ CRITICAL: Clear timeout khi đã resolve
        if (launchTimeoutHandle) {
          clearTimeout(launchTimeoutHandle);
          launchTimeoutHandle = null;
        }
      } catch (raceError) {
        // ✅ CRITICAL: Clear timeout khi có error
        if (launchTimeoutHandle) {
          clearTimeout(launchTimeoutHandle);
          launchTimeoutHandle = null;
        }
        throw raceError;
      }
      Logger.info(`[BrowserService] ✅ Browser launch thành công`);

      browser.on('disconnected', () => {
        Logger.warn(`[BrowserService] ⚠️ Browser disconnected unexpectedly`);
        if (browserInstance === browser) {
          browserInstance = null;
        }
        if (browserCleanupTimeout) {
          clearTimeout(browserCleanupTimeout);
          browserCleanupTimeout = null;
        }
      });

      browser.on('error', (error) => {
        Logger.error(`[BrowserService] ❌ Browser error event: ${error.message}`);
        if (browserInstance === browser) {
          browserInstance = null;
        }
      });

      Logger.info(`[BrowserService] ✅ Browser launched successfully`);
      return browser;
    } catch (launchError) {
      Logger.error(`[BrowserService] ❌ Failed to launch browser: ${launchError.message}`);
      browserInstance = null;
      throw launchError;
    }
  }

  async closeBrowser() {
    if (browserCleanupTimeout) {
      clearTimeout(browserCleanupTimeout);
      browserCleanupTimeout = null;
    }

    if (browserInstance) {
      try {
        const pages = await browserInstance.pages();
        await Promise.all(pages.map(page => page.close().catch(() => {})));
        await browserInstance.close();
        Logger.info(`[BrowserService] 🧹 Browser closed successfully`);
      } catch (err) {
        Logger.warn(`[BrowserService] ⚠️ Error closing browser: ${err.message}`);
      } finally {
        browserInstance = null;
      }
    }
  }

  async captureScreenshot(url, options = {}) {
    let page = null;
    const startTime = Date.now();
    const hardTimeoutMs = 25000;
    let hardTimeoutHandle = null;
    let isTimedOut = false;

    try {
      const screenshotPromise = this._captureScreenshotInternal(url, options);
      
      const timeoutPromise = new Promise((_, reject) => {
        hardTimeoutHandle = setTimeout(() => {
          isTimedOut = true;
          reject(new Error(`Screenshot hard timeout after ${hardTimeoutMs}ms`));
        }, hardTimeoutMs);
      });

      const buffer = await Promise.race([screenshotPromise, timeoutPromise]);
      
      if (hardTimeoutHandle) {
        clearTimeout(hardTimeoutHandle);
      }

      return buffer;

    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.error(`[BrowserService] ❌ Screenshot failed after ${duration}s: ${error.message}`);

      if (isTimedOut || error.message.includes('timeout')) {
        throw new BaseException("Website tải quá lâu. Vui lòng thử lại.", 408);
      }
      if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
        throw new BaseException("Không tìm thấy website. Vui lòng kiểm tra URL.", 404);
      }
      if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
        throw new BaseException("Website từ chối kết nối.", 403);
      }
      if (error.message.includes('net::ERR_CERT')) {
        throw new BaseException("Website có vấn đề về SSL certificate.", 400);
      }
      
      throw new BaseException(`Không thể chụp ảnh: ${error.message}`, 400);

    } finally {
      if (hardTimeoutHandle) {
        clearTimeout(hardTimeoutHandle);
      }
    }
  }

  async _captureScreenshotInternal(url, options) {
    let page = null;
    let browser = null;
    const startTime = Date.now();
    let heartbeatInterval = null;

    try {
      Logger.info(`[BrowserService] 🎬 Bắt đầu chụp ảnh: ${url}`);
      
      // ✅ CRITICAL: Heartbeat để track progress
      heartbeatInterval = setInterval(() => {
        Logger.info(`[BrowserService] 💓 Heartbeat: Đang xử lý screenshot cho ${url}`);
      }, 3000);

      if (!url || typeof url !== 'string') {
        throw new BaseException("URL không hợp lệ", 400);
      }

      const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;

      Logger.info(`[BrowserService] 🔄 Đang lấy browser instance...`);
      // ✅ CRITICAL: Kiểm tra browser connection trước khi sử dụng
      browser = await this.getBrowser();
      Logger.info(`[BrowserService] ✅ Đã có browser instance, checking connection...`);
      
      if (!browser || !browser.isConnected()) {
        Logger.warn(`[BrowserService] ⚠️ Browser không connected, đang khởi động lại...`);
        browserInstance = null; // Reset để tạo browser mới
        browser = await this.getBrowser();
        Logger.info(`[BrowserService] ✅ Đã khởi động lại browser`);
      } else {
        Logger.info(`[BrowserService] ✅ Browser đã connected`);
      }

      // ✅ CRITICAL: Wrap newPage trong try-catch riêng
      Logger.info(`[BrowserService] 🔄 Đang tạo page...`);
      try {
        page = await browser.newPage();
        Logger.info(`[BrowserService] ✅ Page created successfully`);
      } catch (pageError) {
        Logger.error(`[BrowserService] ❌ Lỗi tạo page: ${pageError?.message || 'Unknown error'}`);
        Logger.error(`[BrowserService] Page error stack: ${pageError?.stack || 'No stack'}`);
        // Nếu browser bị disconnect, reset và thử lại
        if (pageError?.message?.includes('Target closed') || pageError?.message?.includes('disconnected')) {
          Logger.warn(`[BrowserService] ⚠️ Browser disconnected, resetting...`);
          browserInstance = null;
          browser = await this.getBrowser();
          Logger.info(`[BrowserService] 🔄 Retrying page creation...`);
          page = await browser.newPage();
          Logger.info(`[BrowserService] ✅ Đã tạo page mới sau khi reset browser`);
        } else {
          throw pageError;
        }
      }

      page.setDefaultTimeout(20000);
      page.setDefaultNavigationTimeout(20000);

      const viewport = options.viewport || {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1.5,
      };
      await page.setViewport(viewport);

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        const blockedTypes = ['media', 'font', 'websocket', 'manifest', 'other'];
        const blockedUrls = ['google-analytics', 'facebook', 'doubleclick', 'analytics'];
        const reqUrl = req.url().toLowerCase();
        
        if (blockedTypes.includes(resourceType) || blockedUrls.some(blocked => reqUrl.includes(blocked))) {
          req.abort();
        } else {
          req.continue();
        }
      });

      page.on('error', (err) => {
        Logger.warn(`[BrowserService] ⚠️ Page error (non-critical): ${err?.message || 'Unknown error'}`);
        // ✅ CRITICAL: Đánh dấu page có lỗi để cleanup sau
        page._hasError = true;
      });

      page.on('pageerror', (err) => {
        Logger.warn(`[BrowserService] ⚠️ Page JS error (non-critical): ${err?.message || 'Unknown error'}`);
      });

      // ✅ CRITICAL: Handle page close event để cleanup
      page.on('close', () => {
        Logger.debug(`[BrowserService] 📄 Page closed`);
        page = null;
      });

      const timeout = options.timeout || 15000;
      Logger.info(`[BrowserService] 🔄 Navigating to: ${normalizedUrl}`);
      
      try {
        await page.goto(normalizedUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: timeout,
        });
        
        // ✅ FIX: Puppeteer mới không có waitForTimeout, dùng setTimeout + Promise
        await new Promise(resolve => setTimeout(resolve, 2000));
        Logger.info(`[BrowserService] ✅ Navigation successful`);
      } catch (navError) {
        Logger.warn(`[BrowserService] ⚠️ Navigation issue: ${navError.message}`);
        if (navError.message.includes('timeout') && page) {
          Logger.info(`[BrowserService] 📸 Page loaded partially, attempting screenshot...`);
        } else {
          throw navError;
        }
      }

      Logger.info(`[BrowserService] 📸 Taking screenshot...`);
      
      // ✅ CRITICAL: Kiểm tra page vẫn còn valid trước khi screenshot
      if (!page || page.isClosed()) {
        throw new BaseException("Page đã bị đóng trước khi chụp ảnh", 500);
      }

      // ✅ CRITICAL: Wrap screenshot trong try-catch riêng
      let buffer;
      try {
        buffer = await page.screenshot({
          type: 'jpeg',
          quality: 85,
          fullPage: false,
          clip: { x: 0, y: 0, width: viewport.width, height: viewport.height },
        });

        if (!buffer || !Buffer.isBuffer(buffer)) {
          throw new BaseException("Screenshot trả về buffer không hợp lệ", 500);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        Logger.info(`[BrowserService] ✅ Screenshot completed in ${duration}s. Size: ${(buffer.length / 1024).toFixed(2)} KB`);
      } catch (screenshotErr) {
        Logger.error(`[BrowserService] ❌ Lỗi khi screenshot: ${screenshotErr?.message || 'Unknown error'}`);
        Logger.error(`[BrowserService] Screenshot error name: ${screenshotErr?.name || 'Unknown'}`);
        Logger.error(`[BrowserService] Screenshot error stack: ${screenshotErr?.stack || 'No stack'}`);
        // Nếu page bị close, reset browser instance
        if (screenshotErr?.message?.includes('Target closed') || screenshotErr?.message?.includes('disconnected')) {
          Logger.warn(`[BrowserService] ⚠️ Page/browser disconnected, resetting instance...`);
          browserInstance = null;
        }
        throw screenshotErr;
      }
      
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      
      return buffer;

    } catch (error) {
      // ✅ CRITICAL: Clear heartbeat on error
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      // ✅ CRITICAL: Log error nhưng không throw để tránh crash
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      Logger.error(`[BrowserService] ❌ Screenshot internal failed after ${duration}s: ${error?.message || 'Unknown error'}`);
      Logger.error(`[BrowserService] Error type: ${error?.name || 'Unknown'}`);
      Logger.error(`[BrowserService] Error code: ${error?.code || 'N/A'}`);
      Logger.error(`[BrowserService] Stack: ${error?.stack || 'No stack'}`);
      
      // ✅ Nếu browser bị disconnect, reset instance
      if (browser && (!browser.isConnected() || error?.message?.includes('disconnected'))) {
        Logger.warn(`[BrowserService] ⚠️ Browser disconnected, resetting instance...`);
        browserInstance = null;
      }
      
      throw error; // Re-throw để caller có thể handle
    } finally {
      // ✅ CRITICAL: Clear heartbeat trong finally
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }

      // ✅ CRITICAL: Đảm bảo page luôn được close
      if (page && !page.isClosed()) {
        try {
          Logger.info(`[BrowserService] 🧹 Closing page...`);
          await Promise.race([
            page.close(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Page close timeout')), 3000))
          ]);
          Logger.info(`[BrowserService] ✅ Page closed successfully`);
        } catch (closeError) {
          Logger.warn(`[BrowserService] ⚠️ Error closing page: ${closeError?.message || 'Unknown'}`);
        }
      }
    }
  }
}

// ✅ CRITICAL FIX: Lazy initialization để tránh khởi tạo khi import
// Instance chỉ được tạo khi thực sự được sử dụng
let browserServiceInstance = null;

function getBrowserServiceInstance() {
  if (!browserServiceInstance) {
    Logger.info('[BrowserService] 🆕 Creating BrowserService instance (lazy init)...');
    browserServiceInstance = new BrowserService();
  }
  return browserServiceInstance;
}

// ✅ Export getter - sử dụng khi cần, tránh khởi tạo khi import
export function getBrowserService() {
  return getBrowserServiceInstance();
}

// ✅ Export instance trực tiếp (backward compatibility)
// Nhưng instance chỉ được tạo khi property được truy cập lần đầu
export const browserService = new Proxy({}, {
  get(target, prop) {
    const instance = getBrowserServiceInstance();
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

// ✅ COMMENT: Tất cả process listeners đã được xử lý trong server.ts
// Không đăng ký ở đây để tránh conflict và silent crash khi import
// Server.ts đã có error handlers và cleanup handlers toàn cục