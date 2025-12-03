// apps/customer-frontend/src/components/AppNavigationMenu.tsx
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

const appNavItems = [
  { label: "Tổng quan", path: "/app" },
  { label: "Cửa hàng", path: "/shop" },
  { label: "Đơn hàng", path: "/orders" },
  { label: "Thiết kế của tôi", path: "/designs" },
  { label: "Tài khoản", path: "/settings" },
];

export const AppNavigationMenu = () => {
  const location = useLocation();
  const getIsActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-full pl-2">
      <div className="mb-8 pl-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-400">
          Mục Lục
        </span>
      </div>

      <nav className="pl-4 border-l border-stone-200/60 py-2">
        <ul className="space-y-6">
          {appNavItems.map((item) => {
            const isActive = getIsActive(item.path);
            return (
              <li key={item.path} className="relative group">
                <Link to={item.path} className="block">
                  {/* LABEL CHÍNH: Font Serif, Tiếng Việt */}
                  <span
                    className={cn(
                      "block font-serif text-2xl tracking-tight transition-all duration-500 origin-left",
                      isActive
                        ? "text-stone-900 italic translate-x-3 font-medium"
                        : "text-stone-400 group-hover:text-stone-600 group-hover:translate-x-1"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>

                {isActive && (
                  <span className="absolute -left-[21px] top-2.5 w-1.5 h-1.5 rounded-full bg-stone-900 animate-in fade-in zoom-in duration-300" />
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
