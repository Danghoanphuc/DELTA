// apps/customer-frontend/src/shared/hooks/useDebounce.ts
import { useState, useEffect } from "react";

/**
 * Hook giúp trì hoãn việc cập nhật giá trị (Debounce).
 * Thường dùng cho ô tìm kiếm để tránh gọi API liên tục khi người dùng đang gõ.
 *
 * @param value - Giá trị cần debounce (thường là state của input)
 * @param delay - Thời gian chờ (mặc định 500ms)
 * @returns Giá trị đã được debounce
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 * // Chỉ gọi API khi debouncedSearchTerm thay đổi (người dùng đã ngừng gõ 500ms)
 * if (debouncedSearchTerm) searchAPI(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Thiết lập timer để cập nhật giá trị sau khoảng delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Dọn dẹp timer nếu value thay đổi (người dùng gõ tiếp) hoặc component unmount
    // Điều này giúp hủy bỏ các lần cập nhật trước đó, chỉ giữ lại lần cuối cùng
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
