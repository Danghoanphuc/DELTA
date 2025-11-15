import * as React from "react";
import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();

  // Tự động tạo breadcrumb từ pathname nếu không có items
  const breadcrumbItems = items || React.useMemo(() => {
    const paths = location.pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: "Trang chủ", href: "/app" }
    ];

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      
      // Map các path phổ biến
      let label = path;
      if (path === "shop") label = "Cửa hàng";
      else if (path === "product" || path === "products") label = "Sản phẩm";
      else if (path === "orders") label = "Đơn hàng";
      else if (path === "designs") label = "Thiết kế";
      else if (path === "settings") label = "Cài đặt";
      else if (path === "cart") label = "Giỏ hàng";
      else if (path === "checkout") label = "Thanh toán";
      else {
        // Capitalize và decode
        label = decodeURIComponent(path).replace(/-/g, " ");
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }

      // Không hiển thị ID trong breadcrumb
      if (index === paths.length - 1 && /^[a-f0-9]{24}$/i.test(path)) {
        // Có thể là MongoDB ID - không thêm vào breadcrumb
        return;
      }

      items.push({
        label,
        href: index < paths.length - 1 ? currentPath : undefined,
      });
    });

    return items;
  }, [location.pathname, items]);

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-1 text-sm text-gray-600 mb-4", className)}
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index === 0 ? (
                <Link
                  to={item.href || "/app"}
                  className="flex items-center hover:text-blue-600 transition-colors"
                  aria-label="Trang chủ"
                >
                  <Home size={16} />
                </Link>
              ) : (
                <>
                  <ChevronRight size={16} className="mx-1 text-gray-400" />
                  {isLast || !item.href ? (
                    <span
                      className={cn(
                        "font-medium",
                        isLast ? "text-gray-900" : "text-gray-600"
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      to={item.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

