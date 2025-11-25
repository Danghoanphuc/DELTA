import { useEffect } from "react";

export function useContentProtection() {
  useEffect(() => {
    // 1. Chặn Menu Chuột Phải (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      // Cho phép chuột phải trong ô input/textarea để sửa lỗi chính tả
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 2. Chặn Phím Tắt (Shortcuts)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chặn F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Xem source)
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === 'U')
      ) {
        e.preventDefault();
        return false;
      }

      // Chặn Ctrl+S (Save), Ctrl+P (Print)
      // Lưu ý: Ctrl+C (Copy) chặn ở đây có thể gây khó chịu nếu khách muốn copy mã đơn hàng
      // Nên ta chỉ chặn Save/Print trang web
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Chặn kéo ảnh (Drag & Drop)
    const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
        return false;
    }

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);
}