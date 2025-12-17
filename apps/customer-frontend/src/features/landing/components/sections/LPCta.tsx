import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";

export function LPCta() {
  return (
    <section className="py-32 bg-stone-900 text-center px-4 border-t border-stone-800 relative overflow-hidden">
      {/* Texture noise */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
        }}
      ></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <h2 className="font-serif text-5xl md:text-7xl text-[#F9F8F6] mb-8 italic">
          Sẵn sàng cho một Vị thế mới?
        </h2>
        <p className="text-xl text-stone-400 font-light mb-12 max-w-lg mx-auto">
          Đừng để những món quà vô tri làm nhạt nhòa dấu ấn doanh nghiệp. Hãy
          bắt đầu câu chuyện văn hóa của riêng bạn ngay hôm nay.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button
            asChild
            className="bg-amber-800 text-white hover:bg-amber-900 px-12 py-8 text-base tracking-widest uppercase font-bold rounded-sm transition-all shadow-2xl hover:scale-105"
          >
            <Link to="/contact">Nhận Tư vấn Riêng</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-stone-600 text-stone-300 hover:border-[#F9F8F6] hover:text-[#F9F8F6] hover:bg-transparent px-12 py-8 text-base tracking-widest uppercase font-bold rounded-sm transition-all"
          >
            <Link to="/shop">Xem Catalog 2025</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
