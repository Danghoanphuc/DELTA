// apps/customer-frontend/src/features/magazine/components/CategoryCTABox.tsx
// CTA Box riêng cho từng danh mục bài viết - Tối ưu chuyển đổi

import {
  MessageCircle,
  Gem,
  Leaf,
  Droplets,
  Flame,
  Mountain,
  BookOpen,
  Users,
  Landmark,
} from "lucide-react";

// Zalo link chung
const ZALO_LINK = "https://zalo.me/0865726848";

// CTA data cho từng danh mục
const CTA_DATA: Record<
  string,
  {
    icon: React.ElementType;
    title: string;
    content: string;
    buttonText: string;
    buttonLink: string;
    bgGradient: string;
    accentColor: string;
  }
> = {
  // === 3 TRỤ CỘT TINH THẦN ===
  "triet-ly-song": {
    icon: Leaf,
    title: "Tìm kiếm sự cân bằng trong quà tặng?",
    content:
      "Mỗi món quà là một thông điệp. Hãy để tôi giúp bạn chọn những tác phẩm mang triết lý sống sâu sắc, phù hợp với giá trị doanh nghiệp của bạn.",
    buttonText: "Tư vấn Triết lý Quà tặng",
    buttonLink: ZALO_LINK,
    bgGradient: "from-emerald-50 to-teal-50",
    accentColor: "emerald",
  },
  "goc-giam-tuyen": {
    icon: Users,
    title: "Kết nối trực tiếp với Giám tuyển Đặng Hoàn Phúc",
    content:
      "Không qua Sale, không qua trợ lý. Trực tiếp tôi sẽ lắng nghe nhu cầu và thiết kế giải pháp quà tặng riêng cho doanh nghiệp của bạn.",
    buttonText: "Kết nối Zalo với tôi",
    buttonLink: ZALO_LINK,
    bgGradient: "from-purple-50 to-violet-50",
    accentColor: "purple",
  },
  "cau-chuyen-di-san": {
    icon: Landmark,
    title: "Sở hữu một phần lịch sử ngàn năm",
    content:
      "Mỗi tác phẩm bạn chọn là một hành động góp phần giữ lửa làng nghề. Nhận ngay 'Chứng thư Giám định' có chữ ký nghệ nhân khi đặt hàng hôm nay.",
    buttonText: "Sưu tầm Di sản ngay",
    buttonLink: ZALO_LINK,
    bgGradient: "from-amber-50 to-orange-50",
    accentColor: "amber",
  },

  // === 5 TRỤ CỘT NGŨ HÀNH ===
  "ngu-hanh-kim": {
    icon: Gem,
    title: "Gốm sứ - Tinh hoa đất trời kết tinh",
    content:
      "Từ Bát Tràng đến Chu Đậu, mỗi tác phẩm gốm sứ là kết tinh của lửa và đất. Sở hữu bộ sưu tập độc bản cho doanh nghiệp của bạn.",
    buttonText: "Khám phá Gốm Sứ cao cấp",
    buttonLink: ZALO_LINK,
    bgGradient: "from-sky-50 to-blue-50",
    accentColor: "sky",
  },
  "ngu-hanh-moc": {
    icon: Leaf,
    title: "Trà & Hương - Nghệ thuật tĩnh tại",
    content:
      "Tặng trà là tặng sự bình an. Bộ quà trà đạo và hương liệu cao cấp - lựa chọn tinh tế cho đối tác quan trọng.",
    buttonText: "Chọn bộ Trà & Hương",
    buttonLink: ZALO_LINK,
    bgGradient: "from-green-50 to-emerald-50",
    accentColor: "green",
  },
  "ngu-hanh-thuy": {
    icon: Droplets,
    title: "Lụa & Vải - Mềm mại, sang trọng",
    content:
      "Lụa Vạn Phúc, thổ cẩm Tây Bắc - những sợi tơ mang hồn Việt. Quà tặng lụa cao cấp cho đối tác nữ và khách quốc tế.",
    buttonText: "Xem bộ sưu tập Lụa",
    buttonLink: ZALO_LINK,
    bgGradient: "from-blue-50 to-indigo-50",
    accentColor: "blue",
  },
  "ngu-hanh-hoa": {
    icon: Flame,
    title: "Sơn mài & Gỗ - Lửa nghề trăm năm",
    content:
      "40 lớp sơn, 6 tháng hoàn thiện. Sơn mài Việt Nam là nghệ thuật của sự kiên nhẫn. Đặt hàng tác phẩm độc bản cho doanh nghiệp.",
    buttonText: "Đặt Sơn mài độc bản",
    buttonLink: ZALO_LINK,
    bgGradient: "from-orange-50 to-red-50",
    accentColor: "orange",
  },
  "ngu-hanh-tho": {
    icon: Mountain,
    title: "Đá & Thủ công - Vững chãi, trường tồn",
    content:
      "Từ đá Non Nước đến mây tre đan Phú Vinh. Quà tặng thủ công mỹ nghệ - biểu tượng của sự bền vững và khéo léo.",
    buttonText: "Khám phá Thủ công Việt",
    buttonLink: ZALO_LINK,
    bgGradient: "from-stone-100 to-amber-50",
    accentColor: "stone",
  },
};

// Fallback CTA cho các category không có trong danh sách
const DEFAULT_CTA = {
  icon: BookOpen,
  title: "Cần tư vấn quà tặng doanh nghiệp?",
  content:
    "Đội ngũ Printz sẵn sàng hỗ trợ bạn chọn lựa những món quà phù hợp nhất với văn hóa và ngân sách doanh nghiệp.",
  buttonText: "Liên hệ tư vấn ngay",
  buttonLink: ZALO_LINK,
  bgGradient: "from-stone-50 to-stone-100",
  accentColor: "stone",
};

interface CategoryCTABoxProps {
  category?: string;
}

export function CategoryCTABox({ category }: CategoryCTABoxProps) {
  const cta = category ? CTA_DATA[category] || DEFAULT_CTA : DEFAULT_CTA;
  const Icon = cta.icon;

  // Dynamic accent colors
  const accentClasses: Record<
    string,
    { border: string; icon: string; button: string; buttonHover: string }
  > = {
    emerald: {
      border: "border-emerald-200",
      icon: "text-emerald-600 bg-emerald-100",
      button: "bg-emerald-700 hover:bg-emerald-800",
      buttonHover: "hover:shadow-emerald-200",
    },
    purple: {
      border: "border-purple-200",
      icon: "text-purple-600 bg-purple-100",
      button: "bg-purple-700 hover:bg-purple-800",
      buttonHover: "hover:shadow-purple-200",
    },
    amber: {
      border: "border-amber-200",
      icon: "text-amber-700 bg-amber-100",
      button: "bg-amber-700 hover:bg-amber-800",
      buttonHover: "hover:shadow-amber-200",
    },
    sky: {
      border: "border-sky-200",
      icon: "text-sky-600 bg-sky-100",
      button: "bg-sky-700 hover:bg-sky-800",
      buttonHover: "hover:shadow-sky-200",
    },
    green: {
      border: "border-green-200",
      icon: "text-green-600 bg-green-100",
      button: "bg-green-700 hover:bg-green-800",
      buttonHover: "hover:shadow-green-200",
    },
    blue: {
      border: "border-blue-200",
      icon: "text-blue-600 bg-blue-100",
      button: "bg-blue-700 hover:bg-blue-800",
      buttonHover: "hover:shadow-blue-200",
    },
    orange: {
      border: "border-orange-200",
      icon: "text-orange-600 bg-orange-100",
      button: "bg-orange-700 hover:bg-orange-800",
      buttonHover: "hover:shadow-orange-200",
    },
    stone: {
      border: "border-stone-300",
      icon: "text-stone-600 bg-stone-200",
      button: "bg-stone-800 hover:bg-stone-900",
      buttonHover: "hover:shadow-stone-200",
    },
  };

  const colors = accentClasses[cta.accentColor] || accentClasses.stone;

  return (
    <div
      className={`my-12 p-8 rounded-2xl bg-gradient-to-br ${cta.bgGradient} border ${colors.border} shadow-sm`}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-xl ${colors.icon} flex items-center justify-center`}
        >
          <Icon className="w-7 h-7" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-serif text-xl md:text-2xl font-semibold text-stone-900 mb-3 leading-tight">
            {cta.title}
          </h3>
          <p className="text-stone-600 leading-relaxed mb-6">{cta.content}</p>

          {/* CTA Button */}
          <a
            href={cta.buttonLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-6 py-3 ${colors.button} text-white font-medium rounded-lg shadow-lg ${colors.buttonHover} transition-all duration-300`}
          >
            <MessageCircle className="w-5 h-5" />
            {cta.buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}
