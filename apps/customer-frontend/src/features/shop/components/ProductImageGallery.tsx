// src/features/shop/components/ProductImageGallery.tsx
// ✅ TÁI CẤU TRÚC: Layout thumbnails bên trái + main image bên phải (giống Taobao)

import React, { useState } from "react";
import { PrinterProduct } from "@/types/product";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ProductImageGalleryProps {
  images: PrinterProduct["images"];
  name: string;
}

export const ProductImageGallery = ({
  images,
  name,
}: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const imageList =
    images && images.length > 0
      ? images
      : [{ url: "/placeholder-product.jpg" }];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  return (
    <>
      <div className="flex gap-4">
        {/* Thumbnails bên trái */}
        {imageList.length > 1 && (
          <div className="flex-shrink-0 w-20">
            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
              {imageList.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                    selectedIndex === index
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <ImageWithFallback
                    src={image.url}
                    alt={`${name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedIndex === index && (
                    <div className="absolute inset-0 bg-blue-600/10" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main image bên phải */}
        <div className="flex-1 relative group">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border shadow-inner relative cursor-zoom-in">
            <ImageWithFallback
              src={imageList[selectedIndex]?.url}
              alt={`${name} ảnh ${selectedIndex + 1}`}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              onClick={() => openLightbox(selectedIndex)}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
            </div>
          </div>

          {/* Navigation arrows (nếu có nhiều ảnh) */}
          {imageList.length > 1 && (
            <>
              {selectedIndex > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
                  onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              {selectedIndex < imageList.length - 1 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md"
                  onClick={() =>
                    setSelectedIndex((prev) => Math.min(imageList.length - 1, prev + 1))
                  }
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none">
          <DialogHeader className="sr-only">
            <DialogTitle>{name} - Ảnh {lightboxIndex + 1}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>

            {imageList.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 z-50 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 z-50 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center p-8">
              <ImageWithFallback
                src={imageList[lightboxIndex]?.url}
                alt={`${name} ảnh ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {imageList.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {lightboxIndex + 1} / {imageList.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
