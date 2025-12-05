import { useTranslation } from "react-i18next";
import { useLanguage, LANGUAGES, type LanguageCode } from "@/i18n";

/**
 * Component demo để test hệ thống i18n
 * Có thể xóa sau khi đã test xong
 */
export function LanguageDemo() {
  const { t } = useTranslation();
  const { currentLangInfo, changeLanguage } = useLanguage();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🌍 i18n Demo</h1>

      <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
        <p className="font-semibold mb-2">Current Language:</p>
        <p className="text-2xl">
          {currentLangInfo.flag} {currentLangInfo.label} (
          {currentLangInfo.shortCode})
        </p>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-3">Translated Texts:</h2>
        <ul className="space-y-2 bg-gray-50 p-4 rounded">
          <li>
            • Shop: <strong>{t("header.shop")}</strong>
          </li>
          <li>
            • Business: <strong>{t("header.business")}</strong>
          </li>
          <li>
            • Inspiration: <strong>{t("header.inspiration")}</strong>
          </li>
          <li>
            • Sign In: <strong>{t("header.signIn")}</strong>
          </li>
          <li>
            • Start Project: <strong>{t("header.startProject")}</strong>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Switch Language:</h2>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code as LanguageCode)}
              className={`p-3 rounded border-2 transition-all ${
                currentLangInfo.code === lang.code
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <span className="text-xl mr-2">{lang.flag}</span>
              <span className="font-medium">{lang.shortCode}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
