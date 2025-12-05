import { Helmet } from "react-helmet-async";
// ⚠️ Move file JSON vào trong src để đảm bảo Type Safety & Build Optimization
import aiSeo from "@/data/ai-seo.json";

const APP_URL = import.meta.env.VITE_APP_URL || "https://printz.vn";

interface StructuredDataProps {
  /**
   * isGlobal = true: Dùng cho App.tsx (Render Org, Website, Software, FAQ chính)
   * isGlobal = false: Dùng cho Page con (Chỉ render Breadcrumb, Article, Product cụ thể)
   */
  isGlobal?: boolean;
  type?: "Product" | "Article" | "BreadcrumbList" | "LocalBusiness";
  data?: Record<string, any>;
  breadcrumbs?: Array<{ name: string; path: string }>;
}

export function StructuredData({
  isGlobal = false,
  type,
  data,
  breadcrumbs,
}: StructuredDataProps) {
  const schemas = [];

  // --- 1. GLOBAL SCHEMAS (App Level) ---
  if (isGlobal) {
    // 1.1 Organization (Identity)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: aiSeo.name,
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/logo.png`,
        width: 112,
        height: 112,
      },
      description: aiSeo.description,
      // Map contact info an toàn (Defensive Coding)
      contactPoint: aiSeo.contact
        ? {
            "@type": "ContactPoint",
            telephone: aiSeo.contact.telephone,
            email: aiSeo.contact.email,
            contactType: "Customer Service",
            areaServed: "VN",
            availableLanguage: ["vi", "en"],
          }
        : undefined,
      // Map socials (Defensive Coding)
      sameAs: aiSeo.socials || [],
    });

    // 1.2 WebSite (Sitelinks Search Box)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      name: aiSeo.name,
      url: APP_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${APP_URL}/shop?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    });

    // 1.3 SoftwareApplication (Thay cho Product giá 0đ - Correct Semantic for B2B SaaS)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Printz Enterprise Platform",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
      },
      description: aiSeo.description,
      featureList: aiSeo.key_features?.map((f) => f.name),
      author: {
        "@type": "Organization",
        "@id": `${APP_URL}/#organization`,
      },
    });

    // 1.4 FAQPage (Global FAQ từ Brand Positioning)
    if (aiSeo.faq && aiSeo.faq.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: aiSeo.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      });
    }
  }

  // --- 2. SPECIFIC SCHEMAS (Page Level) ---

  // 2.1 Dynamic Breadcrumbs
  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.path.startsWith("http")
          ? crumb.path
          : `${APP_URL}${crumb.path}`,
      })),
    });
  }

  // 2.2 Custom Type (ProductDetail, Article, etc.)
  if (type && data) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": type,
      ...data,
    });
  }

  if (schemas.length === 0) return null;

  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
