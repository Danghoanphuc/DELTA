// apps/customer-frontend/src/features/artisan/pages/ArtisansListPage.tsx
// Redesigned: High-End Curator Strategy (Matching Profile Page)

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  MapPin,
  Star,
  Award,
  Search,
  Loader2,
  Gem,
  ArrowRight,
} from "lucide-react";
import { artisanService, Artisan } from "@/services/artisan.service";
import { Header, Footer } from "@/features/landing/components";

// SEO Constants
const BRAND_NAME = "Printz";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://printz.vn";

// Filter Options - Wording sang trọng hơn
const TYPE_OPTIONS = [
  { value: "", label: "Toàn bộ danh mục" },
  { value: "artisan", label: "Nghệ nhân ưu tú" },
  { value: "manufacturer", label: "Xưởng chế tác" },
  { value: "distributor", label: "Nhà sưu tầm" },
  { value: "printer", label: "Nhà in nghệ thuật" },
];

const TYPE_LABELS: Record<string, string> = {
  manufacturer: "Xưởng chế tác",
  distributor: "Nhà sưu tầm",
  artisan: "Nghệ nhân ưu tú",
  master: "Nghệ nhân nhân dân",
  printer: "Nhà in nghệ thuật",
  dropshipper: "Đối tác phân phối",
};

export default function ArtisansListPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12, // Giảm limit để tập trung vào chất lượng visual
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchArtisans();
  }, [typeFilter, pagination.page]);

  const fetchArtisans = async () => {
    setIsLoading(true);
    try {
      const result = await artisanService.getArtisans({
        type: typeFilter || undefined,
        page: pagination.page,
        limit: pagination.limit,
      });
      setArtisans(result.artisans);
      setPagination((prev) => ({
        ...prev,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching artisans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArtisans = artisans.filter((artisan) =>
    searchQuery
      ? artisan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artisan.code.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // SEO Metadata
  const pageTitle = `Mạng lưới Nghệ nhân & Đối tác Chế tác | ${BRAND_NAME}`;
  const pageDescription =
    "Kết nối với những nghệ nhân hàng đầu và xưởng chế tác thủ công tinh xảo. Mỗi đối tác được Printz bảo chứng về chất lượng và nguồn gốc.";
  const canonicalUrl = `${SITE_URL}/artisans`;

  // JSON-LD Schema: CollectionPage + ItemList (SEO/GEO optimized)
  const generateSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: BRAND_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo.png`,
        },
      },
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: pagination.total,
        itemListElement: filteredArtisans.map((artisan, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            // Person vs Organization based on type
            "@type":
              artisan.type === "manufacturer" ? "Organization" : "Person",
            name: artisan.name,
            url: `${SITE_URL}/artisans/${artisan.code}`,
            image: artisan.profile?.avatar || undefined,
            // jobTitle only for Person type
            ...(artisan.type !== "manufacturer" && {
              jobTitle: TYPE_LABELS[artisan.type] || "Nghệ nhân",
            }),
            description:
              artisan.profile?.bio ||
              `Nghệ nhân chế tác thuộc lĩnh vực ${
                artisan.capabilities?.[0] || "thủ công mỹ nghệ"
              }`,
            // knowsAbout - Critical for GEO/AI understanding
            knowsAbout:
              artisan.capabilities?.map((cap) => ({
                "@type": "Thing",
                name: cap,
              })) || [],
            // Address for local SEO
            ...(artisan.contactInfo.city && {
              address: {
                "@type": "PostalAddress",
                addressLocality: artisan.contactInfo.city,
                addressCountry: artisan.contactInfo.country || "VN",
              },
            }),
            // Aggregate rating
            ...(artisan.rating > 0 && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: artisan.rating,
                bestRating: 5,
                worstRating: 0,
              },
            }),
          },
        })),
      },
    };
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-slate-800">
      <Helmet>
        {/* Basic Meta */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={BRAND_NAME} />
        <meta property="og:locale" content="vi_VN" />
        <meta
          property="og:image"
          content={`${SITE_URL}/images/artisans-og.jpg`}
        />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta
          name="twitter:image"
          content={`${SITE_URL}/images/artisans-og.jpg`}
        />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta
          name="keywords"
          content={`nghệ nhân, thủ công mỹ nghệ, xưởng chế tác, quà tặng cao cấp, ${BRAND_NAME}, artisan Vietnam`}
        />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(generateSchema())}
        </script>
      </Helmet>

      <Header />

      {/* 1. HERO SECTION: DARK & MOODY (Giống trang Profile) */}
      <section className="relative py-24 px-4 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/40" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/30 border border-amber-700/50 text-amber-500 text-xs uppercase tracking-widest font-bold mb-2">
            <Gem className="w-3 h-3" />
            Curated Network
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight text-white">
            Tinh Hoa{" "}
            <span className="text-amber-500 font-serif italic">Chế Tác</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Danh sách tuyển chọn những nghệ nhân và xưởng chế tác hàng đầu, nơi
            lưu giữ hồn cốt của thủ công mỹ nghệ Việt Nam.
          </p>
        </div>
      </section>

      {/* 2. FILTERS & SEARCH: CLEAN & MINIMAL */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTypeFilter(opt.value);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-sm text-sm font-medium transition-all ${
                    typeFilter === opt.value
                      ? "bg-slate-900 text-white border border-slate-900 shadow-md"
                      : "bg-white text-slate-600 border border-gray-200 hover:border-amber-500 hover:text-amber-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tra cứu nghệ nhân..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. LISTING CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-amber-800">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-medium tracking-widest uppercase">
              Đang tải dữ liệu...
            </p>
          </div>
        ) : filteredArtisans.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-sm border border-dashed border-gray-300">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-gray-500 font-serif text-lg">
              Chưa tìm thấy nghệ nhân phù hợp với tiêu chí của bạn.
            </p>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredArtisans.map((artisan) => (
                <Link
                  key={artisan._id}
                  to={`/artisans/${artisan.code}`}
                  className="group relative flex flex-col bg-white rounded-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-gray-100"
                >
                  {/* Cover Image */}
                  <div className="h-28 bg-slate-900 relative overflow-hidden rounded-t-sm">
                    {artisan.profile?.coverImage ? (
                      <img
                        src={artisan.profile.coverImage}
                        alt={`${artisan.name} cover`}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600 via-slate-900 to-slate-900"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                    {/* Badge Ưu tiên */}
                    {artisan.isPreferred && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-lg border border-amber-500/50">
                          <Gem className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Avatar Section */}
                  <div className="px-5 -mt-12 mb-3 relative z-10">
                    <div className="w-20 h-20 rounded-lg p-1 bg-white shadow-md rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <div className="w-full h-full bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
                        {artisan.profile?.avatar ? (
                          <img
                            src={artisan.profile.avatar}
                            alt={artisan.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-serif text-2xl font-bold text-slate-800">
                            {artisan.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="px-5 pb-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                          {TYPE_LABELS[artisan.type] || "Nghệ nhân"}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <div className="flex items-center gap-0.5 text-xs text-slate-500">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {artisan.rating.toFixed(1)}
                        </div>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-slate-900 leading-tight group-hover:text-amber-800 transition-colors line-clamp-2">
                        {artisan.name}
                      </h3>
                      {artisan.contactInfo.city && (
                        <div className="flex items-center gap-1.5 mt-2 text-sm text-slate-500 italic">
                          <MapPin className="w-3.5 h-3.5" />
                          {artisan.contactInfo.city}
                        </div>
                      )}
                    </div>

                    {/* Capabilities Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {artisan.capabilities?.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-sm whitespace-nowrap"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>

                    {/* Footer / CTA */}
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between group/link">
                      <span className="text-xs text-slate-400 font-medium">
                        {artisan.code}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-bold text-amber-700 group-hover/link:underline underline-offset-4 decoration-amber-500">
                        Khám phá không gian{" "}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination: Minimal Style */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16 border-t border-gray-200 pt-8">
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  className="px-5 py-2.5 text-sm font-medium border border-gray-200 hover:border-slate-800 hover:text-slate-900 rounded-sm disabled:opacity-30 disabled:hover:border-gray-200 transition-all uppercase tracking-wider"
                >
                  Trang trước
                </button>
                <span className="font-serif text-slate-800 font-bold">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="px-5 py-2.5 text-sm font-medium border border-gray-200 hover:border-slate-800 hover:text-slate-900 rounded-sm disabled:opacity-30 disabled:hover:border-gray-200 transition-all uppercase tracking-wider"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
