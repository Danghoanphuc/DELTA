// apps/customer-frontend/src/features/rush/components/steps/CategorySelector.tsx
import { cn } from "@/shared/lib/utils";
// ✅ REUSE: Import dữ liệu gốc của toàn app
import { printzCategories } from "@/data/categories.data";

interface CategorySelectorProps {
  selected: string;
  onChange: (id: string) => void;
}

export const CategorySelector = ({ selected, onChange }: CategorySelectorProps) => {
  // Lọc ra những category có hỗ trợ in nhanh (nếu cần)
  // Ở đây tôi lấy hết, nhưng bạn có thể filter nếu muốn
  const categories = printzCategories.slice(0, 6); // Lấy 6 cái đầu cho gọn

  return (
    <div className="grid grid-cols-3 gap-3 mb-6 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.value)} // Lưu ý: dùng 'value' hoặc 'id' tùy theo setup data của bạn
          className={cn(
            "relative flex flex-col items-center justify-start p-3 rounded-xl border-2 transition-all duration-200 group h-auto min-h-[110px]",
            selected === cat.value
              ? "border-blue-600 bg-blue-50/50 shadow-md scale-[1.02]" 
              : "border-transparent bg-gray-50 hover:bg-white hover:border-gray-200 hover:shadow-sm"
          )}
        >
          {/* Reuse Image Logic from CategorySidebar */}
          <div className="w-14 h-14 mb-2 relative transition-transform duration-300 group-hover:scale-110">
             {cat.image ? (
               <img 
                 src={cat.image} 
                 alt={cat.label} 
                 className="w-full h-full object-contain mix-blend-multiply"
                 loading="lazy"
               />
             ) : (
               <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400">No img</div>
             )}
             
             {/* Checkmark khi active */}
             {selected === cat.value && (
               <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white">
                 <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                 </svg>
               </div>
             )}
          </div>

          <span className={cn(
            "text-xs font-bold text-center leading-tight transition-colors",
            selected === cat.value ? "text-blue-700" : "text-gray-700"
          )}>
            {cat.label}
          </span>
        </button>
      ))}
    </div>
  );
};