// GallerySection.tsx - Section 4: Chi tiết & Thư viện ảnh
import { Download, Award } from "lucide-react";
import { Product } from "@/types/product";

interface GallerySectionProps {
  product: Product;
}

export function GallerySection({ product }: GallerySectionProps) {
  return (
    <section
      data-section="4"
      className="relative py-24 min-h-screen flex items-center bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 w-full">
        <h2 className="mb-16 text-center font-serif text-4xl md:text-5xl text-stone-900">
          Chi tiết tác phẩm
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* LEFT: Thông tin chi tiết & Downloads */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-amber-900 mb-6">
              Tài liệu & Chứng thực
            </h3>

            {/* Download Cards */}
            <div className="space-y-4">
              {/* Hồ sơ tác phẩm */}
              <div className="w-full p-6 bg-white border-2 border-stone-200 rounded-lg hover:border-amber-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Download className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                      Hồ Sơ Tác Phẩm (PDF)
                    </h4>
                    <p className="text-sm text-stone-600 mb-2">
                      Thông tin chi tiết về quy trình chế tác, nguyên liệu, kỹ
                      thuật
                    </p>
                    <span className="text-xs font-mono text-amber-700 uppercase tracking-wider">
                      Tải xuống →
                    </span>
                  </div>
                </div>
              </div>

              {/* E-Catalogue */}
              <div className="w-full p-6 bg-white border-2 border-stone-200 rounded-lg hover:border-amber-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Download className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                      E-Catalogue
                    </h4>
                    <p className="text-sm text-stone-600 mb-2">
                      Catalogue điện tử với hình ảnh chất lượng cao
                    </p>
                    <span className="text-xs font-mono text-amber-700 uppercase tracking-wider">
                      Tải xuống →
                    </span>
                  </div>
                </div>
              </div>

              {/* Chứng thực */}
              <div className="w-full p-6 bg-white border-2 border-stone-200 rounded-lg hover:border-amber-600 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <Award className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                      Chứng Thực Nguồn Gốc
                    </h4>
                    <p className="text-sm text-stone-600 mb-2">
                      Giấy chứng nhận xuất xứ và chất lượng
                    </p>
                    <span className="text-xs font-mono text-amber-700 uppercase tracking-wider">
                      Xem chi tiết →
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="mt-8 p-6 bg-stone-50 rounded-lg">
              <h4 className="font-serif text-lg font-bold text-stone-900 mb-4">
                Thông số kỹ thuật
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Chất liệu:</span>
                  <span className="font-medium text-stone-900">
                    {product?.specifications?.material || "Gốm sứ cao cấp"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Kích thước:</span>
                  <span className="font-medium text-stone-900">
                    {product?.specifications?.size || "Đa dạng"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Thư viện ảnh */}
          <div>
            <h3 className="font-serif text-2xl text-amber-900 mb-6">
              Thư viện hình ảnh
            </h3>

            {/* Main Image */}
            <div className="mb-4 h-[400px] overflow-hidden rounded-lg bg-stone-100">
              {product?.images?.[0] ? (
                <img
                  src={product.images[0].url}
                  alt="Main product"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400">
                  Không có hình ảnh
                </div>
              )}
            </div>

            {/* Thumbnail Grid */}
            {product?.images && product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {product.images.slice(1, 7).map((img, idx) => (
                  <div
                    key={idx}
                    className="h-[120px] overflow-hidden rounded-lg bg-stone-100"
                  >
                    <img
                      src={img.url}
                      alt={`Gallery ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* View all button */}
            {product?.images && product.images.length > 7 && (
              <button className="mt-4 w-full py-3 border-2 border-stone-300 rounded-lg text-stone-700 font-medium hover:border-amber-600 hover:text-amber-900 transition-colors">
                Xem tất cả {product.images.length} ảnh
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
