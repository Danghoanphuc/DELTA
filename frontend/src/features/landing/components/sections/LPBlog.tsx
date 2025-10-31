// src/features/landing/components/sections/LPBlog.tsx (CẬP NHẬT)

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { ArrowRight } from "lucide-react";

export function LPBlog() {
  const blogPosts = [
    {
      id: 1,
      title: "Xu hướng thiết kế in ấn 2025",
      excerpt: "Khám phá những xu hướng mới nhất trong ngành in ấn",
      // 1. Thay ảnh
      image:
        "https://images.unsplash.com/photo-1554415707-6e85c753bcd6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      date: "15/10/2025",
    },
    {
      id: 2,
      title: "Bí quyết chọn card visit ấn tượng",
      excerpt: "Hướng dẫn chi tiết để tạo card visit chuyên nghiệp",
      // 2. Thay ảnh
      image:
        "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      date: "10/10/2025",
    },
    {
      id: 3,
      title: "In áo thun theo yêu cầu - Mọi điều bạn cần biết",
      excerpt: "Từ chọn vải đến kỹ thuật in, tất cả đều có trong bài viết này",
      // 3. Thay ảnh
      image:
        "https://images.unsplash.com/photo-1600328759671-85927887458d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      date: "05/10/2025",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="mb-4">Kiến thức & Cảm hứng ngành In</h2>
          <p className="text-slate-600">
            Cập nhật xu hướng và mẹo thiết kế mới nhất
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <Card
              key={post.id}
              // 4. Thêm 'hover-lift' và 'fade-in-up', bỏ 'hover:shadow-xl' và 'hover:-translate-y-2'
              className="overflow-hidden group cursor-pointer transition-all duration-300
                         hover-lift fade-in-up"
              // 5. Thêm stagger
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                {/* ... (nội dung card giữ nguyên) ... */}
                <p className="text-sm text-purple-600 mb-2">{post.date}</p>
                <h4 className="mb-3 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h4>
                <p className="text-slate-600 mb-4">{post.excerpt}</p>
                <button className="text-purple-600 hover:text-purple-700 inline-flex items-center gap-2">
                  Đọc thêm
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        <div
          className="text-center mt-12 fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <Button
            variant="outline"
            className="px-8 py-6 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            Xem tất cả bài viết
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
