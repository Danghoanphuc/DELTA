// features/chat/components/ValuePropBar.tsx
import { ShieldCheck, Palette, Rocket, Sparkles } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const Item = ({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) => (
  <div className="flex items-center gap-2 text-sm text-gray-700">
    <Icon size={16} className="text-blue-600 flex-shrink-0" />
    <span>{text}</span>
  </div>
);

export const ValuePropBar = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={cn(
        "hidden lg:flex w-full bg-white border-b border-gray-200",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex items-center justify-between gap-4">
        <Item icon={Palette} text="Cam kết chuẩn màu in" />
        <Item icon={ShieldCheck} text="Duyệt mẫu online trực tiếp" />
        <Item icon={Rocket} text="Giao nhanh, đảm bảo chất lượng" />
        <Item icon={Sparkles} text="AI Zin hỗ trợ thiết kế" />
      </div>
    </div>
  );
};


