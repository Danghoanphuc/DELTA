// frontend/src/components/CategoryCards.tsx (RESPONSIVE)
import {
  FileText,
  CreditCard,
  BookOpen,
  FileSpreadsheet,
  Package,
  Sticker,
  Book,
  Sparkles,
} from "lucide-react";

export function CategoryCards() {
  const categories = [
    {
      name: "In Poster",
      icon: FileText,
      color: "from-sky-400 to-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      name: "In Danh thiếp",
      icon: CreditCard,
      color: "from-cyan-400 to-sky-500",
      bgColor: "bg-cyan-50",
    },
    {
      name: "In Brochure",
      icon: BookOpen,
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-indigo-50",
    },
    {
      name: "In Tờ rơi",
      icon: FileSpreadsheet,
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-emerald-50",
    },
    {
      name: "In Hộp",
      icon: Package,
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
    },
    {
      name: "In Sticker",
      icon: Sticker,
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-50",
    },
    {
      name: "In Catalogue",
      icon: Book,
      color: "from-sky-400 to-blue-600",
      bgColor: "bg-sky-50",
    },
    {
      name: "Thiết kế mới",
      icon: Sparkles,
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="w-full px-4 md:px-8">
      <h2 className="mb-3 text-gray-800 font-semibold text-base md:text-lg">
        Khám phá kho mẫu
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-3">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`${category.bgColor} rounded-xl md:rounded-2xl p-3 md:p-4 flex items-center justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-gray-200 hover:border-blue-100`}
          >
            <h3 className="text-gray-800 font-medium text-xs md:text-sm">
              {category.name}
            </h3>
            <div
              className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-md`}
            >
              <category.icon size={20} className="text-white md:w-6 md:h-6" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
