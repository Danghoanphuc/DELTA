// src/components/ProductQuickViewModal.tsx
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
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
import { useGlobalModalContext } from "@/contexts/GlobalModalProvider";
import { Loader2, ArrowRight } from "lucide-react";

const QuickViewContent = () => {
  const { isQuickViewLoading, quickViewProductData, closeQuickView } =
    useGlobalModalContext();
  const product = quickViewProductData;

  if (isQuickViewLoading || !product) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  const lowestPrice =
    product.pricing.reduce(
      (min, p) => Math.min(min, p.pricePerUnit),
      Infinity
    ) || 0;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* 1. Carousel: Vuông vức */}
      <div className="bg-stone-100 aspect-square relative group">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {(product.images?.length
              ? product.images
              : [{ url: "/placeholder.jpg" }]
            ).map((img, idx) => (
              <CarouselItem key={idx}>
                <ImageWithFallback
                  src={img.url}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 bg-white/80 border-none rounded-none hover:bg-primary hover:text-white" />
          <CarouselNext className="right-2 bg-white/80 border-none rounded-none hover:bg-primary hover:text-white" />
        </Carousel>
      </div>

      {/* 2. Info: Editorial Style */}
      <div className="flex flex-col justify-center">
        <div className="mb-6 border-b border-stone-200 pb-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400 block mb-2">
            Product Detail
          </span>
          <h2 className="font-serif text-3xl font-bold text-stone-900 leading-tight mb-2">
            {product.name}
          </h2>
          <p className="text-xs font-sans text-stone-500">
            Provided by:{" "}
            <span className="font-bold text-stone-700">
              {product.printerInfo?.businessName || "PrintZ"}
            </span>
          </p>
        </div>

        <div className="mb-8">
          <p className="font-sans text-2xl font-bold text-primary">
            {lowestPrice.toLocaleString("vi-VN")}
            <span className="text-sm font-normal text-stone-400 ml-1">
              VND / unit
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            asChild
            className="w-full bg-stone-900 hover:bg-primary text-white rounded-none h-12 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <Link to={`/products/${product._id}`}>
              Xem chi tiết <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={closeQuickView}
            className="w-full border-stone-200 hover:border-stone-900 hover:bg-transparent text-stone-600 rounded-none h-10 text-xs uppercase tracking-widest"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ProductQuickViewModal = () => {
  const { quickViewProductId, closeQuickView } = useGlobalModalContext();

  return (
    <Dialog
      open={!!quickViewProductId}
      onOpenChange={(o) => !o && closeQuickView()}
    >
      <DialogContent className="max-w-4xl p-0 bg-[#F9F8F6] border border-stone-200 shadow-2xl rounded-none overflow-hidden gap-0">
        <div className="p-8 md:p-10">
          <QuickViewContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};
