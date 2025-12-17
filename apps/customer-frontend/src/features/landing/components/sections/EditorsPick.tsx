import { ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useFeaturedPosts } from "../../hooks/useFeaturedPosts";

export function EditorsPick() {
  const { posts, isLoading } = useFeaturedPosts();

  if (isLoading) {
    return (
      <section id="editors-pick" className="py-24 bg-[#F9F8F6] px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-stone-400">Đang tải bài viết...</div>
          </div>
        </div>
      </section>
    );
  }

  // If no posts, show placeholder message instead of hiding section
  if (posts.length === 0) {
    return (
      <section id="editors-pick" className="py-24 bg-[#F9F8F6] px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-stone-200 pb-6">
            <div>
              <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber-800 uppercase mb-2 block">
                Curator's Choice
              </span>
              <h2 className="font-serif text-4xl text-stone-900 italic">
                Tiêu điểm Giám tuyển
              </h2>
            </div>
          </div>
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg">
              Các bài viết đang được chuẩn bị. Vui lòng quay lại sau.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const [featuredPost, ...smallPosts] = posts;

  return (
    <section id="editors-pick" className="py-24 bg-[#F9F8F6] px-6">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="flex items-end justify-between mb-12 border-b border-stone-200 pb-6">
          <div>
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber-800 uppercase mb-2 block">
              Curator's Choice
            </span>
            <h2 className="font-serif text-4xl text-stone-900 italic">
              Tiêu điểm Giám tuyển
            </h2>
          </div>
          <Link
            to="/tap-chi"
            className="hidden md:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 transition-colors"
          >
            Xem tất cả bài viết <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* MAGAZINE GRID: 1 TO - 2 NHỎ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* BÀI TO (FEATURED) */}
          <Link
            to={`/tap-chi/${featuredPost.slug}`}
            className="lg:col-span-8 group relative overflow-hidden block h-[500px] lg:h-[600px]"
          >
            <div className="absolute inset-0 bg-stone-900/20 group-hover:bg-stone-900/10 transition-colors z-10" />
            <img
              src={
                featuredPost.media?.[0]?.url ||
                featuredPost.ogImage ||
                "https://images.unsplash.com/photo-1590422749842-4522a446549a?q=80&w=2000&auto=format&fit=crop"
              }
              alt={featuredPost.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 max-w-3xl">
              <span className="bg-amber-800 text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest mb-4 inline-block">
                {featuredPost.category}
                {featuredPost.subcategory && ` / ${featuredPost.subcategory}`}
              </span>
              <h3 className="font-serif text-3xl md:text-5xl text-white mb-4 leading-tight group-hover:underline decoration-1 underline-offset-4">
                {featuredPost.title}
              </h3>
              <p className="text-stone-200 text-lg font-light line-clamp-2 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                {featuredPost.excerpt}
              </p>
              <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Đọc ngay <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* 2 BÀI NHỎ (SIDEBAR) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {smallPosts.length > 0 ? (
              <>
                {/* Bài nhỏ 1 */}
                {smallPosts[0] && (
                  <Link
                    to={`/tap-chi/${smallPosts[0].slug}`}
                    className="group flex-1 relative overflow-hidden block min-h-[280px]"
                  >
                    <img
                      src={
                        smallPosts[0].media?.[0]?.url ||
                        smallPosts[0].ogImage ||
                        "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={smallPosts[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 hover:bg-stone-900/30 transition-colors p-8 flex flex-col justify-end">
                      <span className="text-stone-300 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {smallPosts[0].readTime || 5} phút đọc
                      </span>
                      <h4 className="font-serif text-2xl text-white group-hover:text-amber-200 transition-colors">
                        {smallPosts[0].title}
                      </h4>
                    </div>
                  </Link>
                )}

                {/* Bài nhỏ 2 */}
                {smallPosts[1] ? (
                  <Link
                    to={`/tap-chi/${smallPosts[1].slug}`}
                    className="group flex-1 relative overflow-hidden block min-h-[280px]"
                  >
                    <img
                      src={
                        smallPosts[1].media?.[0]?.url ||
                        smallPosts[1].ogImage ||
                        "https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={smallPosts[1].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-stone-900/40 hover:bg-stone-900/30 transition-colors p-8 flex flex-col justify-end">
                      <span className="text-stone-300 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {smallPosts[1].readTime || 5} phút đọc
                      </span>
                      <h4 className="font-serif text-2xl text-white group-hover:text-amber-200 transition-colors">
                        {smallPosts[1].title}
                      </h4>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/contact"
                    className="group flex-1 relative bg-stone-900 block p-8 border border-stone-800 hover:border-amber-800 transition-colors flex flex-col justify-center"
                  >
                    <div className="mb-4 text-amber-600">
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="opacity-80"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <h4 className="font-serif text-2xl text-white mb-3 group-hover:text-amber-500 transition-colors">
                      Quy trình "Đóng gói Cảm xúc"
                    </h4>
                    <p className="text-stone-400 text-sm leading-relaxed mb-6">
                      Khám phá cách chúng tôi đóng gói một set quà ngoại giao:
                      Từ hộp sơn mài, thư tay đến tem niêm phong độc bản.
                    </p>
                    <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                      Liên hệ <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400">
                Chưa có bài viết nổi bật
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
