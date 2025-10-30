import { Card } from "@/shared/components/ui/card";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

import { Calendar, User, TrendingUp } from "lucide-react";

export default function TrendsPage() {
  const featuredPost = {
    id: 1,
    title: "Xu hướng thiết kế in ấn 2025: Từ Minimalism đến AI-Generated Art",
    excerpt:
      "Khám phá những xu hướng mới nhất đang định hình lại ngành in ấn trong năm 2025, từ phong cách tối giản đến nghệ thuật được tạo bởi AI.",
    image:
      "https://images.unsplash.com/photo-1510832758362-af875829efcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB3b3Jrc3BhY2UlMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NjE3OTQ5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    date: "25/10/2025",
    author: "Nguyễn Văn A",
    category: "Xu hướng",
    readTime: "8 phút đọc",
  };

  const blogPosts = [
    {
      id: 2,
      title: "Bí quyết chọn card visit ấn tượng cho doanh nghiệp",
      excerpt:
        "Hướng dẫn chi tiết từ A-Z để tạo card visit chuyên nghiệp, để lại ấn tượng khó quên với đối tác.",
      image:
        "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNhcmRzJTIwcHJpbnRpbmd8ZW58MXx8fHwxNzYxNzIxODYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "20/10/2025",
      author: "Trần Thị B",
      category: "Hướng dẫn",
      readTime: "5 phút đọc",
    },
    {
      id: 3,
      title: "In áo thun theo yêu cầu: Mọi điều bạn cần biết",
      excerpt:
        "Từ chọn vải, kỹ thuật in, đến bảo quản, tất cả những kiến thức cần thiết về in áo thun.",
      image:
        "https://images.unsplash.com/photo-1600328759671-85927887458d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0LXNoaXJ0JTIwZGVzaWdufGVufDF8fHx8MTc2MTc5NDkxMXww&ixlib=rb-4.1.0&q=80&w=1080",
      date: "15/10/2025",
      author: "Lê Văn C",
      category: "Kiến thức",
      readTime: "7 phút đọc",
    },
    {
      id: 4,
      title: "Màu sắc trong thiết kế: Tâm lý học và ứng dụng",
      excerpt:
        "Khám phá cách màu sắc ảnh hưởng đến cảm xúc và quyết định mua hàng của khách hàng.",
      image:
        "https://images.unsplash.com/photo-1510832758362-af875829efcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNpZ24lMjB3b3Jrc3BhY2UlMjBjcmVhdGl2ZXxlbnwxfHx8fDE3NjE3OTQ5MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "10/10/2025",
      author: "Phạm Thị D",
      category: "Thiết kế",
      readTime: "6 phút đọc",
    },
    {
      id: 5,
      title: "Tối ưu file thiết kế cho in ấn chất lượng cao",
      excerpt:
        "Hướng dẫn chuẩn bị file thiết kế đúng chuẩn để đảm bảo kết quả in ấn hoàn hảo.",
      image:
        "https://images.unsplash.com/photo-1758271613743-748b409c196b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmludGluZyUyMHByZXNzJTIwbW9kZXJufGVufDF8fHx8MTc2MTc0MzQ4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      date: "05/10/2025",
      author: "Nguyễn Văn E",
      category: "Kỹ thuật",
      readTime: "4 phút đọc",
    },
    {
      id: 6,
      title: "Startup và branding: Xây dựng thương hiệu từ con số 0",
      excerpt:
        "Chiến lược xây dựng nhận diện thương hiệu hiệu quả cho các startup với ngân sách hạn chế.",
      image:
        "https://images.unsplash.com/photo-1690264460165-0ff5e1063d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG9mZmljZXxlbnwxfHx8fDE3NjE3NjgyNDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
      date: "30/09/2025",
      author: "Trần Văn F",
      category: "Marketing",
      readTime: "10 phút đọc",
    },
  ];

  const categories = [
    "Tất cả",
    "Xu hướng",
    "Hướng dẫn",
    "Kiến thức",
    "Thiết kế",
    "Kỹ thuật",
    "Marketing",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTUxLDIzNCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-6">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-600">
                Xu hướng & Kiến thức
              </span>
            </div>
            <h1 className="mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Blog & Cảm hứng
              </span>
            </h1>
            <p className="text-xl text-slate-600">
              Cập nhật xu hướng mới nhất, mẹo thiết kế và kiến thức chuyên sâu
              về ngành in ấn
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-b border-slate-200 sticky top-16 z-40 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full whitespace-nowrap transition-all ${
                  index === 0
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            <h2>Bài viết nổi bật</h2>
          </div>

          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-96 md:h-auto overflow-hidden">
                <ImageWithFallback
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm">
                    {featuredPost.category}
                  </span>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {featuredPost.author}
                  </div>
                </div>
                <h2 className="mb-4">{featuredPost.title}</h2>
                <p className="text-slate-600 mb-6">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600">
                    {featuredPost.readTime}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center gap-2">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            <h2>Bài viết mới nhất</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card
                key={post.id}
                className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200"
              >
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-purple-600 rounded-full text-xs">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h4 className="mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-white">Đăng ký nhận bản tin</h2>
          <p className="text-xl text-blue-100 mb-8">
            Nhận các bài viết mới nhất, xu hướng thiết kế và ưu đãi độc quyền
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Email của bạn"
              className="flex-1 px-6 py-4 rounded-full text-slate-900 outline-none"
            />
            <button className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-4 rounded-full transition-colors whitespace-nowrap">
              Đăng ký
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
