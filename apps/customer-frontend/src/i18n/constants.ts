export const LANGUAGE_MAP = {
  vi: { code: "vi", label: "Tiếng Việt", flag: "🇻🇳", shortCode: "VN" },
  en: { code: "en", label: "English (Global)", flag: "🇺🇸", shortCode: "EN" },
  ja: { code: "ja", label: "日本語 (Japan)", flag: "🇯🇵", shortCode: "JP" },
  ko: { code: "ko", label: "한국어 (Korea)", flag: "🇰🇷", shortCode: "KR" },
  zh: { code: "zh", label: "中文 (China)", flag: "🇨🇳", shortCode: "CN" },
  fr: { code: "fr", label: "Français (France)", flag: "🇫🇷", shortCode: "FR" },
  de: { code: "de", label: "Deutsch (Germany)", flag: "🇩🇪", shortCode: "DE" },
  es: { code: "es", label: "Español (Spain)", flag: "🇪🇸", shortCode: "ES" },
  it: { code: "it", label: "Italiano (Italy)", flag: "🇮🇹", shortCode: "IT" },
  ru: { code: "ru", label: "Русский (Russia)", flag: "🇷🇺", shortCode: "RU" },
} as const;

export const LANGUAGES = Object.values(LANGUAGE_MAP);

export type LanguageCode = keyof typeof LANGUAGE_MAP;

/**
 * Kiểm tra xem code có phải là ngôn ngữ hợp lệ không
 */
export function isValidLanguageCode(code: string): code is LanguageCode {
  return code in LANGUAGE_MAP;
}
