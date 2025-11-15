// src/components/GlobalHeader.tsx (CẬP NHẬT - PHIÊN BẢN "LAI")
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Package,
  FolderOpen,
  Menu,
  X,
  Compass, // Khám phá
  LayoutGrid, // Cửa hàng
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { UserContextSwitcher } from "./UserContextSwitcher";
import { SearchAutocomplete } from "./SearchAutocomplete";
import printzLogo from "@/assets/img/logo-printz.png";
import { cn } from "@/shared/lib/utils";

// Props (như đã thống nhất)
interface GlobalHeaderProps {
  onSearchSubmit?: (term: string) => void;
  cartItemCount: number;
  onCartClick: () => void;
}

export function GlobalHeader({
  onSearchSubmit,
  cartItemCount,
  onCartClick,
}: GlobalHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm);
    } else {
      navigate(`/app?search=${searchTerm}`);
    }
  };

  // ✅ ĐIỀU HƯỚNG CẤP 1 (TRÊN HEADER)
  const navItems = [
    { label: "Khám phá", path: "/app", icon: Compass },
    { label: "Cửa hàng", path: "/shop", icon: LayoutGrid },
    { label: "Thiết kế", path: "/designs", icon: FolderOpen },
    { label: "Đơn hàng", path: "/orders", icon: Package },
  ];

  const getIsActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200">
      <div className="flex items-center justify-between h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- 1. Logo & Nav (Desktop) --- */}
        <div className="flex items-center gap-4">
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <img src={printzLogo} alt="PrintZ Logo" className="w-10 h-10" />
            <span className="hidden sm:inline font-bold text-xl text-gray-800">
              Printz
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={getIsActive(item.path) ? "secondary" : "ghost"}
                className={cn(
                  "font-medium",
                  getIsActive(item.path) ? "text-blue-600" : "text-gray-600"
                )}
              >
                <Link to={item.path}>
                  <item.icon size={16} className="mr-1.5" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        {/* --- 2. Search Bar (Desktop) --- */}
        {onSearchSubmit && (
          <div className="hidden lg:block w-full max-w-md">
            <SearchAutocomplete onSearchSubmit={onSearchSubmit} />
          </div>
        )}

        {/* --- 3. Tiện ích (User & Cart) --- */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex relative micro-bounce"
            onClick={onCartClick}
            aria-label={`Giỏ hàng có ${cartItemCount} sản phẩm`}
          >
            <ShoppingCart size={22} />
            {cartItemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 flex items-center justify-center p-0 rounded-full bg-blue-600 text-white text-[10px] font-bold leading-none animate-pulse"
                aria-live="polite"
              >
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Button>
          <UserContextSwitcher contextColor="blue" />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
        </div>
      </div>

      {/* --- Mobile Menu Drawer --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg p-4 border-t">
          <nav className="flex flex-col gap-4">
            {onSearchSubmit && (
              <SearchAutocomplete onSearchSubmit={onSearchSubmit} />
            )}
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-base font-medium  hover:text-blue-600 p-2 rounded-md",
                  getIsActive(item.path)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}