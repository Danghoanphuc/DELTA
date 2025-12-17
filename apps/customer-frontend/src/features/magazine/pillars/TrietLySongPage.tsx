// apps/customer-frontend/src/features/magazine/pillars/TrietLySongPage.tsx
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
  Feather,
  ArrowUpRight,
  Calendar,
  User,
  Tag,
  ChevronLeft,
  Loader2,
} from "lucide-react";

export default function TrietLySongPage() {
  const {
    posts,
    featuredPosts: rawFeatured,
    isLoading,
  } = useMagazinePosts("triet-ly-song");

  const evergreenContent = {
    title: "Triết Lý Sống",
    subtitle: "Zen & Mindfulness",
    intro: `Trong thế giới hiện đại đầy hối hả, chúng ta dễ dàng đánh mất chính mình giữa vô vàn công việc và áp lực. Triết lý sống của Printz không chỉ là về việc tặng quà, mà là về nghệ thuật sống chậm lại, tỉnh thức và tìm lại sự bình yên trong tâm hồn.

Lấy cảm hứng từ Zen Buddhism, Wabi-Sabi và các triết lý phương Đông, chúng tôi tin rằng vẻ đẹp thực sự nằm ở sự giản dị, không hoàn hảo và tạm thời. Mỗi món quà chúng tôi chọn lọc không chỉ là vật phẩm, mà là lời nhắc nhở về việc sống trọn vẹn từng khoảnh khắc.

Kintsugi - nghệ thuật hàn gắn gốm vỡ bằng vàng - là biểu tượng hoàn hảo cho triết lý này. Thay vì che giấu vết nứt, chúng ta tôn vinh nó, biến nó thành điểm nhấn đẹp đẽ nhất. Đó chính là cách chúng ta đối diện với cuộc sống: chấp nhận sự không hoàn hảo, học hỏi từ thất bại và trở nên mạnh mẽ hơn.`,
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2000",
  };

  const blogPosts = posts.map(convertToBlogPost);
  const featuredPosts = rawFeatured.map(convertToBlogPost);
  const regularPosts = blogPosts.filter((p) => !p.featured);

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
                  "Vẻ đẹp thực sự không nằm ở sự hoàn hảo, mà ở sự chân thật và
                  tạm thời của mọi vật."
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* BÀI ĐĂNG NỔI BẬT */}
      {!isLoading && featuredPosts.length > 0 && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <ScrollAnimation variant="fadeInUp">
              <div className="text-center mb-12">
                <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
                  Bài Viết Nổi Bật
                </h2>
                <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                  Những bài viết được chọn lọc kỹ lưỡng về triết lý sống.
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

      {/* THƯ VIỆN BÀI VIẾT */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollAnimation variant="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
                Thư Viện Bài Viết
              </h2>
              <p className="text-stone-600 text-lg max-w-2xl mx-auto">
                Khám phá những câu chuyện sâu sắc về triết lý sống, Zen và nghệ
                thuật tỉnh thức.
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
                            Triết Lý
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
                            {post.tags.slice(0, 3).map((tag, idx) => (
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
                <Feather className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="font-serif text-2xl text-stone-900 mb-3 italic">
                Đang cập nhật nội dung
              </h3>
              <p className="text-stone-600">
                Các bài viết về triết lý sống sẽ sớm được bổ sung.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
