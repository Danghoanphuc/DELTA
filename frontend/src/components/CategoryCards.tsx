// frontend/src/components/CategoryCards.tsx (MOBILE OPTIMIZED)
import {
  FileText,
  CreditCard,
  BookOpen,
  FileSpreadsheet,
  Package,
  Sticker,
  Book,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function CategoryCards() {
  const [activeTab, setActiveTab] = useState("kho-mau");

  const categories = [
    {
      name: "In Poster",
      icon: FileText,
      color: "from-sky-400 to-blue-500",
      bgColor: "bg-blue-50",
      hoverBorder: "hover:border-blue-300",
      count: "120+ mẫu",
    },
    {
      name: "In Danh thiếp",
      icon: CreditCard,
      color: "from-cyan-400 to-sky-500",
      bgColor: "bg-cyan-50",
      hoverBorder: "hover:border-cyan-300",
      count: "85+ mẫu",
    },
    {
      name: "In Brochure",
      icon: BookOpen,
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-indigo-50",
      hoverBorder: "hover:border-indigo-300",
      count: "95+ mẫu",
    },
    {
      name: "In Tờ rơi",
      icon: FileSpreadsheet,
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-emerald-50",
      hoverBorder: "hover:border-emerald-300",
      count: "110+ mẫu",
    },
    {
      name: "In Hộp",
      icon: Package,
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
      hoverBorder: "hover:border-amber-300",
      count: "65+ mẫu",
    },
    {
      name: "In Sticker",
      icon: Sticker,
      color: "from-pink-400 to-rose-500",
      bgColor: "bg-pink-50",
      hoverBorder: "hover:border-pink-300",
      count: "75+ mẫu",
    },
    {
      name: "In Catalogue",
      icon: Book,
      color: "from-sky-400 to-blue-600",
      bgColor: "bg-sky-50",
      hoverBorder: "hover:border-sky-300",
      count: "50+ mẫu",
    },
    {
      name: "Thiết kế mới",
      icon: Sparkles,
      color: "from-blue-400 to-cyan-500",
      bgColor: "bg-blue-50",
      hoverBorder: "hover:border-cyan-300",
      count: "Tùy chỉnh",
    },
  ];

  const tabs = [
    {
      id: "kho-mau",
      label: "🎨 Kho mẫu",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: "xu-huong",
      label: "🔥 Xu hướng",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "don-hang",
      label: "📦 Đơn hàng",
      color: "gray",
      gradient: "from-gray-500 to-slate-500",
    },
  ];

  return (
    <div className="w-full px-3 md:px-8 mt-2 md:mt-0">
      {/* Quick Action Tabs - Mobile Optimized */}
      <motion.div
        className="relative mb-5 md:mb-6"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Mobile: Horizontal Scroll | Desktop: Center Flex */}
        <div className="md:flex md:items-center md:justify-center md:gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <div className="flex gap-2 md:gap-4 min-w-max md:min-w-0 px-1">
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.2 + index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 md:px-6 py-2.5 md:py-2 rounded-full border-2 transition-all text-sm touch-manipulation whitespace-nowrap ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} border-transparent text-white shadow-lg`
                    : `border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100`
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Scroll indicator on mobile */}
        <div className="md:hidden flex justify-center mt-2 gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`h-1 rounded-full transition-all ${
                activeTab === tab.id
                  ? "w-6 bg-gradient-to-r " + tab.gradient
                  : "w-1 bg-gray-300"
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Header with see all button */}
      <motion.div
        className="flex items-center justify-between mb-3 md:mb-4"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-gray-800 text-base md:text-lg">Khám phá kho mẫu</h2>
        <button className="text-indigo-600 text-xs md:text-sm flex items-center gap-1 hover:gap-2 transition-all active:scale-95 touch-manipulation">
          Xem tất cả
          <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
        </button>
      </motion.div>

      {/* Categories Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3 pb-4">
        {categories.map((category, index) => (
          <motion.button
            key={index}
            initial={{ scale: 0, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              delay: 0.6 + index * 0.08,
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            whileHover={{
              y: -8,
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.96 }}
            className={`${category.bgColor} rounded-2xl md:rounded-3xl p-3.5 md:p-4 flex flex-col gap-3 border-2 border-gray-200/50 ${category.hoverBorder} active:border-gray-300 relative overflow-hidden group touch-manipulation min-h-[120px] md:min-h-[140px] shadow-sm hover:shadow-md transition-all`}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/30 to-transparent opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />

            {/* Icon with pulse effect */}
            <motion.div
              className={`w-11 h-11 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center shadow-lg shadow-black/10 relative z-10 self-end`}
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                scale: 1.1,
                transition: { duration: 0.5 },
              }}
            >
              <category.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </motion.div>

            {/* Text content */}
            <div className="flex flex-col items-start text-left gap-1 relative z-10">
              <h3 className="text-gray-800 text-sm md:text-base leading-tight">
                {category.name}
              </h3>
              <p className="text-[10px] md:text-xs text-gray-500">
                {category.count}
              </p>
            </div>

            {/* Subtle shine effect */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100"
              initial={false}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
