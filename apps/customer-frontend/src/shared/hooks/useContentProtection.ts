import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook bảo vệ nội dung - CHỈ áp dụng cho các trang cần thiết
 *
 * ✅ BẢO VỆ:
 * - /design-editor - Thiết kế độc quyền
 * - /printer/studio - Công cụ chuyên nghiệp
 * - /templates - Preview template
 *
 * ❌ KHÔNG BẢO VỆ:
 * - Landing pages - Cần SEO & share
 * - Auth/Forms - Cần copy/paste
 * - Chat/Messages - Cần copy tin nhắn
 * - Shop/Products - Cần copy thông tin
 */
export function useContentProtection() {
  const location = useLocation();

  useEffect(() => {
    // Danh sách các route CẦN bảo vệ
    const protectedRoutes = ["/design-editor", "/printer/studio", "/templates"];

    // Kiểm tra xem route hiện tại có cần bảo vệ không
    const shouldProtect = protectedRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (!shouldProtect) {
      return; // Không bảo vệ route này
    }

    // 1. Chặn Menu Chuột Phải (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      // Luôn cho phép chuột phải trong input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 2. Chặn Phím Tắt (Chỉ F12 và DevTools, KHÔNG chặn Ctrl+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chỉ chặn F12 và DevTools shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "J", "C"].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Chặn kéo ảnh (Drag & Drop)
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [location.pathname]);
}
