// ApplicationSection.tsx - Section 5: Ứng dụng & Ý nghĩa
import { Building2, Sparkles, Award } from "lucide-react";
import { Product } from "@/types/product";

interface ApplicationSectionProps {
  product: Product;
}

export function ApplicationSection({ product }: ApplicationSectionProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <section
      data-section="5"
      className="relative bg-stone-100 py-24 opacity-0 transition-all duration-1000 min-h-screen flex items-center"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Lifestyle Image */}
          <div>
            {product.images?.[3] && (
              <img
                src={product.images[3].url}
                alt="Lifestyle"
                className="h-[500px] w-full rounded-lg object-cover shadow-2xl"
              />
            )}
          </div>

          {/* Text Content */}
          <div className="flex flex-col justify-center">
            <h2 className="mb-6 font-serif text-4xl">
              Ứng dụng trong không gian doanh nghiệp
            </h2>
            <div className="mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="mt-1 h-5 w-5 text-amber-700" />
                <div>
                  <h4 className="font-bold text-stone-900">Vị trí đặt</h4>
                  <p className="text-stone-600">
                    Bàn làm việc CEO, Kệ sách phía sau ghế ngồi (Tựa sơn)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="mt-1 h-5 w-5 text-amber-700" />
                <div>
                  <h4 className="font-bold text-stone-900">
                    Ý nghĩa phong thủy
                  </h4>
                  <p className="text-stone-600">
                    Hợp mệnh Thổ, Kim. Thu hút tài lộc, gia cố vị thế, giữ được
                    sự điềm tĩnh
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="mt-1 h-5 w-5 text-amber-700" />
                <div>
                  <h4 className="font-bold text-stone-900">Thông điệp</h4>
                  <p className="text-stone-600">
                    Món quà thể hiện sự trân trọng và đẳng cấp của doanh nghiệp
                  </p>
                </div>
              </div>
            </div>
            <p className="italic text-stone-500">
              Giá trị:{" "}
              {product.pricing?.[0]?.pricePerUnit
                ? formatPrice(product.pricing[0].pricePerUnit)
                : "Liên hệ"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
