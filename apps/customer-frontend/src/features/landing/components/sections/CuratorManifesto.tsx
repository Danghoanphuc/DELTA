import { Quote } from "lucide-react";

export function CuratorManifesto() {
  return (
    <section className="bg-stone-900 text-stone-200 py-20 px-6 border-y border-stone-800">
      <div className="max-w-4xl mx-auto text-center">
        {/* Icon trang trí */}
        <div className="flex justify-center mb-8">
          <Quote className="w-10 h-10 text-amber-800 opacity-50 rotate-180" />
        </div>

        {/* Headline: Đặt vấn đề trực diện */}
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-8 leading-tight">
          Tại sao chúng tôi chọn con đường <br />
          <span className="italic text-amber-500">"Giám Tuyển"</span> (Curator)?
        </h2>

        {/* Nội dung: Giải thích đầy kiêu hãnh */}
        <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-stone-300">
          <p>
            Người bán hàng (Seller) cố gắng bán cho bạn{" "}
            <strong className="text-white">mọi thứ họ có</strong> trong kho.
          </p>
          <p>
            Nhà giám tuyển (Curator) gạt bỏ 99% những thứ tầm thường, chỉ giữ
            lại <strong className="text-white">1% tinh hoa duy nhất</strong>{" "}
            xứng đáng với vị thế của bạn.
          </p>
          <p>
            Chúng tôi không bán đồ thủ công mỹ nghệ. Chúng tôi bán sự khắt khe
            trong lựa chọn.
          </p>
        </div>

        {/* Chữ ký */}
        <div className="mt-12 pt-8 border-t border-white/10 inline-block px-10">
          <span className="font-serif text-2xl italic text-amber-200">
            Printz Team
          </span>
        </div>
      </div>
    </section>
  );
}
