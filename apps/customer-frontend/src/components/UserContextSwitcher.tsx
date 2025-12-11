// src/components/UserContextSwitcher.tsx
import { useState } from "react";
import { Settings, Building2, Repeat, LogOut, Truck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/utils/toast";

export function UserContextSwitcher() {
  const navigate = useNavigate();

  // ✅ FIX: Extract store values separately to avoid infinite re-renders
  const user = useAuthStore((s) => s.user);
  const activeContext = useAuthStore((s) => s.activeContext);
  const setActiveContext = useAuthStore((s) => s.setActiveContext);
  const signOut = useAuthStore((s) => s.signOut);

  const [isOpen, setIsOpen] = useState(false);

  // Safe name handling
  const firstName = user?.displayName
    ? user.displayName.trim().split(" ")[0]
    : user?.username || "Guest";

  // Check if user is shipper
  const isShipper = !!user?.shipperProfileId;

  // Debug log
  console.log("[UserContextSwitcher] User data:", {
    shipperProfileId: user?.shipperProfileId,
    isShipper,
    user,
  });

  const handleSwitchContext = async () => {
    const newContext = activeContext === "printer" ? "customer" : "printer";
    // ✅ setActiveContext requires 2 arguments: context and navigate
    await setActiveContext(newContext, navigate);
  };

  const handleSwitchToShipper = () => {
    setIsOpen(false);
    if (isShipper) {
      // ✅ Có quyền shipper -> vào Shipper Portal
      navigate("/shipper");
    } else {
      // ❌ Chưa có quyền -> thông báo
      toast.error(
        "Bạn chưa được cấp quyền Shipper. Vui lòng liên hệ Admin để được cấp quyền."
      );
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("[UserContextSwitcher] Logout error:", error);
      // signOut already handles toast and state clearing
      navigate("/");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-3 focus:outline-none group">
          <UserAvatar
            name={user?.displayName || "G"}
            src={user?.avatarUrl}
            size={32}
            className="ring-1 ring-stone-200 group-hover:ring-primary transition-all"
          />
          <div className="hidden lg:flex flex-col items-start">
            <span className="font-serif text-sm italic text-stone-900 group-hover:text-primary transition-colors">
              {firstName}
            </span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-72 p-0 bg-stone-50 border border-stone-200 shadow-2xl rounded-none"
        sideOffset={12}
      >
        {user ? (
          <div>
            {/* Header: Business Card Style */}
            <div className="p-6 border-b border-stone-200 bg-white relative overflow-hidden group/card">
              {/* CSS Native Noise - No External Request */}
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-multiply"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
              ></div>

              <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-stone-400 mb-3">
                ID Card
              </span>
              <p className="font-serif text-xl font-bold text-stone-900 leading-tight truncate">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-stone-500 font-sans mt-1 truncate">
                {user.email}
              </p>

              {/* Functional Context Switcher */}
              <button
                onClick={handleSwitchContext}
                className="mt-4 inline-flex items-center gap-2 px-2 py-1 border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-primary/50 transition-all cursor-pointer group/btn"
              >
                <span className="text-[9px] uppercase tracking-widest text-primary font-bold">
                  {activeContext === "printer" ? "Partner Mode" : "Client Mode"}
                </span>
                <Repeat
                  size={10}
                  className="text-stone-400 group-hover/btn:text-primary group-hover/btn:rotate-180 transition-transform duration-300"
                />
              </button>
            </div>

            {/* Actions List */}
            <div className="p-1 bg-stone-50">
              {!user.organizationProfileId && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-5 text-xs font-bold font-sans uppercase tracking-wider text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-none transition-colors"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/organization/setup");
                  }}
                >
                  <Building2 size={14} className="mr-3" />
                  Đăng ký Business
                </Button>
              )}

              {/* Shipper Portal Access - Luôn hiển thị */}
              <Button
                variant="ghost"
                className={`w-full justify-start h-10 px-5 text-xs font-bold font-sans uppercase tracking-wider rounded-none transition-colors ${
                  isShipper
                    ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    : "text-stone-400 hover:text-stone-500 hover:bg-stone-100"
                }`}
                onClick={handleSwitchToShipper}
              >
                <Truck size={14} className="mr-3" />
                Shipper Portal
                {!isShipper && (
                  <span className="ml-auto text-[8px] bg-stone-200 text-stone-500 px-1.5 py-0.5 rounded">
                    Chưa kích hoạt
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-5 text-xs font-bold font-sans uppercase tracking-wider text-stone-600 hover:text-primary hover:bg-white rounded-none transition-colors"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={14} className="mr-3" />
                Cài đặt
              </Button>

              {/* Integrated Logout Style */}
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-5 text-xs font-bold font-sans uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50 rounded-none transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={14} className="mr-3" />
                Đăng xuất
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-white">
            <p className="font-serif italic text-stone-500 mb-4">
              Join the club.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/signin"
                className="bg-stone-900 text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors text-center flex items-center justify-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-stone-200 text-stone-900 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors text-center flex items-center justify-center"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
