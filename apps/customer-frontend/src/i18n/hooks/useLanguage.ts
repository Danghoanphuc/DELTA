import { useTranslation } from "react-i18next";
import { LANGUAGE_MAP, type LanguageCode } from "../constants";

export function useLanguage() {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as LanguageCode;
  const currentLangInfo = LANGUAGE_MAP[currentLanguage] || LANGUAGE_MAP.vi;

  const changeLanguage = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
  };

  return {
    currentLanguage,
    currentLangInfo,
    changeLanguage,
  };
}
