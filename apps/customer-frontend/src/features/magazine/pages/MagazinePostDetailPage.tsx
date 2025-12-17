// apps/customer-frontend/src/features/magazine/pages/MagazinePostDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // 1. Cần cài: npm install react-helmet-async
import DOMPurify from "dompurify"; // 2. Cần cài: npm install dompurify @types/dompurify

import { Header, Footer } from "@/features/landing/components";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { ScrollAnimation } from "@/shared/components/ScrollAnimation";
import {
  magazineService,
  MagazinePostDetail,
} from "@/services/magazine.service";
import { formatDate } from "../utils/magazineHelpers";
import {
  User,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CategoryCTABox } from "../components/CategoryCTABox";
import { BlockRenderer, isBlockBasedPost } from "../components/BlockRenderer";
import { CuratorBadge } from "../components/CuratorBadge";
import { Breadcrumbs } from "@/shared/components/seo/Breadcrumbs";

export default function MagazinePostDetailPage() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<MagazinePostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Smart back navigation
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/tap-chi");
  };

  useEffect(() => {
    const fetchPost = async () => {
      const identifier = slug || id;
      if (!identifier) return;
      setIsLoading(true);
      try {
        const data = await magazineService.getPostBySlug(identifier);
        setPost(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [slug, id]);

  // Xử lý Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-amber-800" />
      </div>
    );
  }

  // Xử lý Not Found
  if (!post) {
    return (
      <div className="min-h-screen bg-[#F9F8F6] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="font-serif text-3xl text-stone-900 mb-4">
            Bài viết không tồn tại
          </h1>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-amber-800 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Tạp chí
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Logic ảnh cover
  const firstImage = post.media?.find((m) => m.type === "image");
  const coverImage =
    firstImage?.url ||
    post.ogImage ||
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2000";

  // Logic render nội dung an toàn - only for legacy HTML content
  const sanitizedContent = post.content
    ? DOMPurify.sanitize(
        // Nếu content có thẻ HTML thì giữ nguyên, nếu không thì thay newline bằng <br>
        post.content.includes("<")
          ? post.content
          : post.content.replace(/\n/g, "<br />")
      )
    : "";

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* 3. Thêm SEO Metadata */}
      <Helmet>
        <title>{post.metaTitle || post.title} | Printz Magazine</title>
        <meta
          name="description"
          content={post.metaDescription || post.excerpt}
        />
        {post.ogImage && <meta property="og:image" content={post.ogImage} />}

        {/* Schema.org BlogPosting - GEO Optimized with Dual Authorship */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.ogImage || coverImage,
            datePublished: post.createdAt,
            dateModified: post.updatedAt || post.createdAt,
            // Main entity of page - canonical URL
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://printz.vn/tap-chi/bai-viet/${post.slug}`,
            },
            // Author - Tác giả ý tưởng (Nghệ nhân) - The Creator
            author: post.authorProfile
              ? {
                  "@type": "Person",
                  name: post.authorProfile.name,
                  description: post.authorProfile.bio,
                  jobTitle: post.authorProfile.title || "Nghệ nhân",
                  // Critical: Link to artisan profile page for GEO
                  ...(post.supplierCode && {
                    url: `https://printz.vn/artisans/${post.supplierCode}`,
                    sameAs: `https://printz.vn/artisans/${post.supplierCode}`,
                  }),
                }
              : {
                  "@type": "Organization",
                  name: "Printz Editorial",
                  url: "https://printz.vn",
                },
            // Editor - Người biên tập/đăng tải (Printz) - The Curator
            editor: {
              "@type": "Organization",
              name: "Ban Giám Tuyển Printz",
              url: "https://printz.vn/about-us",
            },
            // Publisher - Organization
            publisher: {
              "@type": "Organization",
              name: "Printz",
              url: "https://printz.vn",
              logo: {
                "@type": "ImageObject",
                url: "https://printz.vn/logo.png",
              },
            },
            // Câu thần chú cho Google biết đây là nội dung được kiểm chứng
            publishingPrinciples: "https://printz.vn/editorial-policy",
            // mentions - Critical for GEO: Link article to Person entities
            ...(post.authorProfile &&
              post.supplierCode && {
                mentions: {
                  "@type": "Person",
                  name: post.authorProfile.name,
                  url: `https://printz.vn/artisans/${post.supplierCode}`,
                  jobTitle: post.authorProfile.title || "Nghệ nhân",
                },
              }),
            // about - What this article is about (for AI understanding)
            about: [
              {
                "@type": "Thing",
                name: post.category,
              },
              ...(post.tags?.map((tag: string) => ({
                "@type": "Thing",
                name: tag,
              })) || []),
            ],
            // Article section (category)
            articleSection: post.category,
            // Keywords for SEO
            keywords: post.tags?.join(", ") || post.category,
            // Word count estimate (for read time)
            ...(post.readTime && {
              wordCount: post.readTime * 200, // ~200 words per minute
            }),
          })}
        </script>

        {/* Schema.org VideoObject - for YouTube videos */}
        {post.videoInfo && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              name: post.videoInfo.title || post.title,
              description: post.excerpt,
              thumbnailUrl: post.videoInfo.thumbnailUrl,
              uploadDate: post.createdAt,
              contentUrl: post.videoInfo.watchUrl,
              embedUrl: post.videoInfo.embedUrl,
              publisher: {
                "@type": "Organization",
                name: post.videoInfo.authorName || "YouTube",
              },
            })}
          </script>
        )}
      </Helmet>

      <Header />

      {/* HERO SECTION - Enhanced contrast & header-safe */}
      <section className="relative min-h-[85vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={coverImage}
            className="w-full h-full object-cover"
          />
          {/* Multi-layer overlay for guaranteed contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        </div>

        {/* Content - với padding-top để tránh header che */}
        <div className="relative h-full min-h-[85vh] flex flex-col justify-end px-4 md:px-8 pb-12 md:pb-16 pt-28">
          <div className="max-w-4xl mx-auto w-full">
            {/* Breadcrumbs - SEO optimized */}
            <div className="mb-6">
              <Breadcrumbs
                variant="dark"
                items={[
                  { label: "Tạp chí", href: "/tap-chi" },
                  ...(post.category
                    ? [
                        {
                          label: post.category,
                          href: `/tap-chi?category=${encodeURIComponent(
                            post.category
                          )}`,
                        },
                      ]
                    : []),
                  { label: post.title },
                ]}
              />
            </div>

            {/* Category & Read time */}
            <ScrollAnimation variant="fadeInUp">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-amber-700 text-white px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg">
                  {post.category}
                </span>
                {post.readTime && (
                  <span className="flex items-center gap-1.5 text-sm text-white/90 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime} phút đọc
                  </span>
                )}
              </div>
            </ScrollAnimation>

            {/* Title - với text-shadow để đảm bảo đọc được */}
            <ScrollAnimation variant="fadeInUp" delay={100}>
              <h1
                className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight font-semibold text-white"
                style={{
                  textShadow:
                    "0 2px 20px rgba(0,0,0,0.5), 0 4px 40px rgba(0,0,0,0.3)",
                }}
              >
                {post.title}
              </h1>
            </ScrollAnimation>

            {/* Excerpt */}
            <ScrollAnimation variant="fadeInUp" delay={200}>
              <p
                className="text-base md:text-lg lg:text-xl text-white/90 font-light leading-relaxed max-w-2xl line-clamp-3"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
              >
                {post.excerpt}
              </p>
            </ScrollAnimation>

            {/* Author info */}
            <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-white/80">
              {post.supplierCode ? (
                <Link
                  to={`/artisans/${post.supplierCode}`}
                  className="flex items-center gap-3 group"
                >
                  {post.authorProfile?.avatar ? (
                    <img
                      src={post.authorProfile.avatar}
                      className="w-10 h-10 shrink-0 rounded-full object-cover border-2 border-white/40 shadow-lg group-hover:border-white/60 transition-colors"
                      alt={post.authorProfile?.name || "Author"}
                    />
                  ) : (
                    <div className="w-10 h-10 shrink-0 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <User className="w-5 h-5 text-white/80" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white group-hover:underline">
                      {post.authorProfile?.name || "Printz Editorial"}
                    </p>
                    <p className="text-xs text-white/70">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  {post.authorProfile?.avatar ? (
                    <img
                      src={post.authorProfile.avatar}
                      className="w-10 h-10 shrink-0 rounded-full object-cover border-2 border-white/40 shadow-lg"
                      alt={post.authorProfile?.name || "Author"}
                    />
                  ) : (
                    <div className="w-10 h-10 shrink-0 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white/80" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {post.authorProfile?.name || "Printz Editorial"}
                    </p>
                    <p className="text-xs text-white/70">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              {/* Curator Badge - Dual Authorship indicator */}
              {post.authorProfile?.name && (
                <CuratorBadge variant="dark" size="sm" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT SECTION */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          {" "}
          {/* Thu hẹp max-w để dễ đọc hơn (Typography chuẩn) */}
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-12">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> QUAY LẠI
            </button>
            <div className="flex gap-2">
              {/* Giả lập nút share hoạt động */}
              <button
                onClick={() => alert("Đã copy link!")}
                className="p-2 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-all"
                title="Chia sẻ"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-stone-400 hover:text-amber-800 hover:bg-amber-50 rounded-full transition-all"
                title="Lưu bài"
              >
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Highlight Quote */}
          {post.highlightQuote && (
            <div className="my-10">
              <blockquote className="font-serif text-2xl md:text-3xl text-stone-800 italic text-center leading-relaxed">
                "{post.highlightQuote}"
              </blockquote>
              <div className="w-12 h-1 bg-amber-800 mx-auto mt-6 opacity-30"></div>
            </div>
          )}
          {/* YouTube Video Embed */}
          {post.videoUrl && post.videoInfo && (
            <div className="mb-12">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                <iframe
                  src={post.videoInfo.embedUrl}
                  title={post.videoInfo.title || post.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              {post.videoInfo.title && (
                <p className="mt-3 text-sm text-stone-500 text-center">
                  Video: {post.videoInfo.title}
                </p>
              )}
            </div>
          )}
          {/* Main Content - Block-based or Legacy HTML */}
          <article className="article-content">
            {isBlockBasedPost(post) && post.blocks ? (
              // New block-based content
              <BlockRenderer blocks={post.blocks} />
            ) : (
              // Legacy HTML content (Tiptap compatible)
              <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
            )}
          </article>
          {/* Styles compatible with Tiptap HTML output - using Yrsa font for headings */}
          <style>{`
            .article-content {
              font-family: Manrope, sans-serif;
              font-size: 1.125rem;
              line-height: 1.8;
              color: #44403c;
            }
            .article-content p {
              margin-bottom: 1.25rem;
            }
            .article-content h1 {
              font-family: Yrsa, serif;
              font-size: 2.25rem;
              font-weight: 700;
              color: #1c1917;
              margin-top: 2rem;
              margin-bottom: 1rem;
              line-height: 1.3;
            }
            .article-content h2 {
              font-family: Yrsa, serif;
              font-size: 1.75rem;
              font-weight: 600;
              color: #1c1917;
              margin-top: 1.75rem;
              margin-bottom: 0.75rem;
              line-height: 1.4;
            }
            .article-content h3 {
              font-family: Yrsa, serif;
              font-size: 1.5rem;
              font-weight: 600;
              color: #1c1917;
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
            }
            .article-content a {
              color: #ea580c;
              text-decoration: none;
              border-bottom: 1px dashed #ea580c;
              padding-bottom: 1px;
              transition: all 0.2s ease;
            }
            .article-content a:hover {
              color: #c2410c;
              border-bottom-style: solid;
              background-color: rgba(234, 88, 12, 0.08);
            }
            .article-content blockquote {
              font-family: Yrsa, serif;
              border-left: 4px solid #d6d3d1;
              padding-left: 1rem;
              margin: 1.5rem 0;
              font-style: italic;
              color: #57534e;
            }
            .article-content pre {
              background: #1f2937;
              color: #f3f4f6;
              padding: 1rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1.5rem 0;
              font-family: "JetBrains Mono", ui-monospace, monospace;
              font-size: 0.875rem;
            }
            .article-content code {
              background: #f5f5f4;
              padding: 0.125rem 0.375rem;
              border-radius: 0.25rem;
              font-family: "JetBrains Mono", ui-monospace, monospace;
              font-size: 0.875em;
            }
            .article-content pre code {
              background: transparent;
              padding: 0;
            }
            .article-content ul {
              list-style-type: disc;
              padding-left: 1.5rem;
              margin: 1rem 0;
            }
            .article-content ol {
              list-style-type: decimal;
              padding-left: 1.5rem;
              margin: 1rem 0;
            }
            .article-content li {
              margin-bottom: 0.5rem;
            }
            .article-content img {
              border-radius: 0.5rem;
              margin: 1.5rem auto;
              max-width: min(100%, 600px);
              height: auto;
              display: block;
            }
            .article-content strong {
              font-weight: 600;
              color: #1c1917;
            }
            .article-content em {
              font-style: italic;
            }
            .article-content u {
              text-decoration: underline;
            }
            /* Text alignment from Tiptap */
            .article-content [style*="text-align: center"] {
              text-align: center;
            }
            .article-content [style*="text-align: right"] {
              text-align: right;
            }
          `}</style>
          {/* Category CTA Box - Hiển thị CTA phù hợp với danh mục bài viết */}
          <CategoryCTABox category={post.category} />
          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="mt-16 pt-8 border-t border-stone-200">
              <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-stone-100 text-stone-600 rounded text-sm hover:bg-stone-200 cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Author Box - Show author info from authorProfile */}
          {(() => {
            const authorName = post.authorProfile?.name;
            const authorTitle = post.authorProfile?.title || "Đối tác";
            const authorAvatar = post.authorProfile?.avatar;
            const authorBio = post.authorProfile?.bio;
            const supplierCode = post.supplierCode;

            // If no author info, show default Printz Editorial
            if (!authorName) {
              return (
                <div className="mt-12 p-8 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-6">
                    <img
                      src="https://ui-avatars.com/api/?name=Printz+Editorial&background=d97706&color=fff&size=160&bold=true"
                      className="w-20 h-20 shrink-0 rounded-full object-cover shadow-sm"
                      alt="Printz Editorial"
                    />
                    <div>
                      <h3 className="font-serif text-xl font-bold text-stone-900">
                        Printz Editorial
                      </h3>
                      <p className="text-amber-700 text-sm font-medium mb-2">
                        Ban biên tập
                      </p>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        Đội ngũ biên tập viên của Printz - Nền tảng quà tặng
                        doanh nghiệp cao cấp.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Author box content
            const authorContent = (
              <div className="flex items-center gap-6">
                <img
                  src={
                    authorAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      authorName
                    )}&background=d97706&color=fff&size=160&bold=true`
                  }
                  className="w-20 h-20 shrink-0 rounded-full object-cover shadow-sm"
                  alt={authorName}
                />
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
                    {authorName}
                  </h3>
                  <p className="text-amber-700 text-sm font-medium mb-2">
                    {authorTitle}
                  </p>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {authorBio ||
                      `${authorName} - ${authorTitle} cung cấp sản phẩm chất lượng cao.`}
                  </p>
                </div>
                {supplierCode && (
                  <div className="hidden sm:flex items-center gap-1 text-amber-700 text-sm">
                    <span>Xem profile</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );

            // If has supplierCode, make it clickable
            if (supplierCode) {
              return (
                <Link
                  to={`/artisans/${supplierCode}`}
                  className="mt-12 p-8 bg-stone-50 rounded-xl block group hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  {authorContent}
                  {/* Editorial credit - Curator Badge */}
                  <div className="mt-4 pt-4 border-t border-stone-200 flex justify-center">
                    <CuratorBadge variant="light" size="md" />
                  </div>
                </Link>
              );
            }

            return (
              <div className="mt-12 p-8 bg-stone-50 rounded-xl">
                {authorContent}
                {/* Editorial credit - Curator Badge */}
                <div className="mt-4 pt-4 border-t border-stone-200 flex justify-center">
                  <CuratorBadge variant="light" size="md" />
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* RELATED PRODUCTS SECTION */}
      {post.relatedProducts && post.relatedProducts.length > 0 && (
        <section className="py-16 px-4 bg-white border-t border-stone-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-2">
                  Sản phẩm liên quan
                </h2>
                <p className="text-stone-500 text-sm">
                  Khám phá các sản phẩm được đề cập trong bài viết
                </p>
              </div>
              <Link
                to="/shop"
                className="hidden md:flex items-center gap-1 text-amber-800 hover:text-amber-900 text-sm font-medium"
              >
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {post.relatedProducts.slice(0, 4).map((product: any) => {
                // Get product image: thumbnailUrl > first image url > placeholder
                const productImage =
                  product.thumbnailUrl ||
                  product.images?.[0]?.url ||
                  "https://placehold.co/400x400?text=No+Image";

                return (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="group bg-stone-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-square overflow-hidden bg-stone-100">
                      <img
                        src={productImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-stone-900 line-clamp-2 mb-2 group-hover:text-amber-800 transition-colors">
                        {product.name}
                      </h3>
                      {product.basePrice && (
                        <p className="text-amber-800 font-semibold">
                          {product.basePrice.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile: View all link */}
            <div className="mt-6 text-center md:hidden">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 text-sm font-medium"
              >
                Xem tất cả sản phẩm <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* RELATED POSTS SECTION */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="py-16 px-4 bg-[#F9F8F6]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-2">
                  Bài viết liên quan
                </h2>
                <p className="text-stone-500 text-sm">
                  Đọc thêm các bài viết cùng chủ đề
                </p>
              </div>
              <Link
                to="/tap-chi"
                className="hidden md:flex items-center gap-1 text-amber-800 hover:text-amber-900 text-sm font-medium"
              >
                Xem tất cả <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {post.relatedPosts.slice(0, 3).map((relatedPost: any) => {
                // Get image: ogImage > first media image > placeholder
                const postImage =
                  relatedPost.ogImage ||
                  relatedPost.media?.find((m: any) => m.type === "image")
                    ?.url ||
                  "https://placehold.co/800x500?text=No+Image";

                return (
                  <Link
                    key={relatedPost._id}
                    to={`/tap-chi/bai-viet/${relatedPost.slug}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                      <img
                        src={postImage}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      {relatedPost.category && (
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 block">
                          {relatedPost.category}
                        </span>
                      )}
                      <h3 className="font-serif text-lg font-semibold text-stone-900 line-clamp-2 mb-2 group-hover:text-amber-800 transition-colors">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-stone-500 text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Mobile: View all link */}
            <div className="mt-6 text-center md:hidden">
              <Link
                to="/tap-chi"
                className="inline-flex items-center gap-1 text-amber-800 hover:text-amber-900 text-sm font-medium"
              >
                Xem tất cả bài viết <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
