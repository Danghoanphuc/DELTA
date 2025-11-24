import { Card } from "@/shared/components/ui/card";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Calendar, User, ArrowUpRight, Tag } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Header, Footer } from "./components";

export default function TrendsPage() {
  const featuredPost = {
    title: "Xu hướng In ấn 2025: Khi AI gặp gỡ Nghệ thuật Thủ công",
    excerpt: "Sự trỗi dậy của công nghệ in kỹ thuật số kết hợp với các kỹ thuật gia công truyền thống đang tạo ra một kỷ nguyên mới cho ngành bao bì.",
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=1000",
    date: "25/10/2025",
    author: "Printz Editorial",
    category: "Deep Tech",
  };

  const blogPosts = [
    {
      id: 2,
      title: "Giải mã kỹ thuật in Flexo trong sản xuất bao bì",
      category: "Kỹ thuật",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600",
    },
    {
      id: 3,
      title: "5 Loại giấy mỹ thuật 'bắt buộc phải biết' cho Luxury Brand",
      category: "Vật liệu",
      image: "https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?q=80&w=600",
    },
    {
      id: 4,
      title: "Tối ưu file thiết kế để tránh lỗi in ấn phổ biến",
      category: "Hướng dẫn",
      image: "https://images.unsplash.com/photo-1626785774583-b61d2830d309?q=80&w=600",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* HEADER TỐI GIẢN */}
      <section className="pt-24 pb-12 px-4 border-b border-slate-100 bg-paper-texture">
        <div className="max-w-7xl mx-auto">
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-4">
             INSIGHTS<span className="text-blue-600">.</span>
           </h1>
           <p className="text-xl text-slate-600 max-w-2xl font-serif italic">
             "Nơi hội tụ kiến thức chuyên sâu về công nghệ in ấn, vật liệu mới và xu hướng thiết kế toàn cầu."
           </p>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FEATURED POST - STYLE TẠP CHÍ */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center group cursor-pointer">
           <div className="relative overflow-hidden rounded-3xl aspect-[16/10]">
              <ImageWithFallback 
                src={featuredPost.image} 
                alt="Featured" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
           </div>
           <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm font-mono text-slate-500">
                 <span className="text-blue-600 font-bold uppercase tracking-wider px-2 py-1 bg-blue-50 rounded">
                    {featuredPost.category}
                 </span>
                 <span>{featuredPost.date}</span>
                 <span>•</span>
                 <span>{featuredPost.author}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 leading-[1.1] group-hover:text-blue-600 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed border-l-4 border-slate-200 pl-4">
                {featuredPost.excerpt}
              </p>
              <div className="pt-4">
                 <Button variant="link" className="text-slate-900 font-bold pl-0 text-lg hover:text-blue-600">
                    Đọc tiếp bài viết <ArrowUpRight className="ml-2 w-5 h-5" />
                 </Button>
              </div>
           </div>
        </div>

        {/* LATEST POSTS - GRID SẠCH SẼ */}
        <div className="flex items-center justify-between mb-8 border-t border-slate-200 pt-12">
           <h3 className="text-2xl font-bold">Mới cập nhật</h3>
           <Button variant="outline" className="rounded-full">Xem tất cả</Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {blogPosts.map((post) => (
             <div key={post.id} className="group cursor-pointer">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 relative">
                   <ImageWithFallback 
                     src={post.image} 
                     alt={post.title}
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                   <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-900 border border-slate-200">
                         {post.category}
                      </span>
                   </div>
                </div>
                <h4 className="text-xl font-bold font-heading mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                   {post.title}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                   <span>5 phút đọc</span>
                </div>
             </div>
           ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}