/**
 * PDF Generator Utility using Puppeteer
 *
 * Generates PDFs from HTML templates using Puppeteer
 * Provides better maintainability than PDFKit by using HTML/CSS
 */

import puppeteer, { Browser, Page } from "puppeteer";
import { Logger } from "./logger.js";
import * as fs from "fs/promises";

/**
 * PDF generation options
 */
export interface PDFOptions {
  format?: "A4" | "Letter";
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
  headerTemplate?: string;
  footerTemplate?: string;
}

/**
 * Default PDF options
 */
const DEFAULT_PDF_OPTIONS: PDFOptions = {
  format: "A4",
  margin: {
    top: "20mm",
    right: "15mm",
    bottom: "20mm",
    left: "15mm",
  },
  printBackground: true,
  displayHeaderFooter: false,
};

/**
 * Browser instance cache for reuse
 */
let browserInstance: Browser | null = null;

/**
 * Get or create browser instance
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    Logger.debug("[PDFGenerator] Launching Puppeteer browser");
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return browserInstance;
}

/**
 * Generate PDF from HTML content
 *
 * @param html - HTML content to convert to PDF
 * @param options - PDF generation options
 * @returns PDF buffer
 */
export async function generatePDFFromHTML(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const startTime = Date.now();
  Logger.debug("[PDFGenerator] Starting PDF generation");

  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });

    // Set content and wait for network to be idle
    await page.setContent(html, {
      waitUntil: ["networkidle0", "load"],
      timeout: 30000,
    });

    // Wait a bit for any dynamic content or fonts to load
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Merge options with defaults
    const pdfOptions = {
      ...DEFAULT_PDF_OPTIONS,
      ...options,
      margin: {
        ...DEFAULT_PDF_OPTIONS.margin,
        ...options.margin,
      },
    };

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    const duration = Date.now() - startTime;
    Logger.success(
      `[PDFGenerator] PDF generated successfully in ${duration}ms`
    );

    return Buffer.from(pdfBuffer);
  } catch (error) {
    Logger.error("[PDFGenerator] Failed to generate PDF:", error);
    throw error;
  } finally {
    if (page) {
      await page.close();
    }
  }
}

/**
 * Generate PDF from HTML template file
 *
 * @param templatePath - Path to HTML template file
 * @param options - PDF generation options
 * @returns PDF buffer
 */
export async function generatePDFFromTemplate(
  templatePath: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  try {
    // Read template file
    const html = await fs.readFile(templatePath, "utf-8");

    // Generate PDF
    return await generatePDFFromHTML(html, options);
  } catch (error) {
    Logger.error(
      `[PDFGenerator] Failed to read template: ${templatePath}`,
      error
    );
    throw error;
  }
}

/**
 * Close browser instance
 * Should be called when shutting down the application
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    Logger.debug("[PDFGenerator] Closing Puppeteer browser");
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Cleanup on process exit
 */
process.on("exit", () => {
  if (browserInstance) {
    browserInstance.close();
  }
});

process.on("SIGINT", async () => {
  await closeBrowser();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closeBrowser();
  process.exit(0);
});
