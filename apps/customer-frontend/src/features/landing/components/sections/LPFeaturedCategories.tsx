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
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { ArrowRight, Layers, Sparkles, Zap, Box, Leaf, Award, Clock } from "lucide-react";

export function LPFeaturedCategories() {
  const categories = [
    {
      id: "C01",
      imageSrc:
        "https://cdn.pacdora.com/edits/e9a71092f28b4b959f1362e3287b3c05.jpg",
      title: "Card Visit",
      specs: "300gsm • Couche",
      // Thay giá bằng Highlight hấp dẫn
      highlight: "In lấy ngay 2h",
      icon: Zap, 
      color: "text-yellow-600 bg-yellow-50 border-yellow-100"
    },
    {
      id: "C02",
      imageSrc:
        "https://cdn.pacdora.com/edits/d7c973da87404d9dbbed13a79bf6e885.jpg",
      title: "Bao bì Hộp",
      specs: "Carton • Duplex",
      highlight: "Nhận in số lượng ít",
      icon: Box,
      color: "text-blue-600 bg-blue-50 border-blue-100"
    },
    {
      id: "C03",
      imageSrc:
        "https://cdn.pacdora.com/edits/78c217fa8ea94c7a8eb91f6284f1ba01.jpg",
      title: "Túi vải Canvas",
      specs: "Vải bố • In lụa",
      highlight: "Chất liệu Eco-Friendly",
      icon: Leaf,
      color: "text-green-600 bg-green-50 border-green-100"
    },
    {
      id: "C04",
      imageSrc:
        "https://cdn.pacdora.com/edits/1bbc2fd2c9f94e06bccecc1840597962.jpg",
      title: "Standee",
      specs: "PP • Nhôm cuốn",
      highlight: "Bền màu ngoài trời",
      icon: Award,
      color: "text-purple-600 bg-purple-50 border-purple-100"
    },
    {
      id: "C05",
      imageSrc:
        "https://cdn.pacdora.com/edits/455c899de575429c9e0b2cf851ac994a.jpg",
      title: "Tờ rơi / Flyer",
      specs: "C150 • A4/A5",
      highlight: "In Offset siêu nét",
      icon: Layers,
      color: "text-cyan-600 bg-cyan-50 border-cyan-100"
    },
    {
      id: "C06",
      imageSrc:
        "https://cdn.pacdora.com/edits/c7423f0b4eea45d2a620dd3a6dbb847d.jpg",
      title: "Tem nhãn",
      specs: "Decal giấy/nhựa",
      highlight: "Cắt bế theo yêu cầu",
      icon: Sparkles,
      color: "text-pink-600 bg-pink-50 border-pink-100"
    },
    {
      id: "C07",
      imageSrc:
        "https://cdn.pacdora.com/edits/686693afa419446880e4a4bbf37b5a11.jpg",
      title: "Đồ đựng",
      specs: "Giấy Kraft",
      highlight: "Thiết kế miễn phí",
      icon: Sparkles,
      color: "text-orange-600 bg-orange-50 border-orange-100"
    },
    {
      id: "C08",
      imageSrc:
        "https://cdn.pacdora.com/edits/bcffef5fc65b47729a35f017c45d5fd4.jpg",
      title: "Brochure",
      specs: "C200 • Gấp 3",
      highlight: "Giao hàng hỏa tốc",
      icon: Clock,
      color: "text-red-600 bg-red-50 border-red-100"
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-blue"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 fade-in-up">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">
              <Sparkles className="w-3 h-3" />
              Kho mẫu đa dạng
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
              Danh mục <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Sản phẩm in ấn
              </span>
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-lg">
              Hơn 100+ quy cách in ấn chuẩn công nghiệp, sẵn sàng cho mọi nhu cầu thương hiệu.
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="hidden md:flex h-12 px-6 rounded-2xl border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all font-medium"
          >
            <Link to="/shop">
              Xem tất cả
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <CarouselContent className="-ml-4 pb-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <CarouselItem
                  key={index}
                  className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <Link to="/shop" className="block h-full">
                    <div className="group relative h-full flex flex-col transition-all duration-300 hover:-translate-y-2">
                      
                      <Card className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:border-blue-200 transition-all duration-300">
                        {/* Vùng ảnh */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                          <ImageWithFallback
                            src={category.imageSrc}
                            alt={category.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                          {/* Action Button */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 w-max">
                             <span className="bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                Bắt đầu thiết kế <ArrowRight className="w-3 h-3" />
                             </span>
                          </div>
                        </div>

                        {/* Vùng thông tin */}
                        <div className="p-4 bg-white relative">
                          <h4 className="font-bold text-slate-900 text-base mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {category.title}
                          </h4>
                          
                          {/* Specs Badge */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs text-slate-500 font-medium mb-4">
                            <Layers className="w-3 h-3" />
                            <span className="truncate max-w-[120px]">{category.specs}</span>
                          </div>

                          {/* HIGHLIGHT BADGE (Thay cho giá) */}
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${category.color} bg-opacity-50`}>
                             <Icon className="w-4 h-4 flex-shrink-0" />
                             <span className="text-xs font-bold truncate">{category.highlight}</span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="left-0 -translate-x-1/2 border border-slate-200 bg-white/80 backdrop-blur hover:bg-white text-slate-600 rounded-full h-10 w-10 shadow-lg" />
          <CarouselNext className="right-0 translate-x-1/2 border border-slate-200 bg-white/80 backdrop-blur hover:bg-white text-slate-600 rounded-full h-10 w-10 shadow-lg" />
        </Carousel>

        {/* Mobile Button */}
        <div className="mt-8 text-center md:hidden">
          <Button
            asChild
            className="w-full py-6 rounded-xl bg-slate-900 text-white font-bold shadow-lg"
          >
            <Link to="/shop">
              Xem tất cả danh mục
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}