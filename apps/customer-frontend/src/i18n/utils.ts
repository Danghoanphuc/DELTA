import { LANGUAGE_MAP, type LanguageCode } from "./constants";

/**
 * Lấy thông tin ngôn ngữ từ code
 */
export function getLanguageInfo(code: LanguageCode) {
  return LANGUAGE_MAP[code];
}

/**
 * Kiểm tra xem code có phải là ngôn ngữ hợp lệ không
 */
export function isValidLanguageCode(code: string): code is LanguageCode {
  return code in LANGUAGE_MAP;
}

/**
 * Lấy ngôn ngữ từ localStorage
 */
export function getSavedLanguage(): LanguageCode | null {
  const saved = localStorage.getItem("i18nextLng");
  if (saved && isValidLanguageCode(saved)) {
    return saved;
  }
  return null;
}

/**
 * Lưu ngôn ngữ vào localStorage
 */
export function saveLanguage(code: LanguageCode) {
  localStorage.setItem("i18nextLng", code);
}
