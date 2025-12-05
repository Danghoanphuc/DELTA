import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/i18n";

interface LanguageSEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

/**
 * Component thêm SEO meta tags cho đa ngôn ngữ
 * Giúp Google hiểu trang có nhiều phiên bản ngôn ngữ
 *
 * @example
 * <LanguageSEO
 *   title="Printz - B2B Printing Platform"
 *   description="Digital platform for enterprise printing"
 * />
 */
export function LanguageSEO({
  title,
  description,
  keywords,
  image,
}: LanguageSEOProps) {
  const { currentLangInfo } = useLanguage();
  const baseUrl = import.meta.env.VITE_APP_URL || "https://printz.vn";
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : baseUrl;

  return (
    <Helmet>
      {/* Basic Meta */}
      <html lang={currentLangInfo.code} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={currentLangInfo.code} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {/* AI/LLM Optimization */}
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta
        name="ai-content-declaration"
        content="This is a business website for Printz Enterprise, a B2B printing and brand management platform"
      />
      <link rel="alternate" type="application/json" href="/ai-seo.json" />
      <link rel="alternate" type="text/plain" href="/llms.txt" />

      {/* Language alternatives - Báo Google về các phiên bản ngôn ngữ */}
      <link rel="alternate" hrefLang="vi" href={`${baseUrl}?lang=vi`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}?lang=en`} />
      <link rel="alternate" hrefLang="ja" href={`${baseUrl}?lang=ja`} />
      <link rel="alternate" hrefLang="ko" href={`${baseUrl}?lang=ko`} />
      <link rel="alternate" hrefLang="zh" href={`${baseUrl}?lang=zh`} />
      <link rel="alternate" hrefLang="fr" href={`${baseUrl}?lang=fr`} />
      <link rel="alternate" hrefLang="de" href={`${baseUrl}?lang=de`} />
      <link rel="alternate" hrefLang="es" href={`${baseUrl}?lang=es`} />
      <link rel="alternate" hrefLang="it" href={`${baseUrl}?lang=it`} />
      <link rel="alternate" hrefLang="ru" href={`${baseUrl}?lang=ru`} />
      <link rel="alternate" hrefLang="x-default" href={baseUrl} />

      {/* Canonical URL */}
      <link rel="canonical" content={currentUrl} />
    </Helmet>
  );
}
