import { printzCategories } from "@/data/categories.data";
import { cn } from "@/shared/lib/utils";
import { TrendingUp, Sparkles } from "lucide-react";

interface VisualCategoriesProps {
  selectedCategory: string;
  onSelectCategory: (value: string) => void;
}

export function VisualCategories({
  selectedCategory,
  onSelectCategory,
}: VisualCategoriesProps) {
  return (
    <section className="py-16 bg-stone-50 border-y border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-emerald-800 uppercase mb-4 block">
            Danh mục sản phẩm
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4 italic">
            Chọn theo nhu cầu
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Tất cả sản phẩm được thiết kế để xây dựng và bảo vệ thương hiệu của
            bạn
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {printzCategories.map((category) => {
            const isSelected = selectedCategory === category.value;
            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.value)}
                className={cn(
                  "group relative overflow-hidden bg-white border-2 transition-all duration-300 hover:shadow-xl",
                  isSelected
                    ? "border-emerald-800 shadow-lg"
                    : "border-stone-200 hover:border-stone-400"
                )}
              >
                {/* Image Section */}
                <div className="aspect-square p-8 flex items-center justify-center bg-gradient-to-br from-stone-50 to-white relative overflow-hidden">
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.label}
                      className={cn(
                        "w-full h-full object-contain transition-all duration-500 drop-shadow-sm",
                        isSelected
                          ? "scale-110 drop-shadow-lg"
                          : "group-hover:scale-110 group-hover:drop-shadow-lg"
                      )}
                    />
                  )}

                  {/* Badges */}
                  {category.trending && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                      <TrendingUp size={10} />
                      Hot
                    </div>
                  )}
                  {category.featured && (
                    <div className="absolute top-3 right-3 bg-emerald-800 text-white px-2 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                      <Sparkles size={10} />
                      New
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="p-6 border-t border-stone-100">
                  <h3
                    className={cn(
                      "font-bold text-lg mb-2 transition-colors",
                      isSelected
                        ? "text-emerald-800"
                        : "text-stone-900 group-hover:text-emerald-800"
                    )}
                  >
                    {category.label}
                  </h3>
                  <p className="text-sm text-stone-500 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">
                      {category.printerCount}+ nhà in
                    </span>
                    <span className="font-bold text-emerald-800">
                      {category.pricing.avgPrice}
                    </span>
                  </div>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 border-4 border-emerald-800 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
