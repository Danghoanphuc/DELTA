// frontend/src/features/editor/components/ContextMenu.tsx
// ✅ CONTEXT MENU - Right-click menu

import React, { useEffect, useRef } from "react";
import {
  Copy,
  Trash2,
  Layers,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface MenuItem {
  icon?: React.ReactNode;
  label: string;
  action: () => void;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  isOpen,
  onClose,
  items,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Adjust position if menu would go off-screen
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (rect.right > windowWidth) {
      adjustedX = windowWidth - rect.width - 10;
    }

    if (rect.bottom > windowHeight) {
      adjustedY = windowHeight - rect.height - 10;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [isOpen, x, y]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg py-1"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.divider ? (
            <div className="my-1 border-t border-gray-200" />
          ) : (
            <button
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={cn(
                "w-full px-4 py-2 text-left text-sm flex items-center gap-3 hover:bg-gray-100 transition-colors",
                item.disabled && "opacity-50 cursor-not-allowed hover:bg-white"
              )}
            >
              {item.icon && (
                <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
              )}
              <span className="flex-1">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-400">{item.shortcut}</span>
              )}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Hook to use with FabricCanvas
export const useFabricContextMenu = (
  canvasRef: React.RefObject<any>,
  editorRef: React.RefObject<any>
) => {
  const [contextMenu, setContextMenu] = React.useState({
    x: 0,
    y: 0,
    show: false,
  });

  const [selectedObject, setSelectedObject] = React.useState<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current?.getCanvas?.();
    if (!canvas) return;

    const handleContextMenu = (opt: any) => {
      opt.e.preventDefault();
      opt.e.stopPropagation();

      const target = canvas.findTarget(opt.e);
      setSelectedObject(target);

      setContextMenu({
        x: opt.e.clientX,
        y: opt.e.clientY,
        show: true,
      });
    };

    canvas.on("mouse:down", (opt: any) => {
      if (opt.button === 3) {
        // Right click
        handleContextMenu(opt);
      }
    });

    return () => {
      canvas.off("mouse:down");
    };
  }, [canvasRef]);

  const menuItems: MenuItem[] = [
    {
      icon: <Copy size={16} />,
      label: "Copy",
      action: () => editorRef.current?.copySelected?.(),
      shortcut: "Ctrl+C",
      disabled: !selectedObject,
    },
    {
      icon: <Layers size={16} />,
      label: "Duplicate",
      action: () => editorRef.current?.duplicateSelected?.(),
      shortcut: "Ctrl+D",
      disabled: !selectedObject,
    },
    {
      divider: true,
      label: "",
      action: () => {},
    },
    {
      icon: <ArrowUp size={16} />,
      label: "Bring to Front",
      action: () => {
        const canvas = canvasRef.current?.getCanvas?.();
        if (selectedObject && canvas) {
          canvas.bringToFront(selectedObject);
          canvas.renderAll();
        }
      },
      disabled: !selectedObject,
    },
    {
      icon: <MoveUp size={16} />,
      label: "Bring Forward",
      action: () => {
        const canvas = canvasRef.current?.getCanvas?.();
        if (selectedObject && canvas) {
          canvas.bringForward(selectedObject);
          canvas.renderAll();
        }
      },
      disabled: !selectedObject,
    },
    {
      icon: <MoveDown size={16} />,
      label: "Send Backward",
      action: () => {
        const canvas = canvasRef.current?.getCanvas?.();
        if (selectedObject && canvas) {
          canvas.sendBackwards(selectedObject);
          canvas.renderAll();
        }
      },
      disabled: !selectedObject,
    },
    {
      icon: <ArrowDown size={16} />,
      label: "Send to Back",
      action: () => {
        const canvas = canvasRef.current?.getCanvas?.();
        if (selectedObject && canvas) {
          canvas.sendToBack(selectedObject);
          canvas.renderAll();
        }
      },
      disabled: !selectedObject,
    },
    {
      divider: true,
      label: "",
      action: () => {},
    },
    {
      icon: selectedObject?.lockMovementX ? (
        <Unlock size={16} />
      ) : (
        <Lock size={16} />
      ),
      label: selectedObject?.lockMovementX ? "Unlock" : "Lock",
      action: () => {
        if (selectedObject) {
          const isLocked = selectedObject.lockMovementX;
          selectedObject.set({
            lockMovementX: !isLocked,
            lockMovementY: !isLocked,
            lockScalingX: !isLocked,
            lockScalingY: !isLocked,
            lockRotation: !isLocked,
          });
          canvasRef.current?.getCanvas?.().renderAll();
        }
      },
      disabled: !selectedObject,
    },
    {
      icon: selectedObject?.visible ? <EyeOff size={16} /> : <Eye size={16} />,
      label: selectedObject?.visible ? "Hide" : "Show",
      action: () => {
        if (selectedObject) {
          selectedObject.set({ visible: !selectedObject.visible });
          canvasRef.current?.getCanvas?.().renderAll();
        }
      },
      disabled: !selectedObject,
    },
    {
      divider: true,
      label: "",
      action: () => {},
    },
    {
      icon: <Trash2 size={16} className="text-red-500" />,
      label: "Delete",
      action: () => editorRef.current?.deleteSelected?.(),
      shortcut: "Del",
      disabled: !selectedObject,
    },
  ];

  return {
    contextMenu,
    menuItems,
    closeContextMenu: () =>
      setContextMenu((prev) => ({ ...prev, show: false })),
  };
};
