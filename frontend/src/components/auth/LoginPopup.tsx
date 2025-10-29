// frontend/src/components/auth/LoginPopup.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, LogIn, UserPlus } from "lucide-react";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Vui lòng đăng nhập
          </DialogTitle>
          <DialogDescription className="text-center">
            {message ||
              "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng và đặt hàng"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
          >
            <LogIn size={18} />
            Đăng nhập
          </Button>

          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full gap-2"
          >
            <UserPlus size={18} />
            Tạo tài khoản mới
          </Button>

          <Button onClick={onClose} variant="ghost" className="w-full">
            Tiếp tục xem sản phẩm
          </Button>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">
          Bạn vẫn có thể xem sản phẩm và chat với AI mà không cần đăng nhập
        </p>
      </DialogContent>
    </Dialog>
  );
}
