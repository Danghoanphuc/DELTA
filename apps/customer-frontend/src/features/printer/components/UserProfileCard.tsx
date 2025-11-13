// src/components/printer/UserProfileCard.tsx

import { User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import type { User } from "@/types/user";

interface UserProfileCardProps {
  user?: User | null;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  // Nếu không truyền user qua prop, ta lấy trực tiếp từ store
  const storeUser = useAuthStore((state) => state.user);
  const currentUser = user ?? storeUser;

  if (!currentUser) return null;
  return (
    <Card className="border-none shadow-sm mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={currentUser.avatarUrl ?? undefined}
              alt={currentUser.displayName ?? "User avatar"}
            />
            <AvatarFallback>
              <UserIcon size={40} />
            </AvatarFallback>
          </Avatar>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {currentUser.displayName}
            </h2>
            <p className="text-sm text-gray-600 mb-3">{currentUser.email}</p>

            <div className="flex justify-center sm:justify-start gap-3">
              <Button variant="outline" size="sm">
                {" "}
                {/* SỬA: Bỏ 'disabled' */}
                Thay đổi ảnh
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                // SỬA: Bỏ 'disabled'
              >
                Xóa ảnh
              </Button>
            </div>
          </div>

          {/* Premium Tag */}
          <div className="text-center sm:text-right">
            <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs inline-block mb-2">
              Tài khoản Premium
            </div>
            <p className="text-xs text-gray-500">Hết hạn: 31/12/2024</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
