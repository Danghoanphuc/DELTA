// CustomizationSection.tsx - Section 6: Cá nhân hóa
import { Product } from "@/types/product";

interface CustomizationSectionProps {
  product: Product;
}

export function CustomizationSection({ product }: CustomizationSectionProps) {
  return (
    <section
      data-section="6"
      className="relative py-24 opacity-0 transition-all duration-1000 min-h-screen flex items-center"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-6 text-center font-serif text-4xl md:text-5xl">
          Cá nhân hóa thương hiệu
        </h2>
        <p className="mb-16 text-center font-light italic text-stone-600 text-xl">
          "Chúng tôi không in logo lên tác phẩm nghệ thuật,
          <br />
          chúng tôi khắc ghi dấu ấn thương hiệu của bạn lên sự trân trọng."
        </p>

        {/* Carousel/Grid of packaging images */}
        {product.images && product.images.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {product.images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="relative h-[300px] overflow-hidden rounded-lg group"
              >
                <img
                  src={img.url}
                  alt={`Packaging ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </div>
            ))}
          </div>
        )}

        {/* Customization options */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-3">
              Logo khắc nổi
            </h4>
            <p className="text-stone-600 text-sm">
              Khắc logo thương hiệu trực tiếp lên bề mặt sản phẩm với độ sâu
              0.5-1mm, tạo hiệu ứng nổi sang trọng
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-3">
              Hộp quà cao cấp
            </h4>
            <p className="text-stone-600 text-sm">
              Thiết kế hộp gỗ hoặc vải lụa với logo dập nổi, kèm thiệp chúc mừng
              cá nhân hóa
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h4 className="font-serif text-xl font-bold text-stone-900 mb-3">
              Thông điệp riêng
            </h4>
            <p className="text-stone-600 text-sm">
              Khắc thông điệp, slogan hoặc lời chúc đặc biệt theo yêu cầu của
              doanh nghiệp
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
