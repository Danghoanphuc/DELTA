// apps/customer-frontend/src/shared/components/seo/Breadcrumbs.tsx
// SEO-optimized Breadcrumbs with Schema.org BreadcrumbList markup

import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { Helmet } from "react-helmet-async";

export interface BreadcrumbItem {
  label: string;
  href?: string; // Optional - last item usually doesn't have href
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  variant?: "light" | "dark"; // light = dark text, dark = light text (for dark backgrounds)
}

const SITE_URL = import.meta.env.VITE_SITE_URL || "https://printz.vn";

/**
 * Breadcrumbs component with Schema.org BreadcrumbList markup
 * Critical for SEO - helps Google understand site structure
 */
export function Breadcrumbs({
  items,
  className = "",
  variant = "light",
}: BreadcrumbsProps) {
  const isDark = variant === "dark";

  // Build full breadcrumb list with Home
  const fullItems: BreadcrumbItem[] = [
    { label: "Trang chủ", href: "/" },
    ...items,
  ];

  // Generate Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: fullItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  };

  return (
    <>
      {/* Schema.org BreadcrumbList */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Visual Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1 text-sm ${className}`}
      >
        {fullItems.map((item, index) => {
          const isLast = index === fullItems.length - 1;
          const isFirst = index === 0;

          return (
            <div key={index} className="flex items-center gap-1">
              {/* Separator */}
              {index > 0 && (
                <ChevronRight
                  className={`w-3.5 h-3.5 ${
                    isDark ? "text-white/40" : "text-stone-400"
                  }`}
                />
              )}

              {/* Breadcrumb Item */}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={`
                    flex items-center gap-1 transition-colors
                    ${
                      isDark
                        ? "text-white/70 hover:text-white"
                        : "text-stone-500 hover:text-stone-900"
                    }
                  `}
                >
                  {isFirst && <Home className="w-3.5 h-3.5" />}
                  <span className={isFirst ? "sr-only sm:not-sr-only" : ""}>
                    {item.label}
                  </span>
                </Link>
              ) : (
                <span
                  className={`
                    font-medium truncate max-w-[200px] sm:max-w-[300px]
                    ${isDark ? "text-white" : "text-stone-900"}
                  `}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}

export default Breadcrumbs;
