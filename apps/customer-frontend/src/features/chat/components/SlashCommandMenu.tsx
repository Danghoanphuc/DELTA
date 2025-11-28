import { motion, AnimatePresence } from "framer-motion";
import { Palette, HardDrive, Image as ImageIcon } from "lucide-react";

interface SlashMenuProps {
  isOpen: boolean;
  onSelect: (cmd: 'canva' | 'drive' | 'upload') => void;
  onClose: () => void;
}

export function SlashCommandMenu({ isOpen, onSelect }: SlashMenuProps) {
  if (!isOpen) return null;

  const items = [
    { id: 'canva', label: 'Thêm thiết kế Canva', icon: Palette, color: 'text-[#7D2AE8]' },
    { id: 'drive', label: 'Thêm file Drive', icon: HardDrive, color: 'text-[#1FA463]' },
    { id: 'upload', label: 'Tải ảnh lên', icon: ImageIcon, color: 'text-blue-600' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute bottom-full left-4 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
      >
        <div className="bg-gray-50 px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Lệnh nhanh
        </div>
        <div className="p-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as any)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors text-left group"
            >
              <div className={`p-1.5 rounded-md bg-white border border-gray-200 shadow-sm group-hover:border-${item.color.split('-')[1]}-200`}>
                <item.icon size={16} className={item.color} />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}