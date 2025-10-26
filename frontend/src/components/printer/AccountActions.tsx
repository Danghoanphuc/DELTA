// src/components/printer/AccountActions.tsx (COMPONENT MỚI)
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AccountActionsProps {
  onLogout: () => void;
}

export function AccountActions({ onLogout }: AccountActionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" disabled>
          Hủy thay đổi
        </Button>
        <Button
          className="flex-1 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
          disabled
        >
          Lưu thay đổi
        </Button>
      </div>
      <Button
        variant="outline"
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={onLogout}
      >
        <LogOut size={18} className="mr-2" />
        Đăng xuất
      </Button>
    </div>
  );
}
