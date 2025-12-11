import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header, Footer } from "./components";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Button } from "@/shared/components/ui/button";
import {
  ArrowUpRight,
  Calendar,
  User,
  Tag,
  Search,
  Filter,
  BookOpen,
  Lightbulb,
  Palette,
  Printer,
  Gift,
  TrendingUp,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  image: string;
  category: "knowledge" | "gift-ideas";
  subcategory: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

export default function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<
    "all" | "knowledge" | "gift-ideas"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle URL parameters for category
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam === "gift-ideas" || categoryParam === "knowledge") {
      setActiveCategory(categoryParam);
    }
  }, [searchParams]);

  const categories = [
    { id: "all", label: "Tất cả bài viết", icon: BookOpen, count: 12 },
    { id: "knowledge", label: "Kiến thức in ấn", icon: Printer, count: 7 },
    { id: "gift-ideas", label: "Ý tưởng quà tặng", icon: Gift, count: 5 },
  ];

  const blogPosts: BlogPost[] = [
    // Featured Post
    {
      id: "1",
      title:
        "Sự trở lại của kỹ thuật in dập nổi (Letterpress) trong kỷ nguyên số",
      excerpt:
        "Khi thế giới ngày càng phẳng, con người càng khao khát những điểm chạm vật lý. Letterpress không chỉ là in ấn, nó là điêu khắc trên giấy.",
      image:
        "https://images.unsplash.com/photo-1594901579895-8b29c9cc298a?q=80&w=2000&auto=format&fit=crop",
      category: "knowledge",
      subcategory: "Kỹ thuật in ấn",
      author: "Printz Editorial Team",
      date: "2025-12-15",
      readTime: "8 phút đọc",
      tags: ["Letterpress", "Kỹ thuật in", "Luxury Printing"],
      featured: true,
    },
    // Knowledge Posts
    {
      id: "2",
      title: "Giấy mỹ thuật: Cuộc chơi của những gã khổng lồ Luxury",
      excerpt:
        "Tìm hiểu về các loại giấy cao cấp và cách chúng tạo nên sự khác biệt trong sản phẩm in ấn luxury.",
      image:
        "https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?q=80&w=800",
      category: "knowledge",
      subcategory: "Chất liệu",
      author: "Minh Trần",
      date: "2025-12-10",
      readTime: "6 phút đọc",
      tags: ["Giấy mỹ thuật", "Luxury", "Chất liệu"],
    },
    {
      id: "3",
      title: "Foil Stamping: Ép kim sao cho sang mà không sến?",
      excerpt:
        "Bí quyết sử dụng kỹ thuật ép kim để tạo ra những sản phẩm in ấn đẳng cấp và tinh tế.",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
      category: "knowledge",
      subcategory: "Kỹ thuật gia công",
      author: "Hương Nguyễn",
      date: "2025-12-08",
      readTime: "5 phút đọc",
      tags: ["Foil Stamping", "Ép kim", "Gia công"],
    },
    {
      id: "4",
      title: "CMYK vs RGB: Tại sao màu in ra khác màu trên màn hình?",
      excerpt:
        "Giải thích chi tiết về sự khác biệt giữa hai hệ màu và cách đảm bảo màu sắc chính xác khi in ấn.",
      image:
        "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800",
      category: "knowledge",
      subcategory: "Màu sắc",
      author: "Đức Lê",
      date: "2025-12-05",
      readTime: "7 phút đọc",
      tags: ["CMYK", "RGB", "Màu sắc", "Thiết kế"],
    },
    {
      id: "5",
      title: "Quy chuẩn file thiết kế: 5 lỗi phổ biến cần tránh",
      excerpt:
        "Những sai lầm thường gặp khi chuẩn bị file thiết kế và cách khắc phục để có sản phẩm in hoàn hảo.",
      image:
        "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800",
      category: "knowledge",
      subcategory: "File thiết kế",
      author: "Printz Design Team",
      date: "2025-12-03",
      readTime: "4 phút đọc",
      tags: ["File thiết kế", "Quy chuẩn", "Tips"],
    },
    // Gift Ideas Posts
    {
      id: "6",
      title: "10 ý tưởng quà tặng doanh nghiệp độc đáo cho cuối năm 2025",
      excerpt:
        "Khám phá những ý tưởng quà tặng sáng tạo giúp doanh nghiệp gây ấn tượng với khách hàng và đối tác.",
      image:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800",
      category: "gift-ideas",
      subcategory: "Quà tặng doanh nghiệp",
      author: "Thu Phương",
      date: "2025-12-12",
      readTime: "6 phút đọc",
      tags: ["Quà tặng", "Doanh nghiệp", "Cuối năm"],
    },
    {
      id: "7",
      title: "Eco-friendly Gifts: Xu hướng quà tặng xanh đang lên ngôi",
      excerpt:
        "Tìm hiểu về xu hướng quà tặng thân thiện với môi trường và cách áp dụng vào chiến lược marketing.",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=800",
      category: "gift-ideas",
      subcategory: "Xu hướng",
      author: "Minh Anh",
      date: "2025-12-07",
      readTime: "5 phút đọc",
      tags: ["Eco-friendly", "Xu hướng", "Môi trường"],
    },
    {
      id: "8",
      title:
        'Personalization trong quà tặng: Làm sao để "chạm" đến trái tim khách hàng?',
      excerpt:
        "Bí quyết cá nhân hóa quà tặng để tạo ra những món quà có ý nghĩa và để lại ấn tượng sâu sắc.",
      image:
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=800",
      category: "gift-ideas",
      subcategory: "Cá nhân hóa",
      author: "Lan Hương",
      date: "2025-12-01",
      readTime: "7 phút đọc",
      tags: ["Personalization", "Cá nhân hóa", "Marketing"],
    },
    {
      id: "9",
      title: "Tech Gifts 2025: Quà tặng công nghệ cho doanh nghiệp hiện đại",
      excerpt:
        "Khám phá những món quà công nghệ thông minh phù hợp với văn hóa làm việc hiện đại.",
      image:
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?q=80&w=800",
      category: "gift-ideas",
      subcategory: "Công nghệ",
      author: "Tuấn Vũ",
      date: "2025-11-28",
      readTime: "6 phút đọc",
      tags: ["Tech Gifts", "Công nghệ", "2025"],
    },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

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

      {/* HEADER */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
              Blog & Insights.
            </h1>
            <p className="text-stone-600 text-lg max-w-3xl mx-auto">
              Khám phá kiến thức chuyên sâu về in ấn và những ý tưởng quà tặng
              sáng tạo từ đội ngũ chuyên gia tại Printz Solutions.
            </p>
          </div>

          {/* SEARCH & FILTER */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-stone-200/50 mb-12">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-stone-300/50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-3xl font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl ${
                      activeCategory === category.id
                        ? "bg-emerald-600 text-white"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.label}
                    <span className="bg-white/20 px-2 py-1 rounded-3xl text-xs">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-24">
        {/* FEATURED POST */}
        {featuredPost &&
          (activeCategory === "all" ||
            activeCategory === featuredPost.category) && (
            <div className="bg-white rounded-3xl shadow-lg border-2 border-stone-200/50 overflow-hidden mb-16">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-3xl text-xs font-semibold uppercase tracking-wide shadow-lg">
                      Nổi bật
                    </span>
                  </div>
                  <ImageWithFallback
                    src={featuredPost.image}
                    className="w-full h-[400px] lg:h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-3xl text-xs font-semibold">
                      {featuredPost.subcategory}
                    </span>
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(featuredPost.date)}
                    </div>
                  </div>
                  <h2 className="font-serif text-3xl lg:text-4xl text-stone-900 leading-tight mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-stone-600 leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-500 text-sm">
                      <User className="w-4 h-4" />
                      {featuredPost.author}
                      <span className="mx-2">•</span>
                      {featuredPost.readTime}
                    </div>
                    <Button
                      variant="link"
                      className="p-0 text-emerald-600 font-semibold hover:text-emerald-800"
                    >
                      Đọc bài viết <ArrowUpRight className="ml-1 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* POSTS GRID */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-3xl shadow-lg border-2 border-stone-200/50 overflow-hidden group hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 rounded-3xl text-xs font-semibold text-white shadow-lg ${
                      post.category === "knowledge"
                        ? "bg-blue-600"
                        : "bg-purple-600"
                    }`}
                  >
                    {post.category === "knowledge" ? "Kiến thức" : "Ý tưởng"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-stone-100 text-stone-600 px-2 py-1 rounded-3xl text-xs font-medium">
                    {post.subcategory}
                  </span>
                  <div className="flex items-center gap-1 text-stone-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.date)}
                  </div>
                </div>

                <h3 className="font-serif text-xl text-stone-900 leading-tight mb-3 group-hover:text-emerald-600 transition-colors">
                  {post.title}
                </h3>

                <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-stone-500 text-xs">
                    <User className="w-3 h-3" />
                    {post.author}
                    <span className="mx-1">•</span>
                    {post.readTime}
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-emerald-600 font-medium hover:text-emerald-800"
                  >
                    Đọc thêm <ArrowUpRight className="ml-1 w-3 h-3" />
                  </Button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-stone-100">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 bg-stone-50 text-stone-600 px-2 py-1 rounded-3xl text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* NO RESULTS */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-stone-100 rounded-3xl border-2 border-stone-200/50 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="font-serif text-2xl text-stone-900 mb-2">
              Không tìm thấy bài viết
            </h3>
            <p className="text-stone-600 mb-6">
              Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("all");
              }}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              Xem tất cả bài viết
            </Button>
          </div>
        )}

        {/* NEWSLETTER SIGNUP */}
        <div className="bg-gradient-to-br from-emerald-50 to-stone-50 p-8 rounded-3xl border-2 border-emerald-200/50 shadow-lg mt-16 text-center">
          <h3 className="font-serif text-2xl text-stone-900 italic mb-4">
            Đăng ký nhận bài viết mới
          </h3>
          <p className="text-stone-600 mb-6 max-w-2xl mx-auto">
            Nhận những kiến thức mới nhất về in ấn và ý tưởng quà tặng sáng tạo
            được gửi thẳng đến email của bạn mỗi tuần.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 border-2 border-stone-300/50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg"
            />
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Đăng ký
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
