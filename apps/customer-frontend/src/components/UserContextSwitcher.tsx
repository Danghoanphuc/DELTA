// src/components/UserContextSwitcher.tsx
import { useState } from "react";
import { LogIn, Repeat, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button";
import Logout from "@/features/auth/components/Logout";

export function UserContextSwitcher() {
  const user = useAuthStore((s) => s.user);
  const activeContext = useAuthStore((s) => s.activeContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
          {/* Tên hiển thị dạng chữ ký */}
          <div className="hidden lg:flex flex-col items-start">
            <span className="font-serif text-sm italic text-stone-900 group-hover:text-primary transition-colors">
              {user ? user.displayName?.split(" ")[0] : "Guest"}
            </span>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        // STYLE: Card vuông, đổ bóng giấy
        className="w-72 p-0 bg-[#F9F8F6] border border-stone-200 shadow-2xl rounded-none"
        sideOffset={12}
      >
        {user ? (
          <div>
            {/* Header: Business Card Style */}
            <div className="p-6 border-b border-stone-200 bg-white relative overflow-hidden">
              {/* Texture Noise mờ */}
              <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

              <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-stone-400 mb-3">
                ID Card
              </span>
              <p className="font-serif text-xl font-bold text-stone-900 leading-tight">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-stone-500 font-sans mt-1">
                {user.email}
              </p>

              <div className="mt-4 inline-flex items-center px-2 py-1 border border-stone-200 bg-stone-50 text-[9px] uppercase tracking-widest text-primary font-bold">
                {activeContext === "printer" ? "Partner Mode" : "Client Mode"}
              </div>
            </div>

            {/* Actions */}
            <div className="p-1 bg-[#F9F8F6]">
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-5 text-xs font-bold font-sans uppercase tracking-wider text-stone-600 hover:text-primary hover:bg-white rounded-none transition-colors"
                onClick={() => navigate("/settings")}
              >
                <Settings size={14} className="mr-3" /> Cài đặt
              </Button>
              <div className="px-1">
                {/* Logout button cần custom style tương tự */}
                <Logout />
              </div>
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
                className="bg-stone-900 text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors text-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="border border-stone-200 text-stone-900 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-colors text-center"
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
