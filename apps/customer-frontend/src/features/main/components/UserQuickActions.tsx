// apps/customer-frontend/src/features/main/components/UserQuickActions.tsx

import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  ArrowRight,
  LogOut,
  PenTool,
  Warehouse,
  LayoutDashboard,
  Lock,
  LogIn,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/shared/lib/utils";

// --- B2B Features Data ---
const B2B_FEATURES = [
  {
    id: "01",
    icon: PenTool,
    title: "Thiết kế",
    subtitle: "Miễn phí hoàn toàn",
    desc: "Đội ngũ họa sĩ tinh hoa. Chỉnh sửa 1:1.",
  },
  {
    id: "02",
    icon: Warehouse,
    title: "Lưu kho",
    subtitle: "Không lo mặt bằng",
    desc: "In số lượng lớn, giá vốn thấp. Bảo quản 24/7.",
  },
  {
    id: "03",
    icon: LayoutDashboard,
    title: "Phần mềm",
    subtitle: "Quản trị trọn đời",
    desc: "Dashboard quản lý tồn kho & quà tặng. 0đ duy trì.",
  },
];

// --- Sub-components ---

const SignInCTA = ({ onClick }: { onClick: () => void }) => (
  <div className="mb-6">
    <div
      className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-1 pr-2 shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-lg hover:from-primary/10 hover:to-primary/15"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white group-hover:scale-110">
          <LogIn size={16} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-sm font-bold text-stone-900 group-hover:text-primary transition-colors">
            Bắt đầu ngay
          </span>
          <span className="text-[10px] uppercase tracking-wider text-stone-500 group-hover:text-primary transition-colors">
            Đăng ký & Nhận đặc quyền
          </span>
        </div>
      </div>
      <div className="flex h-8 w-8 -translate-x-2 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRight size={14} className="text-primary" strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const FeatureCard = ({
  item,
  isLocked,
}: {
  item: (typeof B2B_FEATURES)[0];
  isLocked?: boolean;
}) => (
  <div
    className={cn(
      "group relative flex flex-col justify-start py-4 px-3 border-b border-stone-200 last:border-0 transition-all duration-300 rounded-lg",
      isLocked
        ? "bg-stone-50/50 hover:bg-stone-100/50 hover:border-stone-300"
        : "hover:bg-stone-50"
    )}
  >
    {/* Lock Icon for Guest - More prominent */}
    {isLocked && (
      <div className="absolute top-4 right-3 w-6 h-6 flex items-center justify-center rounded-full bg-stone-200 text-stone-500 group-hover:bg-stone-300 transition-colors">
        <Lock size={13} strokeWidth={2.5} />
      </div>
    )}

    {/* Decorative Dot for Authenticated */}
    {!isLocked && (
      <div className="absolute top-4 right-3 w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    )}

    <div className="flex items-center justify-between mb-2">
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-serif font-black text-lg transition-all duration-500",
            isLocked
              ? "text-stone-400 group-hover:text-stone-500"
              : "text-primary opacity-30 group-hover:opacity-100"
          )}
        >
          {item.id}.
        </span>
        <h3
          className={cn(
            "font-serif text-lg font-bold leading-none transition-colors",
            isLocked
              ? "text-stone-700 group-hover:text-stone-900"
              : "text-stone-900"
          )}
        >
          {item.title}
        </h3>
      </div>
      <item.icon
        strokeWidth={isLocked ? 2 : 1.5}
        className={cn(
          "w-5 h-5 transition-colors",
          isLocked
            ? "text-stone-400 group-hover:text-stone-600"
            : "text-stone-400 group-hover:text-stone-900"
        )}
      />
    </div>

    <p
      className={cn(
        "font-serif italic text-sm font-medium mb-1.5 transition-colors",
        isLocked ? "text-stone-500 group-hover:text-stone-600" : "text-primary"
      )}
    >
      {item.subtitle}
    </p>

    <p
      className={cn(
        "font-sans text-[11px] leading-snug line-clamp-2 transition-colors",
        isLocked
          ? "text-stone-500 group-hover:text-stone-600"
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
    // Lưu redirectTo với expiry 10 phút để tránh redirect nhầm sau này
    const redirectData = {
      path: "/organization/setup",
      expiry: Date.now() + 10 * 60 * 1000, // 10 phút
    };
    localStorage.setItem("postAuthRedirect", JSON.stringify(redirectData));
    navigate("/signin");
  };

  return (
    <div className={cn("h-full", className)}>
      <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
        <CardContent className="flex h-full flex-1 flex-col p-2">
          {/* Sign In CTA - Only show for guests at top */}
          {!user && <SignInCTA onClick={handleSignInClick} />}

          {/* User Info Section - Only show if authenticated */}
          {user && (
            <>
              <div className="mb-6 flex items-center gap-4 px-2">
                <UserAvatar
                  name={user.displayName || "User"}
                  src={user.avatarUrl}
                  size={52}
                  fallbackClassName="bg-stone-100 text-stone-500 rounded-full border border-white shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-serif text-lg font-bold text-foreground">
                    {user.displayName}
                  </h4>
                  <span className="text-xs text-stone-400">
                    Personal Account
                  </span>
                </div>
              </div>

              <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-stone-200 to-transparent" />
            </>
          )}

          {/* B2B Features Section - Always visible */}
          <div className="flex-1 space-y-0">
            <h3 className="font-serif text-sm font-bold text-stone-900 mb-3 px-2">
              Đặc quyền Đối tác
            </h3>
            {B2B_FEATURES.map((feature) => (
              <FeatureCard key={feature.id} item={feature} isLocked={!user} />
            ))}
          </div>

          {/* Logout Button - Only show for authenticated users */}
          {user && (
            <div className="mt-4 border-t border-dashed border-stone-200 pt-2">
              <div
                className="group flex cursor-pointer items-center gap-4 py-2 pl-2 text-stone-400 transition-all hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut size={16} strokeWidth={1.5} />
                <span className="font-serif text-sm">Đăng xuất</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
