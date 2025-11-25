import puppeteer from 'puppeteer';
import { Logger } from '../../shared/utils/index.js';
import { BaseException } from '../../shared/exceptions/BaseException.js';

export class CanvaService {
  /**
   * Cấu hình Browser tối ưu cho Server/Docker
   */
  async getBrowser() {
    return await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Quan trọng cho Docker
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', 
        '--disable-gpu'
      ]
    });
  }

  /**
   * Capture Screenshot từ Link Canva
   * @param {string} url - Link Canva Public
   * @returns {Promise<Buffer>} - Buffer ảnh JPEG
   */
  async captureDesign(url) {
    let browser = null;
    try {
      Logger.info(`[CanvaSvc] Start capturing: ${url}`);
      
      browser = await this.getBrowser();
      const page = await browser.newPage();

      // Giả lập màn hình Full HD x2 (Retina) để ảnh nét cho AI nhìn
      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2, 
      });

      // Tối ưu network: Chặn tải font/media rác
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['media', 'websocket', 'manifest', 'other'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Truy cập trang (Timeout 30s)
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Chờ thêm 2s để render hiệu ứng
      await new Promise(r => setTimeout(r, 2000));

      // Chụp ảnh JPEG (Quality 90 là đủ tốt cho AI)
      const buffer = await page.screenshot({
        type: 'jpeg', 
        quality: 90,
        fullPage: false
      });

      Logger.info(`[CanvaSvc] Capture success. Size: ${(buffer.length / 1024).toFixed(2)} KB`);
      return buffer;

    } catch (error) {
      Logger.error(`[CanvaSvc] Capture Failed: ${error.message}`);
      throw new BaseException("Không thể chụp ảnh từ link này. Vui lòng đảm bảo link ở chế độ 'Bất kỳ ai có liên kết'.", 400);
    } finally {
      if (browser) await browser.close();
    }
  }
}