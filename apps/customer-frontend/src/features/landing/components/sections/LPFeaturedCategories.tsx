// src/features/landing/components/sections/LPFeaturedCategories.tsx (CẬP NHẬT)

import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
// 1. Import ImageWithFallback (thay vì các icon)
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

// 2. Loại bỏ các import icon (CreditCard, Shirt, ...)

export function LPFeaturedCategories() {
  // 3. Cập nhật mảng categories: dùng `imageSrc` thay vì `icon` và `color`
  const categories = [
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/e9a71092f28b4b959f1362e3287b3c05.jpg", // << THAY ẢNH
      title: "Card Visit",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/d7c973da87404d9dbbed13a79bf6e885.jpg", // << THAY ẢNH
      title: "Bao bì",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/78c217fa8ea94c7a8eb91f6284f1ba01.jpg", // << THAY ẢNH
      title: "Túi vải",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/1bbc2fd2c9f94e06bccecc1840597962.jpg", // << THAY ẢNH
      title: "Standee",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/455c899de575429c9e0b2cf851ac994a.jpg", // << THAY ẢNH
      title: "Tờ rơi",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/c7423f0b4eea45d2a620dd3a6dbb847d.jpg", // << THAY ẢNH
      title: "Nhãn dán",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/686693afa419446880e4a4bbf37b5a11.jpg", // << THAY ẢNH
      title: "Đồ đựng",
    },
    {
      imageSrc:
        "https://cdn.pacdora.com/edits/bcffef5fc65b47729a35f017c45d5fd4.jpg", // << THAY ẢNH
      title: "Brochure",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header (Giữ nguyên) */}
        <div className="text-center mb-12 fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Hôm nay bạn sẽ{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              in
            </span>{" "}
            gì nào?
          </h1>
          <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
            Với Printz, bạn có thể thiết kế, in ấn và làm việc trên mọi thứ.
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 rounded-full" asChild>
            <Link to="/shop">Bắt đầu thiết kế</Link>
          </Button>
        </div>

        {/* Carousel (Logic giữ nguyên) */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {categories.map((category, index) => {
              // (Không còn 'Icon' và 'color')
              return (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  {/* 4. CẬP NHẬT THIẾT KẾ CARD ĐỂ CẢI THIỆN UX/CONTRAST */}
                  <Card
                    className="cursor-pointer group border-2 border-transparent hover:border-purple-200
                               hover-lift overflow-hidden rounded-2xl" // Bỏ padding, thêm overflow và bo tròn
                  >
                    {/* Vùng chứa ảnh */}
                    <div className="aspect-square w-full overflow-hidden">
                      <ImageWithFallback
                        src={category.imageSrc} // Dùng imageSrc
                        alt={category.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" // Hiệu ứng zoom
                      />
                    </div>

                    {/* Vùng chứa tiêu đề (tăng độ tương phản) */}
                    <div className="p-4 bg-white">
                      <h4 className="font-semibold text-center text-slate-800 group-hover:text-purple-600 transition-colors">
                        {category.title}
                      </h4>
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 -translate-x-1/2" />
          <CarouselNext className="absolute right-0 translate-x-1/2" />
        </Carousel>
      </div>
    </section>
  );
}
