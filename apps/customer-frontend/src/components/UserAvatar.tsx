// src/components/UserAvatar.tsx (TẠO MỚI)
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

interface UserAvatarProps {
  name: string; // Tên người dùng, để tạo initials
  src?: string | null; // URL ảnh avatar
  size?: number; // Kích thước (px)
  className?: string; // Class tùy chỉnh
  fallbackClassName?: string; // Class cho fallback (VD: bg-blue-100)
}

/**
 * Lấy chữ cái đầu (initials) từ tên
 */
const getInitials = (nameStr: string) => {
  if (!nameStr) return "?";
  const names = nameStr.trim().split(" ");
  // Lấy chữ cái đầu của tên đầu
  if (names.length > 0 && names[0][0]) {
    return names[0][0].toUpperCase();
  }
  // Nếu chỉ có 1 tên, lấy 2 chữ cái đầu
  if (names.length === 1 && nameStr.length > 1) {
    return nameStr.substring(0, 2).toUpperCase();
  }
  // Fallback
  return nameStr.substring(0, 1).toUpperCase() || "?";
};

/**
 * Component Avatar chuẩn, sử dụng shadcn/ui Avatar, AvatarImage, AvatarFallback
 * để xử lý lỗi (src="", null, undefined) một cách tự động.
 */
export const UserAvatar = ({
  name,
  src,
  size,
  className,
  fallbackClassName,
}: UserAvatarProps) => {
  const initials = getInitials(name);
  const style = size ? { width: size, height: size, fontSize: size / 2.5 } : {};

  return (
    <Avatar className={cn("font-semibold", className)} style={style}>
      <AvatarImage
        src={src || undefined} // Quan trọng: Chuyển null hoặc "" thành undefined
        alt={name}
        className="object-cover"
      />
      <AvatarFallback
        delayMs={300} // Chờ 300ms trước khi hiện fallback
        className={cn(
          "bg-gray-200 text-gray-700",
          fallbackClassName,
          className // Áp dụng cả className chính cho Fallback
        )}
        style={style}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
