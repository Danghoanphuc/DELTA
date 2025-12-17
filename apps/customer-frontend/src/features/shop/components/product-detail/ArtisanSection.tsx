// ArtisanSection.tsx - Section 7: Nghệ nhân & Social Proof
import { Product } from "@/types/product";

interface ArtisanSectionProps {
  product: Product;
}

export function ArtisanSection({ product }: ArtisanSectionProps) {
  return (
    <section
      data-section="7"
      className="relative bg-stone-900 py-24 text-white opacity-0 transition-all duration-1000 min-h-screen flex items-center"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Nghệ nhân */}
          <div className="text-center">
            <h3 className="mb-6 font-serif text-3xl">Nghệ nhân</h3>
            <div className="mb-4 h-48 w-48 mx-auto rounded-full bg-stone-700 overflow-hidden">
              {product.images?.[0] && (
                <img
                  src={product.images[0].url}
                  alt="Nghệ nhân"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <p className="mb-2 font-serif text-2xl">Nguyễn Văn A</p>
            <p className="text-sm text-stone-400 mb-4">
              Nghệ nhân ưu tú - Bát Tràng
            </p>
            <p className="text-stone-300 text-sm max-w-md mx-auto">
              Với hơn 30 năm kinh nghiệm trong nghề gốm sứ, nghệ nhân Nguyễn Văn
              A đã tạo ra hàng nghìn tác phẩm độc đáo, được trưng bày tại nhiều
              bảo tàng và triển lãm quốc tế.
            </p>
          </div>

          {/* Khách hàng */}
          <div className="text-center">
            <h3 className="mb-6 font-serif text-3xl">Khách hàng tin dùng</h3>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="h-16 w-32 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs text-stone-400">Viettel</span>
              </div>
              <div className="h-16 w-32 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs text-stone-400">VinGroup</span>
              </div>
              <div className="h-16 w-32 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs text-stone-400">FPT</span>
              </div>
              <div className="h-16 w-32 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs text-stone-400">Techcombank</span>
              </div>
              <div className="h-16 w-32 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs text-stone-400">Masan</span>
              </div>
              <div className="h-16 w-32 rounded bg-white/10 flex items-center justify-center">
                <span className="text-xs text-stone-400">Vinamilk</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-stone-400">
              Được tin dùng bởi hơn 200+ doanh nghiệp hàng đầu Việt Nam
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
