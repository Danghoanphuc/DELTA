import { Button } from "@/shared/components/ui/button";
import { Package, Gift, Briefcase, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";

interface Collection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  items: string[];
  price: string;
  image: string;
  icon: any;
  color: string;
}

const collections: Collection[] = [
  {
    id: "welcome-kit",
    title: "Bộ chào mừng nhân viên mới",
    subtitle: "Welcome Kit",
    description:
      "Tạo ấn tượng ngay từ ngày đầu tiên. Bộ quà tặng hoàn chỉnh cho nhân viên mới.",
    items: [
      "Sổ tay in logo",
      "Bút ký cao cấp",
      "Áo đồng phục",
      "Bình giữ nhiệt",
    ],
    price: "Từ 500.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop",
    icon: Package,
    color: "emerald",
  },
  {
    id: "event-gift",
    title: "Bộ quà tặng Sự kiện",
    subtitle: "Event Package",
    description:
      "Gói quà tặng cho hội nghị, hội thảo, team building. Tăng nhận diện thương hiệu.",
    items: [
      "Dây đeo thẻ in logo",
      "Sticker thương hiệu",
      "Bình nước",
      "Túi tote canvas",
    ],
    price: "Từ 300.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop",
    icon: Gift,
    color: "blue",
  },
  {
    id: "client-gift",
    title: "Bộ quà tri ân khách hàng",
    subtitle: "Client Appreciation",
    description:
      "Thể hiện sự trân trọng với khách hàng VIP. Bao bì cao cấp, thiết kế sang trọng.",
    items: ["Hộp quà cao cấp", "Lịch để bàn", "Sổ tay da", "Bút ký kim loại"],
    price: "Từ 800.000đ/bộ",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1200&auto=format&fit=crop",
    icon: Briefcase,
    color: "amber",
  },
];

export function CuratedCollections() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase mb-4 block">
            Bộ sưu tập được tuyển chọn
          </span>
          <h2 className="font-serif text-4xl md:text-6xl text-stone-900 mb-6 italic">
            Giải pháp trọn gói
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Không cần tìm kiếm từng sản phẩm. Chúng tôi đã tuyển chọn sẵn các bộ
            quà tặng hoàn chỉnh cho doanh nghiệp.
          </p>
        </div>

        <div className="space-y-12">
          {collections.map((collection, index) => {
            const Icon = collection.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={collection.id}
                className={`group grid md:grid-cols-2 gap-8 items-center ${
                  isEven ? "" : "md:grid-flow-dense"
                }`}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden bg-stone-100 ${
                    isEven ? "" : "md:col-start-2"
                  }`}
                >
                  <div className="aspect-[4/3]">
                    <ImageWithFallback
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {/* Overlay Badge */}
                  <div
                    className={`absolute top-6 left-6 bg-${collection.color}-800 text-white px-4 py-2 rounded-full flex items-center gap-2`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-bold uppercase tracking-wider">
                      {collection.subtitle}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className={isEven ? "" : "md:col-start-1 md:row-start-1"}>
                  <h3 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4 italic">
                    {collection.title}
                  </h3>
                  <p className="text-stone-600 text-lg mb-6 leading-relaxed">
                    {collection.description}
                  </p>

                  {/* Items List */}
                  <div className="mb-6 space-y-2">
                    <p className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-3">
                      Bao gồm:
                    </p>
                    <ul className="space-y-2">
                      {collection.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-stone-700"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-2xl font-bold text-stone-900">
                      {collection.price}
                    </span>
                    <Button className="bg-stone-900 hover:bg-emerald-900 text-white rounded-none px-6 py-5 font-bold uppercase text-xs">
                      Xem chi tiết <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center p-12 bg-stone-50 border border-stone-200">
          <h3 className="font-serif text-3xl text-stone-900 mb-4 italic">
            Cần tùy chỉnh riêng?
          </h3>
          <p className="text-stone-600 mb-6 max-w-xl mx-auto">
            Đội ngũ Printz Studio sẵn sàng tư vấn và thiết kế bộ quà tặng phù
            hợp với thương hiệu của bạn.
          </p>
          <Button
            variant="outline"
            className="border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white rounded-none px-8 py-6 uppercase tracking-widest text-xs font-bold"
          >
            Liên hệ tư vấn
          </Button>
        </div>
      </div>
    </section>
  );
}
