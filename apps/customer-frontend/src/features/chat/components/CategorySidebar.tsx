// features/chat/components/CategorySidebar.tsx
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface Category {
  label: string;
  value: string;
  image?: string;
}

export const CategorySidebar = ({
  className = "",
  isMobileGrid = false,
}: {
  className?: string;
  isMobileGrid?: boolean;
}) => {
  const defaultCategories: Category[] = [
    {
      label: "Bao thư, bao lì xì",
      value: "holiday-cards",
      image:
        "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385804/bao_th%C6%B0_bao_li%CC%80_xi%CC%80_biesjs.svg",
    },
    { label: "Lịch & Quà tặng", value: "calendar-gifts",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763381378/Calendar_and_Gifts_Icon_in_Mint_and_Blush_rs5zks.svg"
     },
    { label: "Danh thiếp & Thẻ", value: "business-cards",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763386452/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_4_zw10gs.svg"
     },
    { label: "Quảng cáo in ấn", value: "postcards-marketing",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763386942/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_5_lgldk1.svg"
     },
    {
      label: "Bảng hiệu, biểu ngữ",
      value: "signage-banners-posters",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763386922/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_6_imoupw.svg"
    },
    { label: "Nhãn dán & nhãn", value: "labels-stickers",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763387243/nha%CC%83n_da%CC%81n_pezqf5.svg"
     },
    { label: "Túi Tote", value: "Tote-bags",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763387284/Thi%E1%BA%BFt_k%E1%BA%BF_ch%C6%B0a_c%C3%B3_t%C3%AAn_2_q1c7pf.svg"
     },
    { label: "Sản phẩm khuyến mại", value: "promotional-products",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763385803/sa%CC%89n_ph%C3%A2%CC%89m_khuy%C3%AA%CC%81n_ma%CC%83i_rupn6q.svg"
     },
    { label: "Bao bì", value: "packaging",
      image:"https://res.cloudinary.com/da3xfws3n/image/upload/v1763385799/%C4%90o%CC%81ng_go%CC%81i_zbdloi.svg"
     },
   
  ];

  // ✅ SỬA 1: Đổi slice từ 10 (cho 5 cột) thành 8 (cho 4 cột)
  const displayCategories = defaultCategories.slice(0, isMobileGrid ? 9 : 12);

  return (
    <aside
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3",
        isMobileGrid
          ? "bg-transparent border-none p-0 space-y-3"
          : "max-h-[calc(100vh-6rem)] overflow-auto",
        className
      )}
    >
      {!isMobileGrid && <div className="text-sm font-semibold mb-2">Danh mục sản phẩm</div>}
      
      {/* ✅ SỬA 2: Đổi "grid-cols-5" -> "grid-cols-4" (để nới rộng) */}
      <div
        className={cn(
          isMobileGrid ? "grid grid-cols-3 gap-3 pt-0" : "space-y-1"
        )}
      >
        
        {displayCategories.map((c) => (
          <Button
            key={c.value}
            asChild
            variant="ghost"
            className={cn(
              "text-gray-700 h-auto",
              isMobileGrid
                // (Giữ các bản vá cũ: w-full, whitespace-normal, gỡ items-center)
                ? "flex-col justify-center px-2 py-0.5 w-full whitespace-normal gap-1"
                : "w-full justify-start"
            )}
          >
            <a href={`/shop?category=${encodeURIComponent(c.value)}`}>
              <div
                className={cn(
                  isMobileGrid
                    ? "flex flex-col items-center gap-1.5 w-full"
                    : "flex items-center gap-4 w-full py-2"
                )}
              >
                {c.image && (
                  <span
                    className={cn(
                      "rounded-md overflow-hidden flex-shrink-0 block",
                      // (Giữ bản vá cũ: w-full aspect-square)
                      isMobileGrid ? "w-full aspect-square" : "w-[61px] h-[61px]"
                    )}
                  >
                    <img
                      src={c.image}
                      alt={c.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </span>
                )}
                
                {/* ✅ SỬA 3: Gỡ bỏ "line-clamp-2" và "min-h-8" */}
                <span
                  className={cn(
                    "leading-tight break-words", // Giữ break-words
                    isMobileGrid
                      ? "text-center text-xs w-full" // Chỉ còn 3 class này
                      : "text-left text-sm whitespace-normal flex-1"
                  )}
                >
                  {c.label}
                </span>
                
              </div>
            </a>
          </Button>
        ))}
      </div>
    </aside>
  );
};