// apps/customer-frontend/src/features/chat/components/UserQuickActions.tsx

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Star,
  Heart,
  Clock,
  Package,
  Sparkles,
  Building2,
  Users,
  FileCheck,
  Wallet,
  ArrowRight,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { UserAvatar } from "@/components/UserAvatar";
import { cn } from "@/shared/lib/utils";

// --- Sub-components ---

const AiAssistantCTA = ({ onOpenChat }: { onOpenChat?: () => void }) => (
  <div className="mt-auto pt-6">
    <div
      className="group relative flex cursor-pointer items-center justify-between overflow-hidden rounded-3xl border border-primary/10 bg-white p-1 pr-2 shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-md"
      onClick={onOpenChat}
    >
      <div className="flex items-center gap-3">
        {/* Icon Circle - Tối giản */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
          <Sparkles size={16} />
        </div>

        <div className="flex flex-col">
          <span className="font-serif text-sm font-bold text-foreground">
            Zin Assistant
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
            AI Design Support
          </span>
        </div>
      </div>

      <div className="flex h-8 w-8 -translate-x-2 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRight size={14} className="text-primary" />
      </div>
    </div>
  </div>
);

const ActionItem = ({ icon: Icon, label, path, badge }: any) => (
  <Link
    to={path}
    className="group flex items-center gap-4 py-3 pl-2 transition-all hover:pl-4"
  >
    <Icon
      size={18}
      strokeWidth={1.5}
      className="text-stone-400 transition-colors group-hover:text-primary"
    />
    <span className="flex-1 font-serif text-base text-stone-600 transition-colors group-hover:text-foreground group-hover:font-medium">
      {label}
    </span>
    {badge && (
      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white shadow-sm">
        {badge}
      </span>
    )}
  </Link>
);

// --- 1. Authenticated View ---
const AuthenticatedView = ({
  user,
  onOpenChat,
}: {
  user: any;
  onOpenChat?: () => void;
}) => {
  const isBusinessUser =
    user?.role === "business_admin" || user?.email?.includes("@company.com");

  // A. Menu
  const businessActions = [
    {
      label: "Duyệt đơn",
      icon: FileCheck,
      path: "/business/approvals",
      badge: "3",
    },
    { label: "Nhân sự", icon: Users, path: "/business/employees" },
    { label: "Ngân sách", icon: Wallet, path: "/business/budget" },
    { label: "Lịch sử", icon: Package, path: "/orders" },
  ];

  const personalActions = [
    { label: "Đơn hàng", icon: Package, path: "/orders" },
    { label: "Lưu trữ", icon: Heart, path: "/designs" },
    { label: "Yêu thích", icon: Star, path: "/wishlist" },
    { label: "Xem gần đây", icon: Clock, path: "/history" },
  ];

  const actions = isBusinessUser ? businessActions : personalActions;

  return (
    <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
      <CardContent className="flex h-full flex-1 flex-col p-2">
        {/* User Header - Minimal Layout */}
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
            <div className="flex items-center gap-2">
              {isBusinessUser ? (
                <span className="inline-block rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Business
                </span>
              ) : (
                <span className="text-xs text-stone-400">Personal Account</span>
              )}
            </div>
          </div>
        </div>

        {/* Divider mờ */}
        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

        {/* Action List */}
        <div className="flex-1 space-y-1">
          {actions.map((action) => (
            <ActionItem key={action.path} {...action} />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mb-4 mt-2 border-t border-dashed border-stone-200 pt-2">
          <div
            className="group flex cursor-pointer items-center gap-4 py-2 pl-2 text-stone-400 transition-all hover:text-red-600"
            onClick={() => {
              /* Handle Logout */
            }}
          >
            <LogOut size={16} strokeWidth={1.5} />
            <span className="font-serif text-sm">Đăng xuất</span>
          </div>
        </div>

        <AiAssistantCTA onOpenChat={onOpenChat} />
      </CardContent>
    </Card>
  );
};

// --- 2. Guest View ---
const GuestView = ({ onOpenChat }: { onOpenChat?: () => void }) => {
  const navigate = useNavigate();
  return (
    <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
      <CardContent className="flex flex-1 flex-col justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-stone-50 text-stone-300 ring-1 ring-inset ring-stone-100">
            <UserAvatar
              name="?"
              size={40}
              fallbackClassName="bg-transparent text-stone-400"
            />
          </div>

          <h3 className="mb-2 font-serif text-2xl font-bold text-foreground">
            Chào bạn mới,
          </h3>
          <p className="mx-auto mb-8 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
            Đăng nhập để trải nghiệm không gian thiết kế và lưu trữ sáng tạo của
            riêng bạn.
          </p>

          <Button
            className="h-12 w-full rounded-full bg-foreground font-sans text-xs font-bold uppercase tracking-widest text-white transition-transform hover:scale-[1.02] hover:bg-primary"
            onClick={() => navigate("/signin")}
          >
            Đăng nhập ngay
          </Button>
        </div>

        <div className="mt-auto">
          <AiAssistantCTA onOpenChat={onOpenChat} />
        </div>
      </CardContent>
    </Card>
  );
};

interface UserQuickActionsProps {
  className?: string;
  onOpenChat?: () => void;
}

export const UserQuickActions = ({
  className = "",
  onOpenChat,
}: UserQuickActionsProps) => {
  const { user } = useAuthStore();

  return (
    <div className={cn("h-full", className)}>
      {user ? (
        <AuthenticatedView user={user} onOpenChat={onOpenChat} />
      ) : (
        <GuestView onOpenChat={onOpenChat} />
      )}
    </div>
  );
};
