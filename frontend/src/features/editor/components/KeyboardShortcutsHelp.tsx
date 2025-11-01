// frontend/src/features/editor/components/KeyboardShortcutsHelp.tsx
// ✅ KEYBOARD SHORTCUTS HELP - Modal showing all shortcuts

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { Keyboard } from "lucide-react";

interface ShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

export const KeyboardShortcutsHelp: React.FC<ShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcuts: Shortcut[] = [
    // General
    {
      keys: ["Ctrl", "S"],
      description: "Save design",
      category: "General",
    },
    {
      keys: ["Ctrl", "O"],
      description: "Open file",
      category: "General",
    },
    {
      keys: ["Ctrl", "N"],
      description: "New design",
      category: "General",
    },
    {
      keys: ["?"],
      description: "Show keyboard shortcuts",
      category: "General",
    },

    // Edit
    {
      keys: ["Ctrl", "Z"],
      description: "Undo",
      category: "Edit",
    },
    {
      keys: ["Ctrl", "Shift", "Z"],
      description: "Redo",
      category: "Edit",
    },
    {
      keys: ["Ctrl", "C"],
      description: "Copy selected object",
      category: "Edit",
    },
    {
      keys: ["Ctrl", "V"],
      description: "Paste object",
      category: "Edit",
    },
    {
      keys: ["Ctrl", "X"],
      description: "Cut selected object",
      category: "Edit",
    },
    {
      keys: ["Ctrl", "D"],
      description: "Duplicate selected object",
      category: "Edit",
    },
    {
      keys: ["Ctrl", "A"],
      description: "Select all objects",
      category: "Edit",
    },
    {
      keys: ["Delete"],
      description: "Delete selected object",
      category: "Edit",
    },
    {
      keys: ["Backspace"],
      description: "Delete selected object",
      category: "Edit",
    },

    // Selection
    {
      keys: ["Esc"],
      description: "Deselect all",
      category: "Selection",
    },
    {
      keys: ["Tab"],
      description: "Select next object",
      category: "Selection",
    },
    {
      keys: ["Shift", "Tab"],
      description: "Select previous object",
      category: "Selection",
    },

    // Movement
    {
      keys: ["↑"],
      description: "Move up by 1px",
      category: "Movement",
    },
    {
      keys: ["↓"],
      description: "Move down by 1px",
      category: "Movement",
    },
    {
      keys: ["←"],
      description: "Move left by 1px",
      category: "Movement",
    },
    {
      keys: ["→"],
      description: "Move right by 1px",
      category: "Movement",
    },
    {
      keys: ["Shift", "↑"],
      description: "Move up by 10px",
      category: "Movement",
    },
    {
      keys: ["Shift", "↓"],
      description: "Move down by 10px",
      category: "Movement",
    },
    {
      keys: ["Shift", "←"],
      description: "Move left by 10px",
      category: "Movement",
    },
    {
      keys: ["Shift", "→"],
      description: "Move right by 10px",
      category: "Movement",
    },

    // View
    {
      keys: ["Ctrl", "+"],
      description: "Zoom in",
      category: "View",
    },
    {
      keys: ["Ctrl", "-"],
      description: "Zoom out",
      category: "View",
    },
    {
      keys: ["Ctrl", "0"],
      description: "Reset zoom to 100%",
      category: "View",
    },
    {
      keys: ["Space", "Drag"],
      description: "Pan canvas",
      category: "View",
    },
    {
      keys: ["Ctrl", "1"],
      description: "Fit to screen",
      category: "View",
    },

    // Tools
    {
      keys: ["T"],
      description: "Add text",
      category: "Tools",
    },
    {
      keys: ["R"],
      description: "Add rectangle",
      category: "Tools",
    },
    {
      keys: ["C"],
      description: "Add circle",
      category: "Tools",
    },
    {
      keys: ["L"],
      description: "Add line",
      category: "Tools",
    },
    {
      keys: ["I"],
      description: "Add image",
      category: "Tools",
    },

    // Alignment
    {
      keys: ["Ctrl", "Shift", "L"],
      description: "Align left",
      category: "Alignment",
    },
    {
      keys: ["Ctrl", "Shift", "C"],
      description: "Align center",
      category: "Alignment",
    },
    {
      keys: ["Ctrl", "Shift", "R"],
      description: "Align right",
      category: "Alignment",
    },
    {
      keys: ["Ctrl", "Shift", "T"],
      description: "Align top",
      category: "Alignment",
    },
    {
      keys: ["Ctrl", "Shift", "M"],
      description: "Align middle",
      category: "Alignment",
    },
    {
      keys: ["Ctrl", "Shift", "B"],
      description: "Align bottom",
      category: "Alignment",
    },

    // Layers
    {
      keys: ["Ctrl", "]"],
      description: "Bring forward",
      category: "Layers",
    },
    {
      keys: ["Ctrl", "["],
      description: "Send backward",
      category: "Layers",
    },
    {
      keys: ["Ctrl", "Shift", "]"],
      description: "Bring to front",
      category: "Layers",
    },
    {
      keys: ["Ctrl", "Shift", "["],
      description: "Send to back",
      category: "Layers",
    },

    // Text Formatting
    {
      keys: ["Ctrl", "B"],
      description: "Bold text",
      category: "Text",
    },
    {
      keys: ["Ctrl", "I"],
      description: "Italic text",
      category: "Text",
    },
    {
      keys: ["Ctrl", "U"],
      description: "Underline text",
      category: "Text",
    },
  ];

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  const categories = Object.keys(groupedShortcuts);

  const renderKeys = (keys: string[]) => {
    return (
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-gray-400 text-xs">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={20} />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <div className="mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {category}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {groupedShortcuts[category].map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      {renderKeys(shortcut.keys)}
                    </div>
                  ))}
                </div>
                {category !== categories[categories.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer tip */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>💡 Tip:</strong> Press{" "}
            <kbd className="px-1 bg-white border rounded">?</kbd> anytime to
            view this shortcuts list
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook to open shortcuts help with '?' key
export const useShortcutsHelp = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        // Don't trigger if typing in input
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
};
