// HeroSection.tsx - Section 0: Hero
import { Button } from "@/shared/components/ui/button";
import { Gem, ChevronDown, VolumeX, Volume2 } from "lucide-react";
import { Product } from "@/types/product";

interface HeroSectionProps {
  product: Product;
  showScrollHint: boolean;
  isMuted: boolean;
  onVideoToggle: () => void;
  onContactClick: () => void;
}

export function HeroSection({
  product,
  showScrollHint,
  isMuted,
  onVideoToggle,
  onContactClick,
}: HeroSectionProps) {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url;

  return (
    <section
      data-section="0"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {primaryImage && (
          <img
            src={primaryImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        {/* Category Badge */}
        <div className="mb-6 inline-flex items-center gap-2 border-b border-amber-500/50 pb-2">
          <Gem className="h-4 w-4 text-amber-500" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            Bộ sưu tập {product.category}
          </span>
        </div>

        {/* Product Name */}
        <h1 className="mb-6 max-w-4xl font-serif text-5xl leading-tight md:text-7xl lg:text-8xl">
          {product.name}
        </h1>

        {/* Tagline */}
        <p className="mb-10 max-w-2xl font-light italic text-stone-200 text-xl md:text-2xl">
          {product.description?.split(".")[0] || "Tinh hoa thủ công Việt Nam"}
        </p>

        {/* CTA */}
        <Button
          size="lg"
          variant="outline"
          className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-stone-900 transition-all duration-300"
          onClick={onContactClick}
        >
          Tư vấn & Báo giá
        </Button>
      </div>

      {/* Scroll Hint */}
      {showScrollHint && (
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 animate-bounce">
          <span className="text-xs font-mono uppercase tracking-widest text-white/70">
            Cuộn xuống
          </span>
          <ChevronDown className="h-6 w-6 text-white/70" />
        </div>
      )}
    </section>
  );
}
