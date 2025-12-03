import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

export function LPFeaturedCategories() {
  const categories = [
    {
      title: "Business Cards",
      desc: "Ấn tượng đầu tiên chuyên nghiệp",
      img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
      colSpan: "md:col-span-1",
    },
    {
      title: "Corporate Gifting",
      desc: "Sổ tay, Bút & Quà tặng sự kiện",
      img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      colSpan: "md:col-span-1",
    },
    {
      title: "Packaging Solutions",
      desc: "Hộp cứng, Túi giấy & Tem nhãn",
      img: "https://images.unsplash.com/photo-1632515904791-c2474db8069d?auto=format&fit=crop&q=80&w=1200",
      colSpan: "md:col-span-2", // Ảnh to ngang
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex justify-between items-end mb-16 border-b border-stone-200 pb-8">
          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
              Bộ sưu tập.
            </h2>
            <p className="text-stone-500 max-w-md">
              Các dòng sản phẩm được tuyển chọn kỹ lưỡng cho tiêu chuẩn doanh
              nghiệp.
            </p>
          </div>
          <Link
            to="/shop"
            className="hidden md:flex items-center gap-2 text-stone-900 font-bold hover:text-emerald-800 transition-colors"
          >
            Xem tất cả (120+) <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to="/shop"
              className={`group relative h-[400px] block overflow-hidden bg-stone-100 ${cat.colSpan}`}
            >
              <ImageWithFallback
                src={cat.img}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt={cat.title}
              />

              {/* Overlay Text - Minimal */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-2xl font-serif text-white italic mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {cat.title}
                </h3>
                <p className="text-stone-200 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-medium tracking-wide">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
