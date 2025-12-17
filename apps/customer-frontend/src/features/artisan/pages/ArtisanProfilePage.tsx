// apps/customer-frontend/src/features/artisan/pages/ArtisanProfilePage.tsx
// Redesigned for High-End Curator Strategy with SEO Optimization

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  MapPin,
  Award,
  Package,
  FileText,
  Loader2,
  CheckCircle,
  Quote,
  ShieldCheck,
  Gem,
  Clock,
  MessageCircle,
  Newspaper,
  ExternalLink,
} from "lucide-react";
import {
  artisanService,
  Artisan,
  ArtisanPost,
  ArtisanProduct,
} from "@/services/artisan.service";
import { Header, Footer } from "@/features/landing/components";
import { Breadcrumbs } from "@/shared/components/seo/Breadcrumbs";
import { CuratorBadge } from "@/features/magazine/components/CuratorBadge";

// Brand name for SEO
const BRAND_NAME = "Printz";
const SITE_URL = import.meta.env.VITE_SITE_URL || "https://printz.vn";

// MAPPING LẠI TÊN GỌI CHO SANG TRỌNG HƠN
const TYPE_LABELS: Record<string, string> = {
  manufacturer: "Xưởng chế tác",
  distributor: "Nhà sưu tầm",
  artisan: "Nghệ nhân ưu tú",
  master: "Nghệ nhân nhân dân",
  printer: "Nhà in nghệ thuật",
  dropshipper: "Đối tác phân phối",
};

// SEO-friendly type labels for meta description
const TYPE_SEO_LABELS: Record<string, string> = {
  manufacturer: "Master Craftsman",
  distributor: "Certified Collector",
  artisan: "Master Artisan",
  master: "National Heritage Artisan",
  printer: "Fine Art Printer",
  dropshipper: "Authorized Distributor",
};

type TabType = "story" | "collection" | "journal";

/**
 * Helper: Get the best image for social sharing
 * Priority: Artisan avatar > Cover image > Product image > Default
 */
function getBestShareImage(
  artisan: Artisan | null,
  products: ArtisanProduct[]
): string {
  // Priority 1: Artisan avatar
  if (artisan?.profile?.avatar) {
    const avatar = artisan.profile.avatar;
    if (avatar.startsWith("http")) return avatar;
    return `${SITE_URL}${avatar}`;
  }

  // Priority 2: Cover image
  if (artisan?.profile?.coverImage) {
    const cover = artisan.profile.coverImage;
    if (cover.startsWith("http")) return cover;
    return `${SITE_URL}${cover}`;
  }

  // Priority 3: First product with image
  const productWithImage = products.find(
    (p) => p.thumbnailUrl || p.images?.[0]?.url
  );
  if (productWithImage) {
    const imageUrl =
      productWithImage.thumbnailUrl || productWithImage.images?.[0]?.url;
    if (imageUrl?.startsWith("http")) return imageUrl;
    if (imageUrl) return `${SITE_URL}${imageUrl}`;
  }

  // Priority 4: Default branded image
  return `${SITE_URL}/images/artisan-default-og.jpg`;
}

/**
 * Generate compelling meta description (AIDA model)
 * Max 160 characters for optimal SEO
 */
function generateMetaDescription(
  artisan: Artisan,
  productsCount: number
): string {
  const typeLabel = TYPE_SEO_LABELS[artisan.type] || "Artisan";
  const location = artisan.contactInfo.city || "Vietnam";

  // AIDA: Attention + Interest + Desire + Action
  return `Exclusive collection by ${artisan.name}, ${typeLabel} from ${location}. ${productsCount}+ hand-selected masterpieces with Certificate of Authenticity (COA). Shop now.`;
}

/**
 * Generate SEO-optimized page title
 */
function generatePageTitle(artisan: Artisan): string {
  const mainCapability =
    artisan.capabilities?.[0] || TYPE_LABELS[artisan.type] || "Nghệ nhân";
  return `${artisan.name} - ${mainCapability} | ${BRAND_NAME}`;
}

export default function ArtisanProfilePage() {
  const { code } = useParams<{ code: string }>();
  const [artisan, setArtisan] = useState<Artisan | null>(null);
  const [posts, setPosts] = useState<ArtisanPost[]>([]);
  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("collection");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (code) fetchArtisanData();
  }, [code]);

  const fetchArtisanData = async () => {
    if (!code) return;
    setIsLoading(true);
    try {
      const [artisanData, postsData, productsData] = await Promise.all([
        artisanService.getArtisanByCode(code),
        artisanService.getArtisanPosts(code, { limit: 5 }),
        artisanService.getArtisanProducts(code, { limit: 12 }),
      ]);
      setArtisan(artisanData);
      setPosts(postsData.posts);
      setProducts(productsData.products);
    } catch (err: any) {
      setError("Không thể tải thông tin nghệ nhân");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-800" />
      </div>
    );
  }

  // Error state - don't render Helmet without data
  if (error || !artisan) return null;

  // SEO Metadata
  const pageTitle = generatePageTitle(artisan);
  const pageDescription = generateMetaDescription(artisan, products.length);
  const shareImage = getBestShareImage(artisan, products);
  const canonicalUrl = `${SITE_URL}/artisans/${code}`;

  // Build social links array for sameAs
  const socialLinks: string[] = [];
  if (artisan.profile?.socialLinks?.facebook)
    socialLinks.push(artisan.profile.socialLinks.facebook);
  if (artisan.profile?.socialLinks?.instagram)
    socialLinks.push(artisan.profile.socialLinks.instagram);
  if (artisan.profile?.socialLinks?.youtube)
    socialLinks.push(artisan.profile.socialLinks.youtube);
  if (artisan.profile?.socialLinks?.website)
    socialLinks.push(artisan.profile.socialLinks.website);

  // Determine entity type: Organization for manufacturers, Person for artisans
  const isOrganization = artisan.type === "manufacturer";

  // JSON-LD Structured Data (SEO/GEO optimized)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": isOrganization ? "Organization" : "Person",
    name: artisan.name,
    // jobTitle only for Person
    ...(!isOrganization && {
      jobTitle: TYPE_SEO_LABELS[artisan.type] || "Artisan",
    }),
    description:
      artisan.profile?.bio ||
      `${artisan.name} - ${
        TYPE_LABELS[artisan.type] || "Nghệ nhân"
      } chuyên về ${
        artisan.capabilities?.join(", ") || "thủ công mỹ nghệ"
      }. Tác phẩm được giám tuyển và chứng nhận bởi ${BRAND_NAME}.`,
    image: shareImage,
    url: canonicalUrl,
    // Address for local SEO
    ...(artisan.contactInfo.city && {
      address: {
        "@type": "PostalAddress",
        addressLocality: artisan.contactInfo.city,
        addressCountry: artisan.contactInfo.country || "VN",
      },
    }),
    // Social links
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
    // Affiliation with Printz
    ...(isOrganization
      ? {
          parentOrganization: {
            "@type": "Organization",
            name: BRAND_NAME,
            url: SITE_URL,
          },
        }
      : {
          worksFor: {
            "@type": "Organization",
            name: BRAND_NAME,
            url: SITE_URL,
          },
        }),
    // knowsAbout - Critical for GEO/AI understanding
    knowsAbout:
      artisan.capabilities?.map((cap) => ({
        "@type": "Thing",
        name: cap,
      })) || [],
    // Aggregate rating
    ...(artisan.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: artisan.rating,
        bestRating: 5,
        worstRating: 0,
      },
    }),
    // Awards/Achievements
    ...(artisan.isPreferred && {
      award: "Verified Artisan Partner by Printz",
    }),
    // Years of experience
    ...(artisan.profile?.yearsOfExperience && {
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Experience",
        name: `${artisan.profile.yearsOfExperience}+ năm kinh nghiệm`,
      },
    }),
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] font-sans text-slate-800">
      {/* SEO & Social Sharing Metadata */}
      <Helmet>
        {/* Basic Meta */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph (Facebook, Zalo, LinkedIn) */}
        <meta property="og:type" content="profile" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content={BRAND_NAME} />
        <meta property="og:locale" content="vi_VN" />
        <meta property="profile:username" content={artisan.code} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={shareImage} />
        <meta name="twitter:site" content="@printz_vn" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content={artisan.name} />
        <meta
          name="keywords"
          content={`${artisan.name}, ${artisan.capabilities?.join(
            ", "
          )}, nghệ nhân, thủ công mỹ nghệ, quà tặng cao cấp, ${BRAND_NAME}`}
        />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      <Header />

      {/* 1. HERO SECTION: DARK & MOODY */}
      <div className="relative bg-slate-900 text-white">
        {/* Cover Image - from API or default */}
        {artisan.profile?.coverImage ? (
          <img
            src={artisan.profile.coverImage}
            alt={`${artisan.name} cover`}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            loading="lazy"
            width={1920}
            height={600}
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=2449&auto=format&fit=crop&fm=webp')`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

        {/* Breadcrumbs */}
        <div className="relative max-w-6xl mx-auto px-4 pt-24 sm:pt-28">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Nghệ nhân", href: "/artisans" },
              { label: artisan.name },
            ]}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-6 pb-12 sm:pt-8 sm:pb-16 flex flex-col md:flex-row items-end gap-8">
          {/* Avatar */}
          <div className="shrink-0 relative">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl bg-gradient-to-br from-amber-700 to-amber-900 p-1 shadow-2xl ring-1 ring-white/20">
              <div className="w-full h-full rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                {artisan.profile?.avatar ? (
                  <img
                    src={artisan.profile.avatar}
                    alt={artisan.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl font-serif font-bold text-amber-500/80">
                    {artisan.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            {/* Verified Badge */}
            {artisan.isPreferred && (
              <div className="absolute -bottom-3 -right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-slate-900 flex items-center gap-1">
                <Gem className="w-3 h-3" />
                Verified Artisan
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3 pb-2">
            <div className="flex items-center gap-3 text-amber-500 text-sm font-medium tracking-wider uppercase">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />{" "}
                {artisan.contactInfo.city || "Làng nghề truyền thống"}
              </span>
              <span className="w-1 h-1 bg-amber-500 rounded-full" />
              <span>{TYPE_LABELS[artisan.type] || "Nghệ nhân"}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
              {artisan.name}
            </h1>

            {/* Quote - from API or default */}
            {(artisan.profile?.quote || artisan.profile?.bio) && (
              <p className="text-slate-300 max-w-2xl text-lg font-light italic">
                "{artisan.profile.quote || artisan.profile.bio}"
              </p>
            )}

            {/* Capabilities Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {artisan.capabilities?.map((cap) => (
                <span
                  key={cap}
                  className="px-3 py-1 bg-white/10 backdrop-blur border border-white/10 rounded-full text-xs text-slate-200"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-8 relative z-10">
        {/* 2. MAIN CONTENT (Left) */}
        <div className="lg:col-span-8 space-y-8">
          {/* CURATOR'S NOTE - Only show if curatorNote exists */}
          {artisan.profile?.curatorNote && (
            <div className="bg-white rounded-sm shadow-sm border-t-4 border-amber-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Quote className="w-24 h-24" />
              </div>
              <h3 className="text-amber-800 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                <Award className="w-4 h-4" /> Góc nhìn Giám tuyển
              </h3>
              <div className="font-serif text-xl text-slate-800 leading-relaxed mb-4">
                "{artisan.profile.curatorNote}"
              </div>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Ban Giám Tuyển
                  </p>
                  <p className="text-xs text-slate-500">
                    Verified by {BRAND_NAME} Team
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TABS NAVIGATION */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8">
              {[
                {
                  id: "collection",
                  label: "Bộ Sưu Tập Độc Quyền",
                  icon: Package,
                },
                { id: "story", label: "Câu Chuyện Nghệ Nhân", icon: FileText },
                { id: "journal", label: "Nhật Ký Chế Tác", icon: Clock },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`pb-4 pt-2 text-sm font-medium uppercase tracking-wider flex items-center gap-2 transition-all ${
                      isActive
                        ? "border-b-2 border-amber-800 text-amber-800"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TAB CONTENTS */}
          <div className="min-h-[400px]">
            {activeTab === "collection" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product.slug}`}
                    className="group block"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-gray-200 rounded-sm relative mb-3">
                      {product.thumbnailUrl ? (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium uppercase">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                    <h4 className="font-serif text-lg text-slate-900 leading-snug group-hover:text-amber-800 transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-amber-700 font-bold mt-1">
                      {formatPrice(product.basePrice)}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === "story" && (
              <div className="prose prose-slate max-w-none">
                {artisan.profile?.story ? (
                  <>
                    <div
                      className="text-lg text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: artisan.profile.story.replace(/\n/g, "<br/>"),
                      }}
                    />
                    {artisan.profile?.quote && (
                      <div className="bg-slate-50 p-6 rounded-lg my-6 border-l-4 border-amber-600 italic text-slate-600">
                        "{artisan.profile.quote}" - {artisan.name}
                      </div>
                    )}
                    {/* Achievements */}
                    {artisan.profile?.achievements &&
                      artisan.profile.achievements.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            Thành tựu & Giải thưởng
                          </h3>
                          <ul className="space-y-2">
                            {artisan.profile.achievements.map(
                              (achievement, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-slate-600"
                                >
                                  <CheckCircle className="w-4 h-4 text-amber-600 mt-1 shrink-0" />
                                  {achievement}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                      Câu chuyện nghệ nhân đang được cập nhật...
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "journal" && (
              <div className="space-y-6">
                {posts.map((post) => {
                  // Get best image: ogImage > first media image > null
                  const postImage =
                    post.ogImage ||
                    post.media?.find((m) => m.type === "image")?.url;

                  return (
                    <Link
                      key={post._id}
                      to={`/tap-chi/bai-viet/${post.slug}`}
                      className="flex gap-4 group cursor-pointer"
                    >
                      <div className="w-24 h-24 shrink-0 bg-gray-200 overflow-hidden rounded-md">
                        {postImage ? (
                          <img
                            src={postImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FileText className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-amber-600 font-bold uppercase mb-1">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                        <h4 className="font-serif text-lg font-bold group-hover:text-amber-800 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {post.excerpt}
                        </p>
                      </div>
                    </Link>
                  );
                })}
                {posts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có bài viết nào
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. SIDEBAR (Right) - TRUST & EXCLUSIVITY */}
        <div className="lg:col-span-4 space-y-6">
          {/* CURATOR BADGE - Biên tập bởi Printz */}
          <div className="flex justify-center">
            <CuratorBadge variant="light" size="md" />
          </div>

          {/* COA - CERTIFICATE CARD */}
          <div className="bg-white p-6 shadow-sm border border-amber-100 rounded-sm text-center">
            <ShieldCheck className="w-12 h-12 text-amber-700 mx-auto mb-3" />
            <h4 className="font-serif font-bold text-lg text-slate-900">
              Chứng Nhận Độc Bản
            </h4>
            <p className="text-sm text-slate-500 mt-2 mb-4">
              Mọi tác phẩm từ {artisan.name} được phân phối bởi chúng tôi đều đi
              kèm <strong>Giấy Chứng Nhận (COA)</strong> có chữ ký kép.
            </p>
            <div className="text-xs bg-amber-50 text-amber-900 py-2 px-3 rounded inline-block font-medium">
              Bảo hành trọn đời nguồn gốc
            </div>
          </div>

          {/* WHY US CARD */}
          <div className="bg-slate-900 text-white p-6 rounded-sm shadow-lg">
            <h4 className="font-bold mb-4 border-b border-white/20 pb-2">
              Đặc Quyền Giám Tuyển
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>Kiểm định 3 lớp:</strong> Loại bỏ hoàn toàn hàng lỗi,
                  hàng non tuổi.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>Đóng gói bảo tàng:</strong> Hộp lụa, chống sốc tiêu
                  chuẩn xuất khẩu.
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong>Bảo hiểm vận chuyển:</strong> Đền bù 100% nếu nứt vỡ
                  khi giao hàng.
                </span>
              </li>
            </ul>
            <Link
              to="/lien-he"
              className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3 font-medium transition-colors rounded-sm uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Kết nối với {artisan.name.split(" ").pop()}
            </Link>
          </div>

          {/* FEATURED IN - Được trích dẫn trên báo chí (Reciprocal Trust) */}
          {posts.length > 0 && (
            <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Newspaper className="w-4 h-4 text-amber-700" />
                Được trích dẫn trên
              </h4>
              <div className="space-y-3">
                {posts.slice(0, 3).map((post) => {
                  // Get best image: ogImage > first media image > null
                  const postImage =
                    post.ogImage ||
                    post.media?.find((m) => m.type === "image")?.url;

                  return (
                    <Link
                      key={post._id}
                      to={`/tap-chi/bai-viet/${post.slug}`}
                      className="group flex items-start gap-3 p-2 -mx-2 rounded hover:bg-amber-50 transition-colors"
                    >
                      {postImage ? (
                        <img
                          src={postImage}
                          alt={post.title}
                          className="w-12 h-12 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-700 font-medium mb-0.5">
                          {BRAND_NAME} Magazine
                        </p>
                        <h5 className="text-sm font-medium text-slate-800 line-clamp-2 group-hover:text-amber-800 transition-colors">
                          {post.title}
                        </h5>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 shrink-0 mt-1" />
                    </Link>
                  );
                })}
              </div>
              {posts.length > 3 && (
                <button
                  onClick={() => setActiveTab("journal")}
                  className="w-full mt-3 pt-3 border-t border-gray-100 text-xs text-amber-700 hover:text-amber-800 font-medium"
                >
                  Xem tất cả {posts.length} bài viết →
                </button>
              )}
            </div>
          )}

          {/* STATS MINI */}
          <div className="bg-white p-4 rounded-sm shadow-sm flex justify-between text-center divide-x">
            <div className="px-2 flex-1">
              <div className="text-xl font-bold text-slate-900">
                {artisan.rating.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Điểm tín nhiệm</div>
            </div>
            <div className="px-2 flex-1">
              <div className="text-xl font-bold text-slate-900">
                {products.length}+
              </div>
              <div className="text-xs text-gray-500">Kiệt tác</div>
            </div>
            <div className="px-2 flex-1">
              <div className="text-xl font-bold text-slate-900">
                {artisan.profile?.yearsOfExperience || "10"}+
              </div>
              <div className="text-xs text-gray-500">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
