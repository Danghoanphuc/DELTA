// src/features/landing/components/sections/LPFeaturedProducts.tsx (CẬP NHẬT)

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";

export function LPFeaturedProducts() {
  const products = [
    {
      id: 1,
      title: "Card Visit Sang trọng",
      price: "99.000đ",
      // 1. Thay ảnh
      image: "https", // Ảnh đề xuất:
    },
    {
      id: 2,
      title: "Áo thun In hình",
      price: "149.000đ",
      // 2. Thay ảnh
      image: "https", // Ảnh đề xuất:
    },
    {
      id: 3,
      title: "Túi vải Canvas",
      price: "129.000đ",
      // 3. Thay ảnh
      image: "https", // Ảnh đề xuất:
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 fade-in-up">
          <h2 className="mb-4">Những Thiết kế được Yêu thích nhất</h2>
          <p className="text-slate-600">
            Sản phẩm được khách hàng đánh giá cao
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <Card
                key={product.id}
                // 4. Thêm 'hover-lift' và 'fade-in-up', bỏ 'hover:shadow-2xl'
                className="overflow-hidden group cursor-pointer transition-all duration-300
                           hover-lift fade-in-up"
                // 5. Thêm stagger
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  {/* ... (nội dung card giữ nguyên) ... */}
                  <h4 className="mb-2">{product.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl text-purple-600">
                      {product.price}
                    </span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
