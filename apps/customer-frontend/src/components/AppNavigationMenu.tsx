// apps/customer-frontend/src/components/AppNavigationMenu.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

// Menu Items - Đổi tên cho "Nghệ" hơn
const appNavItems = [
  { label: "Sảnh Chính", path: "/app" },
  { label: "Bộ Sưu Tập", path: "/shop" },
  { label: "Hồ Sơ Đơn Hàng", path: "/orders" },
  { label: "Cài Đặt", path: "/settings" },
];

export const AppNavigationMenu = () => {
  const location = useLocation();
  const getIsActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-full pl-2">
      <div className="mb-10 pl-6 border-b border-stone-200 pb-4 w-32">
        <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-stone-400">
          Index
        </span>
      </div>

      <nav className="pl-6 py-2">
        <ul className="space-y-8">
          {appNavItems.map((item) => {
            const isActive = getIsActive(item.path);
            return (
              <li key={item.path} className="relative group">
                <Link to={item.path} className="block">
                  {/* LABEL: Font Serif, hiệu ứng mực đậm khi Active */}
                  <span
                    className={cn(
                      "block font-serif text-2xl tracking-wide transition-all duration-500 origin-left",
                      isActive
                        ? "text-stone-900 font-bold translate-x-2 scale-105"
                        : "text-stone-400 font-medium group-hover:text-stone-600 group-hover:translate-x-1"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>

                {/* Indicator: Dấu gạch ngang thay vì chấm tròn (Giống đánh dấu sách) */}
                {isActive && (
                  <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-amber-800 animate-in fade-in slide-in-from-right-2 duration-500" />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
