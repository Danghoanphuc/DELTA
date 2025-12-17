// apps/customer-frontend/src/features/main/components/UserQuickActions.tsx

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  ArrowRight,
  LogOut,
  UserCheck, // Thay PenTool -> Giám tuyển
  ShieldCheck, // Thay Warehouse -> Bảo quản
  History, // Thay Dashboard -> Lịch sử
  Lock,
  LogIn,
  Crown,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/shared/lib/utils";

// --- CURATOR PRIVILEGES DATA ---
const MEMBER_BENEFITS = [
  {
    id: "01",
    icon: UserCheck,
    title: "Giám Tuyển 1:1",
    subtitle: "Tư vấn riêng biệt",
    desc: "Chuyên gia văn hóa đồng hành chọn quà phù hợp vị thế đối tác.",
  },
  {
    id: "02",
    icon: ShieldCheck,
    title: "Kho Bảo Quản",
    subtitle: "Lưu giữ an toàn",
    desc: "Bảo quản Trầm, Gốm trong điều kiện tiêu chuẩn. Giao khi cần.",
  },
  {
    id: "03",
    icon: History,
    title: "Lịch Sử Giao Tế",
    subtitle: "Ghi nhớ sở thích",
    desc: "Lưu lại danh sách quà đã tặng để tránh trùng lặp vào năm sau.",
  },
];

// --- Sub-components ---

const SignInCTA = ({ onClick }: { onClick: () => void }) => (
  <div className="mb-6">
    <div
      className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-sm border border-stone-200 bg-[#F9F8F6] p-1 pr-2 shadow-sm transition-all duration-500 hover:border-amber-400 hover:shadow-md hover:bg-white"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center bg-stone-200 text-stone-600 transition-all duration-300 group-hover:bg-amber-800 group-hover:text-white">
          <LogIn size={16} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-sm font-bold text-stone-900 group-hover:text-amber-800 transition-colors">
            Đăng nhập thành viên
          </span>
          <span className="text-[10px] uppercase tracking-wider text-stone-500 group-hover:text-amber-800/80 transition-colors">
            Mở khóa đặc quyền
          </span>
        </div>
      </div>
      <div className="flex h-8 w-8 -translate-x-2 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRight size={14} className="text-amber-800" strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const FeatureCard = ({
  item,
  isLocked,
}: {
  item: (typeof MEMBER_BENEFITS)[0];
  isLocked?: boolean;
}) => (
  <div
    className={cn(
      "group relative flex flex-col justify-start py-4 px-3 border-b border-stone-100 last:border-0 transition-all duration-300 rounded-sm",
      isLocked ? "hover:bg-stone-50" : "hover:bg-stone-50"
    )}
  >
    {/* Lock Icon for Guest */}
    {isLocked && (
      <div className="absolute top-4 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-stone-100 text-stone-400 group-hover:bg-stone-200 transition-colors">
        <Lock size={12} strokeWidth={2} />
      </div>
    )}

    {/* Decorative Dot for Authenticated */}
    {!isLocked && (
      <div className="absolute top-4 right-3 w-1.5 h-1.5 rounded-full bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    )}

    <div className="flex items-center justify-between mb-2">
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-serif font-black text-lg transition-all duration-500",
            isLocked
              ? "text-stone-300 group-hover:text-stone-400"
              : "text-amber-800/30 group-hover:opacity-100"
          )}
        >
          {item.id}.
        </span>
        <h3
          className={cn(
            "font-serif text-lg font-bold leading-none transition-colors",
            isLocked
              ? "text-stone-600 group-hover:text-stone-800"
              : "text-stone-900 group-hover:text-amber-900"
          )}
        >
          {item.title}
        </h3>
      </div>
      <item.icon
        strokeWidth={isLocked ? 1.5 : 1.5}
        className={cn(
          "w-5 h-5 transition-colors",
          isLocked
            ? "text-stone-300 group-hover:text-stone-500"
            : "text-amber-700/70 group-hover:text-amber-900"
        )}
      />
    </div>

    <p
      className={cn(
        "font-serif italic text-sm font-medium mb-1.5 transition-colors",
        isLocked
          ? "text-stone-400 group-hover:text-stone-500"
          : "text-amber-700"
      )}
    >
      {item.subtitle}
    </p>

    <p
      className={cn(
        "font-sans text-[11px] leading-snug line-clamp-2 transition-colors",
        isLocked
          ? "text-stone-400 group-hover:text-stone-500"
          : "text-stone-500"
      )}
    >
      {item.desc}
    </p>
  </div>
);

interface UserQuickActionsProps {
  className?: string;
  onOpenChat?: () => void | Promise<void>;
}

export const UserQuickActions = ({ className = "" }: UserQuickActionsProps) => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("[UserQuickActions] Logout error:", error);
      navigate("/");
    }
  };

  const handleSignInClick = () => {
    const redirectData = {
      path: "/organization/setup",
      expiry: Date.now() + 10 * 60 * 1000,
    };
    localStorage.setItem("postAuthRedirect", JSON.stringify(redirectData));
    navigate("/signin");
  };

  return (
    <div className={cn("h-full", className)}>
      <Card className="flex h-full flex-col border border-stone-200 bg-white shadow-sm rounded-sm">
        <CardContent className="flex h-full flex-1 flex-col p-4">
          {/* Sign In CTA - Only show for guests */}
          {!user && <SignInCTA onClick={handleSignInClick} />}

          {/* User Info Section - Only show if authenticated */}
          {user && (
            <>
              <div className="mb-6 flex items-center gap-4 px-1">
                <div className="relative">
                  <UserAvatar
                    name={user.displayName || "User"}
                    src={user.avatarUrl}
                    size={52}
                    className="border-2 border-amber-100 shadow-sm"
                    fallbackClassName="bg-stone-100 text-stone-500"
                  />
                  {/* Crown Icon for VIP feeling */}
                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-white">
                    <Crown size={8} fill="currentColor" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-serif text-lg font-bold text-stone-900">
                    {user.displayName}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-100 inline-block mt-1">
                    Thành viên
                  </span>
                </div>
              </div>

              <div className="mb-4 h-px w-full bg-stone-100" />
            </>
          )}

          {/* Benefits Section */}
          <div className="flex-1 space-y-1">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 px-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Đặc quyền
            </h3>
            {MEMBER_BENEFITS.map((feature) => (
              <FeatureCard key={feature.id} item={feature} isLocked={!user} />
            ))}
          </div>

          {/* Logout Button */}
          {user && (
            <div className="mt-6 border-t border-dashed border-stone-200 pt-2">
              <div
                className="group flex cursor-pointer items-center gap-3 py-2 px-2 text-stone-400 transition-all hover:bg-stone-50 hover:text-red-700 rounded-sm"
                onClick={handleLogout}
              >
                <LogOut size={14} strokeWidth={1.5} />
                <span className="font-serif text-sm">Đăng xuất an toàn</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
