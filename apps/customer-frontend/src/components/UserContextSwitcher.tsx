// src/components/UserContextSwitcher.tsx
import { useState } from "react";
import { Settings, Building2, Repeat, LogOut, Truck, User } from "lucide-react";
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
  const user = useAuthStore((s) => s.user);
  const activeContext = useAuthStore((s) => s.activeContext);
  const setActiveContext = useAuthStore((s) => s.setActiveContext);
  const signOut = useAuthStore((s) => s.signOut);
  const [isOpen, setIsOpen] = useState(false);

  const firstName = user?.displayName
    ? user.displayName.trim().split(" ")[0]
    : user?.username || "Khách";

  const isShipper = !!user?.shipperProfileId;

  const handleSwitchContext = async () => {
    const newContext = activeContext === "printer" ? "customer" : "printer";
    await setActiveContext(newContext, navigate);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await signOut();
      navigate("/");
    } catch (error) {
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
            size={36}
            className="ring-2 ring-stone-200 group-hover:ring-amber-700 transition-all"
          />
          <div className="hidden lg:flex flex-col items-start">
            <span className="font-serif text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
              {firstName}
            </span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 p-0 bg-[#F9F8F6] border border-stone-300 shadow-2xl rounded-sm"
        sideOffset={12}
      >
        {user ? (
          <div>
            {/* Header: Membership Card Style */}
            <div className="p-6 border-b border-stone-200 bg-white relative overflow-hidden group/card">
              {/* Texture nền */}
              <div
                className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-multiply bg-amber-900"
                style={{
                  backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-amber-800/70 border border-amber-200 px-2 py-0.5 rounded-sm bg-amber-50">
                    Printz Member
                  </span>
                  {/* Avatar lớn trong card */}
                  <UserAvatar
                    name={user.displayName || "U"}
                    src={user.avatarUrl}
                    size={48}
                    className="border-2 border-white shadow-sm"
                  />
                </div>

                <p className="font-serif text-xl font-bold text-stone-900 leading-tight truncate">
                  {user.displayName || user.username}
                </p>
                <p className="text-xs text-stone-500 font-sans mt-1 truncate">
                  {user.email}
                </p>

                {/* Context Switcher */}
                <button
                  onClick={handleSwitchContext}
                  className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 border border-stone-200 bg-stone-50 hover:bg-white hover:border-amber-500 hover:text-amber-800 transition-all cursor-pointer w-full justify-center group/btn"
                >
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-500 group-hover/btn:text-amber-800">
                    {activeContext === "printer"
                      ? "Chế độ Đối tác"
                      : "Chế độ Khách hàng"}
                  </span>
                  <Repeat
                    size={12}
                    className="text-stone-400 group-hover/btn:text-amber-800"
                  />
                </button>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="p-2 bg-[#F9F8F6]">
              {!user.organizationProfileId && (
                <Button
                  variant="ghost"
                  className="w-full justify-start h-11 px-4 text-xs font-bold font-sans uppercase tracking-wider text-stone-600 hover:text-amber-800 hover:bg-white rounded-sm transition-colors mb-1"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/organization/setup");
                  }}
                >
                  <Building2 size={16} className="mr-3 text-stone-400" />
                  Đăng ký Doanh nghiệp
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start h-11 px-4 text-xs font-bold font-sans uppercase tracking-wider text-stone-600 hover:text-amber-800 hover:bg-white rounded-sm transition-colors mb-1"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={16} className="mr-3 text-stone-400" />
                Thiết lập tài khoản
              </Button>

              <div className="h-px w-full bg-stone-200 my-1"></div>

              <Button
                variant="ghost"
                className="w-full justify-start h-11 px-4 text-xs font-bold font-sans uppercase tracking-wider text-red-700 hover:text-red-800 hover:bg-red-50 rounded-sm transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={16} className="mr-3 text-red-400" />
                Đăng xuất
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-white">
            <p className="font-serif italic text-stone-500 mb-4">
              Vui lòng đăng nhập để truy cập.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/signin"
                className="bg-stone-900 text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-900 transition-colors block text-center"
              >
                Đăng nhập
              </Link>
              <Link
                to="/signup"
                className="border border-stone-200 text-stone-900 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-amber-800 hover:text-amber-800 transition-colors block text-center"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
