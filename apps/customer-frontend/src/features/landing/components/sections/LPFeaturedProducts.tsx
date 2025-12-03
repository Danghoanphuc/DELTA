import { Button } from "@/shared/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

export function LPFeaturedProducts() {
  const products = [
    {
      id: 1,
      title: "The Signature Card",
      price: "From 199k",
      desc: "Giấy mỹ thuật 350gsm. Ép kim Gold 18k.",
      image:
        "https://images.unsplash.com/photo-1615861036892-627e0a291d35?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Eco-Kraft Packaging",
      price: "Custom Quote",
      desc: "Bao bì tái chế 100%. Mực in đậu nành.",
      image:
        "https://images.unsplash.com/photo-1632515904791-c2474db8069d?q=80&w=1200&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "Premium Stationaries",
      price: "From 89k",
      desc: "Sổ tay bìa da & Bút ký kim loại.",
      image:
        "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-32 bg-[#F9F8F6]">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="text-center mb-20">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase mb-4 block">
            Best Sellers
          </span>
          <h2 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Selected for Excellence.
          </h2>
          <p className="text-stone-500 max-w-lg mx-auto font-light">
            Những quy cách in ấn được các thương hiệu hàng đầu lựa chọn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-x-8 gap-y-16">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              {/* Image Container - Sharp Edges */}
              <div className="aspect-[3/4] overflow-hidden bg-stone-200 mb-8 relative">
                <ImageWithFallback
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                />
                {/* Minimal Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/10 backdrop-blur-[2px]">
                  <span className="bg-white text-stone-900 px-6 py-3 font-medium tracking-wide">
                    View Details
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex justify-between items-start border-t border-stone-300 pt-6">
                <div>
                  <h3 className="font-serif text-2xl text-stone-900 mb-1 group-hover:text-emerald-800 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-stone-500 text-sm font-light">
                    {product.desc}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-stone-900">
                  {product.price}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Button
            variant="outline"
            className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white rounded-none px-8 py-6 uppercase tracking-widest text-xs font-bold transition-all"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}
