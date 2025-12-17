// frontend/src/components/auth/LoginPopup.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Lock, LogIn, UserPlus } from "lucide-react"; // Thay ShoppingCart bằng Lock
import { useNavigate } from "react-router-dom";

interface LoginPopupProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginPopup({ isOpen, onClose, message }: LoginPopupProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate("/signin");
  };

  const handleSignUp = () => {
    onClose();
    navigate("/signup");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#F9F8F6] border border-stone-200 shadow-2xl p-0 overflow-hidden gap-0">
        {/* Decorative Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-stone-200 via-amber-700 to-stone-200"></div>

        <div className="p-8">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 bg-white border border-stone-100 rounded-full flex items-center justify-center mb-5 shadow-sm">
              <Lock className="w-6 h-6 text-amber-800" strokeWidth={1.5} />
            </div>
            <DialogTitle className="text-center text-2xl font-serif text-stone-900 italic">
              Đặc quyền riêng tư
            </DialogTitle>
            <DialogDescription className="text-center text-stone-500 font-light mt-2 leading-relaxed">
              {message ||
                "Bộ sưu tập này chứa các vật phẩm giới hạn dành riêng cho Thành viên Doanh nghiệp. Vui lòng đăng nhập để xem chi tiết."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-8">
            <Button
              onClick={handleSignIn}
              className="w-full bg-stone-900 hover:bg-amber-900 text-[#F9F8F6] h-12 rounded-sm font-bold tracking-widest uppercase transition-all shadow-lg hover:shadow-xl"
            >
              <LogIn size={16} className="mr-2" />
              Đăng nhập thành viên
            </Button>

            <Button
              onClick={handleSignUp}
              variant="outline"
              className="w-full h-12 border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-900 rounded-sm font-medium"
            >
              <UserPlus size={16} className="mr-2" />
              Đăng ký đối tác mới
            </Button>

            <button
              onClick={onClose}
              className="mt-2 text-xs text-stone-400 hover:text-stone-600 underline decoration-stone-300 underline-offset-4 text-center w-full py-2 transition-colors"
            >
              Tôi chỉ muốn xem dạo
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-stone-100 p-3 text-center border-t border-stone-200">
          <p className="text-[10px] text-stone-400 font-serif italic">
            An Nam Curator - Heritage Gifting
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
