#!/usr/bin/env node
/**
 * Translation Helper - Tự động sync translations
 * Usage: node scripts/translate-helper.js
 */

const fs = require("fs");
const path = require("path");

const I18N_DIR = path.join(__dirname, "../src/i18n/locales");
const VI_FILE = path.join(I18N_DIR, "vi/translation.json");

// Đọc file tiếng Việt (source of truth)
const viTranslations = JSON.parse(fs.readFileSync(VI_FILE, "utf8"));

// Mapping đơn giản cho auto-translate (bạn có thể dùng API sau)
const quickTranslations = {
  "Quản trị thương hiệu": {
    en: "Brand Management",
    ja: "ブランド管理",
    ko: "브랜드 관리",
    zh: "品牌管理",
  },
  "In ấn doanh nghiệp": {
    en: "Corporate Printing",
    ja: "企業印刷",
    ko: "기업 인쇄",
    zh: "企业印刷",
  },
  // Thêm các cụm từ thường dùng...
};

console.log("✅ Translation helper ready!");
console.log("📝 Edit vi/translation.json first, then run this script");
console.log("🔄 It will suggest translations for other languages");
