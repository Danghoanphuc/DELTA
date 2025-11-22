// src/features/chat/components/BusinessComboGrid.tsx
import { ArrowRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const combos = [
  {
    title: "STARTUP PACK",
    desc: "Danh thiếp, Bao thư & Hóa đơn",
    // Ảnh demo: Bộ văn phòng phẩm
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763381378/Calendar_and_Gifts_Icon_in_Mint_and_Blush_rs5zks.svg", 
    bg: "bg-blue-50 hover:bg-blue-100",
    border: "border-blue-100 group-hover:border-blue-300",
    text: "text-blue-700",
    subtext: "text-blue-600/80",
    href: "/shop?collection=startup",
  },
  {
    title: "F&B STARTER",
    desc: "Ly, Menu, Túi giấy & Sticker",
    // Ảnh demo: Ly cafe và đồ ăn
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385803/sa%CC%89n_ph%C3%A2%CC%89m_khuy%C3%AA%CC%81n_ma%CC%83i_rupn6q.svg",
    bg: "bg-orange-50 hover:bg-orange-100",
    border: "border-orange-100 group-hover:border-orange-300",
    text: "text-orange-700",
    subtext: "text-orange-600/80",
    href: "/shop?collection=fnb",
  },
  {
    title: "EVENT KIT",
    desc: "Backdrop, Standee & Vé mời",
    // Ảnh demo: Loa hoặc sự kiện
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763387243/nha%CC%83n_da%CC%81n_pezqf5.svg",
    bg: "bg-purple-50 hover:bg-purple-100",
    border: "border-purple-100 group-hover:border-purple-300",
    text: "text-purple-700",
    subtext: "text-purple-600/80",
    href: "/shop?collection=event",
  },
  {
    title: "QUÀ TẶNG",
    desc: "Lịch, Sổ tay & Hộp quà",
    // Ảnh demo: Hộp quà
    image: "https://res.cloudinary.com/da3xfws3n/image/upload/v1763385799/%C4%90o%CC%81ng_go%CC%81i_zbdloi.svg",
    bg: "bg-green-50 hover:bg-green-100",
    border: "border-green-100 group-hover:border-green-300",
    text: "text-green-700",
    subtext: "text-green-600/80",
    href: "/shop?collection=gift",
  },
];

export const BusinessComboGrid = ({ className }: { className?: string }) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 mt-5", className)}>
      {combos.map((item, idx) => (
        <a
          key={idx}
          href={item.href}
          className={cn(
            "relative group rounded-xl border transition-all duration-300 h-20 flex items-center overflow-visible px-3",
            item.bg,
            item.border
          )}
        >
           {/* 🔥 FIX: Đưa tiêu đề ra ngoài làm con trực tiếp của thẻ <a> */}
           {/* top-0: Đính vào mép trên */}
           {/* -translate-y-1/2: Kéo lên 50% chiều cao chữ -> Nằm chính giữa đường kẻ */}
           {/* left-20: Căn thẳng hàng với text bên dưới (80px = w-20 của ảnh) */}
           <div className={cn(
                "absolute top-0 left-20 -translate-y-1/2 transition-all duration-300 font-black text-xs uppercase tracking-wider leading-none z-30",
                // Giảm độ dày shadow xuống 2px để chữ sắc nét hơn
                "[text-shadow:2px_0_#fff,-2px_0_#fff,0_2px_#fff,0_-2px_#fff,1px_1px_#fff,-1px_-1px_#fff,1px_-1px_#fff,-1px_1px_#fff]",
                item.text
            )}>
                {item.title}
            </div>

          {/* 1. ẢNH SẢN PHẨM */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-24 h-24 filter drop-shadow-xl transition-transform duration-300 group-hover:-translate-y-[60%] group-hover:scale-110 z-20">
            <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-contain"
                loading="lazy"
            />
          </div>

          {/* 2. NỘI DUNG BÊN PHẢI */}
          <div className="ml-20 flex-1 min-w-0 relative h-full flex flex-col justify-center">
            {/* Mô tả ngắn */}
            <p className={cn("text-xs font-medium line-clamp-2 leading-tight opacity-80 group-hover:opacity-100 pt-2", item.subtext)}>
              {item.desc}
            </p>
            
            {/* Nút giả CTA */}
            <div className={cn("absolute bottom-1 right-0 mt-1 inline-flex items-center text-[10px] font-bold uppercase tracking-wider gap-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300", item.text)}>
                Xem ngay <ArrowRight size={10} />
            </div>
          </div>
        </a>
      ))}
    </div>
  );
};