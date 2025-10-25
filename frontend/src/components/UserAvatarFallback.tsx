// src/components/UserAvatarFallback.tsx
import React from "react";

interface UserAvatarFallbackProps {
  name: string; // Tên người dùng, để tạo initials
  size?: number; // Kích thước avatar (px), default 40
  bgColor?: string; // Tailwind class cho nền, ví dụ "bg-indigo-100"
  textColor?: string; // Tailwind class cho chữ, ví dụ "text-indigo-600"
  src?: string; // URL ảnh avatar, nếu có
}

const UserAvatarFallback: React.FC<UserAvatarFallbackProps> = ({
  name,
  size = 40,
  bgColor = "bg-gray-200",
  textColor = "text-gray-700",
  src,
}) => {
  // Lấy chữ cái đầu
  const getInitials = (nameStr: string) => {
    if (!nameStr) return "?";
    const names = nameStr.trim().split(" ");
    if (names.length > 1) {
      // Lấy chữ cái đầu của tên đầu và tên cuối
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    // Nếu chỉ có 1 tên, lấy 2 chữ cái đầu
    return nameStr.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      className={
        // Sử dụng `cn` utility nếu bạn đã cài đặt nó, nếu không thì dùng template string như này
        `relative rounded-full flex items-center justify-center font-semibold overflow-hidden ${bgColor} ${textColor}`
      }
      style={{ width: size, height: size, fontSize: size / 2.5 }} // Tính font size dựa trên kích thước
    >
      {/* Nếu có src (URL ảnh), hiển thị ảnh */}
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover" // Đảm bảo ảnh che phủ toàn bộ div
        />
      ) : (
        // Nếu không có src, hiển thị chữ cái đầu
        <span>{initials}</span>
      )}
    </div>
  );
};

export default UserAvatarFallback;
