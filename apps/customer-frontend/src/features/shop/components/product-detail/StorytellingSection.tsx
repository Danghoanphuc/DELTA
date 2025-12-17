// StorytellingSection.tsx - Sections 2 & 3: Nguyên liệu & Quy trình
import { Product } from "@/types/product";

interface StorytellingMaterialSectionProps {
  product: Product;
}

export function StorytellingMaterialSection({
  product,
}: StorytellingMaterialSectionProps) {
  return (
    <section
      data-section="2"
      className="relative bg-stone-100 py-24 min-h-screen flex items-center opacity-0 transition-all duration-1000"
    >
      <div className="mx-auto max-w-7xl px-6 w-full">
        <h2 className="mb-16 text-center font-serif text-4xl md:text-5xl">
          Hành trình tạo tác
        </h2>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h3 className="mb-4 font-serif text-3xl text-amber-900">
              Chọn lựa nguyên liệu
            </h3>
            <p className="mb-4 leading-relaxed text-stone-600">
              Mỗi tác phẩm bắt đầu từ việc tuyển chọn nguyên liệu thô. Đất sét
              cao lanh được khai thác từ mỏ Bát Tràng, trải qua quá trình lọc
              tạp chất thủ công kéo dài 3 tuần.
            </p>
            <p className="leading-relaxed text-stone-600">
              Chỉ những viên đất đạt độ mịn và độ ẩm chuẩn mới được chọn để ủ
              thêm 5 năm, tạo nên độ dẻo dai và bền vững cho sản phẩm cuối cùng.
            </p>
          </div>
          <div className="order-1 md:order-2">
            {product.images?.[1] && (
              <img
                src={product.images[1].url}
                alt="Nguyên liệu"
                className="h-[400px] w-full rounded-lg object-cover shadow-2xl"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function StorytellingProcessSection({
  product,
}: StorytellingMaterialSectionProps) {
  return (
    <section
      data-section="3"
      className="relative bg-stone-100 py-24 min-h-screen flex items-center opacity-0 transition-all duration-1000"
    >
      <div className="mx-auto max-w-7xl px-6 w-full">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            {product.images?.[2] && (
              <img
                src={product.images[2].url}
                alt="Quy trình"
                className="h-[400px] w-full rounded-lg object-cover shadow-2xl"
              />
            )}
          </div>
          <div>
            <h3 className="mb-4 font-serif text-3xl text-amber-900">
              Tạo hình & Trang trí
            </h3>
            <p className="mb-4 leading-relaxed text-stone-600">
              Nghệ nhân sử dụng bàn xoay thủ công để tạo hình từng chi tiết. Mỗi
              đường nét, mỗi họa tiết đều được vẽ tay bằng cọ lông chồn tự
              nhiên.
            </p>
            <p className="leading-relaxed text-stone-600">
              Sau khi hoàn thiện, tác phẩm được phơi khô tự nhiên trong 7 ngày
              trước khi vào lò nung ở nhiệt độ 1300°C. Quá trình nung kéo dài 48
              giờ, biến đất thành đá, tạo nên độ bền vượt thời gian.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
