// src/components/AppNavigationMenu.tsx (TẠO MỚI)
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Package, FolderOpen, Settings, User, LayoutGrid } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/components/ui/card";
// Lấy các mục điều hướng Cấp 2 (App Navigation)
const appNavItems = [
  { label: "Cửa hàng", path: "/shop", icon: LayoutGrid },
  { label: "Đơn hàng", path: "/orders", icon: Package },
  { label: "Thiết kế của tôi", path: "/designs", icon: FolderOpen },
  { label: "Cài đặt tài khoản", path: "/settings", icon: User }, // Dùng icon User
];

export const AppNavigationMenu = () => {
  const location = useLocation();

  const getIsActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Card className="mt-4 shadow-sm border-none bg-white">
      <nav className="p-3">
        <ul className="space-y-1">
          {appNavItems.map((item) => (
            <li key={item.path}>
              <Button
                asChild
                variant={getIsActive(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-base md:text-sm p-3",
                  getIsActive(item.path)
                    ? "text-blue-700 font-semibold"
                    : "text-gray-700"
                )}
              >
                <Link to={item.path}>
                  <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  {item.label}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  );
};
