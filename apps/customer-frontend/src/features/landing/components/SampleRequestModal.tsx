import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  X,
  Gift,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  FileText,
} from "lucide-react";
import { useContactForm } from "../hooks/useContactForm";
import { Link } from "react-router-dom";

interface SampleRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  message?: string;
  buttonText?: string;
  icon?: React.ReactNode;
}

export function SampleRequestModal({
  open,
  onOpenChange,
  title = "Nhận mẫu thử miễn phí",
  subtitle = "Để lại thông tin, Printz sẽ liên hệ tư vấn trong 5 phút",
  message = "Yêu cầu nhận mẫu thử miễn phí từ Landing Page",
  buttonText = "Gửi yêu cầu ngay",
  icon = <Gift className="w-6 h-6 text-emerald-900" />,
}: SampleRequestModalProps) {
  // --- GIỮ NGUYÊN LOGIC CŨ (DO NOT TOUCH) ---
  const { isSubmitting, submitForm } = useContactForm();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10)
      return "Số điện thoại phải có ít nhất 10 chữ số";
    if (cleanPhone.length > 11) return "Số điện thoại không được quá 11 chữ số";
    return "";
  };

  const validateForm = () => {
    const newErrors = { name: "", phone: "" };
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ và tên";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else {
      newErrors.phone = validatePhone(formData.phone);
    }
    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const success = await submitForm({
      name: formData.name,
      phone: formData.phone,
      message: message,
    });

    if (success) {
      setIsSuccess(true);
      setFormData({ name: "", phone: "" });
      setErrors({ name: "", phone: "" });
      setTimeout(() => {
        setIsSuccess(false);
        onOpenChange(false);
      }, 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleanValue = value.replace(/[^\d\s\-\+\(\)]/g, "");
      setFormData((prev) => ({ ...prev, [name]: cleanValue }));
      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      // @ts-ignore
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrors({ name: "", phone: "" });
    onOpenChange(false);
  };
  // --- HẾT PHẦN LOGIC ---

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-white border border-stone-100 shadow-2xl rounded-none overflow-hidden">
        {/* Close Button - Tinh tế hơn */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col h-full">
          {isSuccess ? (
            // --- SUCCESS STATE: Sạch sẽ & Chuyên nghiệp ---
            <div className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="font-serif text-3xl text-stone-900 mb-2">
                Đã gửi thành công!
              </h2>
              <p className="text-stone-500 text-sm mb-8 max-w-xs mx-auto">
                Printz đã nhận được thông tin. Chuyên viên sẽ liên hệ với bạn
                trong vòng <strong className="text-stone-900">24h</strong> tới.
              </p>

              <div className="w-full bg-stone-50 rounded-lg p-4 border border-stone-100 text-xs text-stone-600 space-y-2 mb-6">
                <p className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Thông tin
                  được bảo mật tuyệt đối
                </p>
                <p>Tự động đóng sau 3 giây...</p>
              </div>
            </div>
          ) : (
            // --- FORM STATE: Hiện đại & Trustworthy ---
            <>
              {/* Header: Dùng màu Brand (Emerald) làm điểm nhấn nhẹ */}
              <div className="px-8 pt-10 pb-6 text-center border-b border-stone-50">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-4 shadow-sm">
                  {icon}
                </div>

                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-2 leading-tight">
                  {title}
                </h2>
                <p className="text-stone-500 text-sm font-light">{subtitle}</p>
              </div>

              {/* Form Content */}
              <div className="p-8 bg-[#F9F8F6]">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1"
                    >
                      Họ tên của bạn
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="VD: Nguyễn Văn A"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border bg-white text-stone-900 placeholder:text-stone-300 transition-all rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        errors.name
                          ? "border-red-400 focus:border-red-500"
                          : "border-stone-200 focus:border-emerald-500"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] ml-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1"
                    >
                      Số điện thoại nhận tư vấn
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="VD: 0912 345 678"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3 border bg-white text-stone-900 placeholder:text-stone-300 transition-all rounded-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                        errors.phone
                          ? "border-red-400 focus:border-red-500"
                          : "border-stone-200 focus:border-emerald-500"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[10px] ml-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-stone-900 hover:bg-emerald-900 text-white rounded-sm font-bold text-xs tracking-[0.15em] uppercase transition-all shadow-lg hover:shadow-xl mt-4 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      "Đang xử lý..."
                    ) : (
                      <>
                        {buttonText} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* --- POLICY FOOTER: Thêm các liên kết chính sách --- */}
                <div className="mt-6 pt-6 border-t border-stone-200/60 text-center">
                  <p className="text-[10px] text-stone-400 mb-2">
                    Bằng việc gửi thông tin, bạn đồng ý với các quy định của
                    Printz:
                  </p>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                    <Link
                      to="/policy"
                      className="text-[10px] text-stone-500 hover:text-emerald-700 underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Bảo mật
                    </Link>
                    <Link
                      to="quality-standards"
                      className="text-[10px] text-stone-500 hover:text-emerald-700 underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Chất lượng
                    </Link>
                    <Link
                      to="/warranty"
                      className="text-[10px] text-stone-500 hover:text-emerald-700 underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" /> Bảo hành
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
