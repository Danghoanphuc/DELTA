// apps/customer-frontend/src/features/magazine/ngu-hanh/ThuyPage.tsx
import { Link } from "react-router-dom";
import { Header, Footer } from "@/features/landing/components";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Button } from "@/shared/components/ui/button";
import { ScrollAnimation } from "@/shared/components/ScrollAnimation";
import { useMagazinePosts } from "../hooks/useMagazinePosts";
import {
  convertToBlogPost,
  formatDate,
  getMagazinePostUrl,
} from "../utils/magazineHelpers";
import {
  Droplet,
  ArrowUpRight,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  Loader2,
} from "lucide-react";

export default function ThuyPage() {
  const {
    posts: rawPosts,
    featuredPosts: rawFeatured,
    isLoading,
  } = useMagazinePosts("ngu-hanh-thuy");

  // Convert to BlogPost format
  const posts = rawPosts.map(convertToBlogPost);
  const featuredPosts = rawFeatured.map(convertToBlogPost);
  const regularPosts = posts.filter((p) => !p.featured);

  const evergreenContent = {
    title: "Thủy - Lụa & Vải",
    subtitle: "Mềm mại uyển chuyển, duyên dáng phương Đông",
    intro: `Thủy - hành đại diện cho sự mềm mại, linh hoạt và uyển chuyển. Lụa và vải là những sản phẩm thể hiện hoàn hảo tinh thần của Thủy - mềm mại nhưng bền bỉ, thanh lịch nhưng thực dụng.

Từ lụa tơ tằm Vạn Phúc truyền thống đến vải thổ cẩm của các dân tộc thiểu số, mỗi sợi vải đều mang trong mình câu chuyện về nghề dệt thủ công và bàn tay khéo léo của người phụ nữ Việt Nam.

Tặng lụa và vải là tặng đi sự mềm mại, duyên dáng và tinh tế - những phẩm chất của người phụ nữ phương Đông.`,
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000",
    element: {
      name: "Thủy",
      color: "blue",
      meaning: "Mềm mại, linh hoạt, uyển chuyển",
      season: "Đông",
      direction: "Bắc",
      characteristics: ["Thanh lịch", "Mềm mại", "Tinh tế", "Duyên dáng"],
    },
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={evergreenContent.image}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 via-blue-900/50 to-blue-900/80" />
        </div>

        <div className="relative h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <ScrollAnimation variant="fadeInDown">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 px-6 py-3 rounded-full mb-6">
                <Droplet className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Ngũ Hành - {evergreenContent.element.name}
                </span>
              </div>
            </ScrollAnimation>

            <ScrollAnimation variant="fadeInUp" delay={200}>
              <h1 className="font-serif text-6xl md:text-7xl mb-4 italic">
                {evergreenContent.title}
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light">
                {evergreenContent.subtitle}
              </p>
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

      <section className="py-12 px-4 bg-gradient-to-br from-blue-50 to-stone-50">
        <div className="max-w-6xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200/50 text-center">
                <p className="text-blue-600 text-sm mb-2">Ý nghĩa</p>
                <p className="text-stone-900 font-semibold">
                  {evergreenContent.element.meaning}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200/50 text-center">
                <p className="text-blue-600 text-sm mb-2">Mùa</p>
                <p className="text-stone-900 font-semibold">
                  {evergreenContent.element.season}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200/50 text-center">
                <p className="text-blue-600 text-sm mb-2">Hướng</p>
                <p className="text-stone-900 font-semibold">
                  {evergreenContent.element.direction}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border-2 border-blue-200/50 text-center">
                <p className="text-blue-600 text-sm mb-2">Đặc tính</p>
                <p className="text-stone-900 font-semibold">
                  {evergreenContent.element.characteristics.join(", ")}
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="bg-white rounded-3xl p-12 shadow-xl border-2 border-stone-200/50">
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
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {!isLoading && featuredPosts.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollAnimation variant="fadeInUp">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
                  Bài Viết Nổi Bật
                </h2>
                <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                  Những bài viết được chọn lọc kỹ lưỡng về lụa và vải.
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
                    <article className="bg-white rounded-3xl shadow-lg border-2 border-stone-200/50 overflow-hidden group hover:shadow-2xl hover:border-blue-300 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-64 overflow-hidden">
                        <ImageWithFallback
                          src={post.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-600 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
                            Nổi bật
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-stone-400 text-xs mb-3">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>

                        <h3 className="font-serif text-xl text-stone-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors italic flex-1">
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
                            className="p-0 text-blue-600 font-medium hover:text-blue-800"
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

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
                Thư Viện Bài Viết
              </h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                Khám phá nghề dệt truyền thống và vẻ đẹp của lụa Việt Nam.
              </p>
            </div>
          </ScrollAnimation>

          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
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
                    <article className="bg-white rounded-3xl shadow-lg border-2 border-stone-200/50 overflow-hidden group hover:shadow-xl hover:border-blue-200/60 transition-all duration-300 cursor-pointer h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden">
                        <ImageWithFallback
                          src={post.image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="bg-blue-600 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
                            Thủy
                          </span>
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 text-stone-400 text-xs mb-3">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>

                        <h3 className="font-serif text-xl text-stone-900 leading-tight mb-3 group-hover:text-blue-600 transition-colors italic flex-1">
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
                            className="p-0 text-blue-600 font-medium hover:text-blue-800"
                          >
                            Đọc <ArrowUpRight className="ml-1 w-3 h-3" />
                          </Button>
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-stone-50 text-stone-600 px-2.5 py-1 rounded-full text-xs"
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

          {!isLoading && rawPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Droplet className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3 italic">
                Đang cập nhật nội dung
              </h3>
              <p className="text-stone-600">
                Các bài viết về lụa và vải sẽ sớm được bổ sung.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
