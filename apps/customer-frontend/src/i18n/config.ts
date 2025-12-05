import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import translationVN from "./locales/vi/translation.json";
import translationEN from "./locales/en/translation.json";
import translationJP from "./locales/ja/translation.json";
import translationKR from "./locales/ko/translation.json";
import translationCN from "./locales/zh/translation.json";
import translationFR from "./locales/fr/translation.json";
import translationDE from "./locales/de/translation.json";
import translationES from "./locales/es/translation.json";
import translationIT from "./locales/it/translation.json";
import translationRU from "./locales/ru/translation.json";

const resources = {
  vi: { translation: translationVN },
  en: { translation: translationEN },
  ja: { translation: translationJP },
  ko: { translation: translationKR },
  zh: { translation: translationCN },
  fr: { translation: translationFR },
  de: { translation: translationDE },
  es: { translation: translationES },
  it: { translation: translationIT },
  ru: { translation: translationRU },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "vi",
    lng: "vi",
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
