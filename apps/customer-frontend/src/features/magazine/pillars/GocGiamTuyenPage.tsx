// apps/customer-frontend/src/features/magazine/pillars/GocGiamTuyenPage.tsx
import { Link } from "react-router-dom";
import { Header, Footer } from "@/features/landing/components";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Button } from "@/shared/components/ui/button";
import { ScrollAnimation } from "@/shared/components/ScrollAnimation";
import { useMagazinePosts } from "../hooks/useMagazinePosts";
import { getMagazinePostUrl } from "../utils/magazineHelpers";
import {
  User,
  ArrowUpRight,
  Calendar,
  Tag,
  ChevronLeft,
  Loader2,
  BookOpen,
  Compass,
  Heart,
} from "lucide-react";

export default function GocGiamTuyenPage() {
  const {
    posts,
    featuredPosts: rawFeatured,
    isLoading,
  } = useMagazinePosts("goc-giam-tuyen");

  const evergreenContent = {
    title: "Góc Giám Tuyển",
    subtitle: "Curator's Notes",
    intro: `Mỗi sản phẩm trong bộ sưu tập của Printz không chỉ đơn thuần là một món đồ đẹp. Đằng sau mỗi lựa chọn là cả một hành trình dài - từ những chuyến đi đến làng nghề xa xôi, những cuộc trò chuyện sâu đêm với nghệ nhân, đến những quyết định khó khăn về việc sản phẩm nào xứng đáng được đưa vào bộ sưu tập.

Là người giám tuyển, tôi không chỉ tìm kiếm vẻ đẹp bề ngoài. Tôi tìm kiếm câu chuyện, tâm hồn và giá trị văn hóa ẩn sau mỗi sản phẩm. Một chiếc hộp sơn mài Hạ Thái với 15 lớp sơn được đánh bóng trong 3 tháng, một bình gốm Bát Tràng với vân men hỏa biến độc nhất vô nhị, hay một cây trầm hương Khánh Hòa phải chờ 50 năm mới cho hương - tất cả đều mang trong mình một phần linh hồn của người làm ra nó.

Trong "Góc Giám Tuyển", tôi chia sẻ những nhật ký hành trình, những suy nghĩ và cảm xúc khi gặp gỡ các nghệ nhân, cũng như triết lý đằng sau mỗi quyết định chọn lọc. Đây không chỉ là blog về sản phẩm, mà là câu chuyện về con người, văn hóa và niềm đam mê bảo tồn di sản.`,
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=2000",
  };

  const curatorHighlights = [
    {
      icon: Compass,
      title: "Hành trình khám phá",
      description: "Những chuyến đi đến làng nghề và gặp gỡ nghệ nhân",
    },
    {
      icon: Heart,
      title: "Tâm huyết chọn lọc",
      description: "Tiêu chí nghiêm ngặt để chọn sản phẩm vào bộ sưu tập",
    },
    {
      icon: BookOpen,
      title: "Câu chuyện đằng sau",
      description: "Ý nghĩa văn hóa và giá trị tinh thần của mỗi món đồ",
    },
  ];

  const convertToLocalBlogPost = (post: any) => {
    const firstImage = post.media?.find((m: any) => m.type === "image");
    return {
      id: post.slug || post._id,
      slug: post.slug, // Required for getMagazinePostUrl
      _id: post._id, // Fallback for getMagazinePostUrl
      title: post.title || post.content.split("\n")[0].replace(/^#\s*/, ""),
      excerpt:
        post.excerpt ||
        post.content.split("\n").filter((l: string) => l.trim())[1] ||
        "",
      image:
        firstImage?.url ||
        "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=800",
      author: post.createdBy?.displayName || "Admin",
      date: post.createdAt,
      readTime: post.readTime
        ? `${post.readTime} phút đọc`
        : `${Math.ceil(post.content.length / 1000)} phút đọc`,
      tags: post.tags || [],
      featured: post.featured || false,
    };
  };

  const blogPosts = posts.map(convertToLocalBlogPost);
  const featuredPosts = rawFeatured.map(convertToLocalBlogPost);
  const regularPosts = blogPosts.filter((p) => !p.featured);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO SECTION */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={evergreenContent.image}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 via-stone-900/40 to-stone-900/70" />
        </div>

        <div className="relative h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <ScrollAnimation variant="fadeInDown">
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1 border border-black/5 mb-8 shadow-sm">
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-stone-900">
                  {evergreenContent.subtitle}
                </span>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeInUp" delay={200}>
              <h1 className="font-serif text-6xl md:text-7xl mb-6 italic">
                {evergreenContent.title}
              </h1>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeInUp" delay={400}>
              <Link to="/tap-chi">
                <button className="inline-flex items-center gap-2 px-6 py-3 border border-white text-white hover:bg-white/10 backdrop-blur-sm rounded-sm transition-all duration-300 font-medium">
                  <ChevronLeft className="w-4 h-4" />
                  Quay lại Tạp chí
                </button>
              </Link>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* EVERGREEN CONTENT */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="bg-white p-12 shadow-xl border border-stone-200">
              <div className="prose prose-lg max-w-none">
                {evergreenContent.intro
                  .split("\n\n")
                  .map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-stone-700 leading-relaxed mb-6 text-lg"
                    >
                      {paragraph}
                    </p>
                  ))}
              </div>

              <div className="mt-8 pt-8 border-t border-stone-200">
                <p className="text-stone-500 italic text-center">
                  "Mỗi sản phẩm là một câu chuyện, mỗi câu chuyện là một phần di
                  sản."
                </p>
              </div>
            </div>
          </ScrollAnimation>

          {/* Curator Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {curatorHighlights.map((highlight, index) => (
              <ScrollAnimation
                key={index}
                variant="scaleIn"
                delay={index * 100}
              >
                <div className="bg-stone-50 p-8 border border-stone-200">
                  <div className="w-14 h-14 bg-amber-800 flex items-center justify-center mb-4 border border-amber-700">
                    <highlight.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-serif text-xl text-stone-900 mb-2 italic">
                    {highlight.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* BÀI ĐĂNG NỔI BẬT */}
      {!isLoading && featuredPosts.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollAnimation variant="fadeInUp">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
                  Nhật Ký Nổi Bật
                </h2>
                <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                  Những câu chuyện đặc biệt từ hành trình giám tuyển.
                </p>
              </div>
            </ScrollAnimation>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <ScrollAnimation
                  key={post.id}
                  variant="fadeInUp"
                  delay={index * 100}
                >
                  <Link to={getMagazinePostUrl(post)}>
                    <article className="bg-white shadow-lg border border-stone-200 overflow-hidden group hover:shadow-2xl hover:border-amber-700 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-64 overflow-hidden">
                        <ImageWithFallback
                          src={post.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-amber-800 px-4 py-1.5 text-[10px] font-bold text-white tracking-widest uppercase border border-amber-700">
                            Nổi bật
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-stone-400 text-xs mb-3">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>

                        <h3 className="font-serif text-xl text-stone-900 leading-tight mb-3 group-hover:text-amber-800 transition-colors italic flex-1">
                          {post.title}
                        </h3>

                        <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-2 text-stone-500 text-xs">
                            <User className="w-3 h-3" />
                            {post.author}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-amber-800 font-medium hover:text-amber-900"
                          >
                            Đọc <ArrowUpRight className="ml-1 w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NHẬT KÝ GIÁM TUYỂN */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
                Nhật Ký Giám Tuyển
              </h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                Những câu chuyện từ hành trình tìm kiếm và chọn lọc sản phẩm.
              </p>
            </div>
          </ScrollAnimation>

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-amber-800" />
            </div>
          )}

          {!isLoading && regularPosts.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post, index) => (
                <ScrollAnimation
                  key={post.id}
                  variant="fadeInUp"
                  delay={index * 100}
                >
                  <Link to={getMagazinePostUrl(post)}>
                    <article className="bg-white shadow-lg border border-stone-200 overflow-hidden group hover:shadow-xl hover:border-amber-700/60 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden">
                        <ImageWithFallback
                          src={post.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-amber-800 px-4 py-1.5 text-[10px] font-bold text-white tracking-widest uppercase border border-amber-700">
                            Giám Tuyển
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-stone-400 text-xs mb-3">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>

                        <h3 className="font-serif text-xl text-stone-900 leading-tight mb-3 group-hover:text-amber-800 transition-colors italic flex-1">
                          {post.title}
                        </h3>

                        <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                          <div className="flex items-center gap-2 text-stone-500 text-xs">
                            <User className="w-3 h-3" />
                            {post.author}
                            <span className="mx-1">•</span>
                            {post.readTime}
                          </div>
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 text-amber-800 font-medium hover:text-amber-900"
                          >
                            Đọc <ArrowUpRight className="ml-1 w-3 h-3" />
                          </Button>
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {post.tags
                              .slice(0, 3)
                              .map((tag: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 bg-stone-50 text-stone-600 px-2.5 py-1 text-xs border border-stone-200"
                                >
                                  <Tag className="w-3 h-3" />
                                  {tag}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          )}

          {!isLoading && blogPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-stone-100 flex items-center justify-center mx-auto mb-6 border border-stone-200">
                <User className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3 italic">
                Đang cập nhật nội dung
              </h3>
              <p className="text-stone-600">
                Các nhật ký giám tuyển sẽ sớm được bổ sung.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
