import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage, LANGUAGES, type LanguageCode } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface LanguageSwitcherProps {
  variant?: "default" | "compact";
  align?: "start" | "center" | "end";
}

/**
 * Component chuyển đổi ngôn ngữ có thể tái sử dụng
 *
 * @example
 * <LanguageSwitcher variant="compact" align="end" />
 */
export function LanguageSwitcher({
  variant = "default",
  align = "end",
}: LanguageSwitcherProps) {
  const { t } = useTranslation();
  const { currentLangInfo, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors outline-none group">
          <Globe
            className="w-5 h-5 group-hover:text-emerald-600"
            strokeWidth={1.5}
          />
          {variant === "default" && (
            <span className="text-xs font-bold font-mono pt-0.5">
              {currentLangInfo.shortCode}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="w-56 p-2 bg-white/95 backdrop-blur border border-stone-100 shadow-xl rounded-none animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="px-2 py-1.5 text-xs font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 mb-1">
          {t("header.selectRegion")}
        </div>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code as LanguageCode)}
              className={`flex items-center justify-between cursor-pointer rounded-none py-2.5 px-3 ${
                currentLangInfo.code === lang.code
                  ? "bg-emerald-50 text-emerald-900"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg leading-none">{lang.flag}</span>
                <span className="font-sans text-sm font-medium">
                  {t(`languages.${lang.code}`)}
                </span>
              </div>
              {currentLangInfo.code === lang.code && (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
