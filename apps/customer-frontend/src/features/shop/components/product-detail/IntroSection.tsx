// IntroSection.tsx - Section 1: Introduction
import { Clock, Palette, Gem, Award } from "lucide-react";
import { Product } from "@/types/product";

interface IntroSectionProps {
  product: Product;
}

export function IntroSection({ product }: IntroSectionProps) {
  return (
    <section
      data-section="1"
      className="relative py-24 px-6 text-center opacity-0 transition-all duration-1000 min-h-screen flex items-center"
    >
      <div className="mx-auto max-w-4xl">
        <p className="mb-12 font-serif text-2xl leading-relaxed text-stone-700 md:text-3xl">
          {product.description}
        </p>

        {/* Specs Icons */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col items-center gap-3">
            <Clock className="h-8 w-8 text-amber-700" />
            <span className="text-sm font-mono uppercase tracking-wider text-stone-500">
              Thời gian chế tác
            </span>
            <span className="font-serif text-lg font-bold text-stone-900">
              120 giờ
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Palette className="h-8 w-8 text-amber-700" />
            <span className="text-sm font-mono uppercase tracking-wider text-stone-500">
              Kỹ thuật
            </span>
            <span className="font-serif text-lg font-bold text-stone-900">
              {product.specifications?.material || "Thủ công"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Gem className="h-8 w-8 text-amber-700" />
            <span className="text-sm font-mono uppercase tracking-wider text-stone-500">
              Giới hạn
            </span>
            <span className="font-serif text-lg font-bold text-stone-900">
              50 bản/năm
            </span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Award className="h-8 w-8 text-amber-700" />
            <span className="text-sm font-mono uppercase tracking-wider text-stone-500">
              Chứng nhận
            </span>
            <span className="font-serif text-lg font-bold text-stone-900">
              Nghệ nhân ưu tú
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
