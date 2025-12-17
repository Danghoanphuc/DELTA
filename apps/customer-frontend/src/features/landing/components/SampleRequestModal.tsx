import { useState } from "react";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import {
  X,
  Feather, // Thay Gift bằng Feather (biểu tượng bút tích/thư tay)
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  FileText,
  MessageSquare,
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
  // CẬP NHẬT DEFAULT PROPS CHO HỢP CONCEPT "Printz CURATOR"
  title = "Kết nối với Nhà Giám tuyển",
  subtitle = "Để lại thông tin, chúng tôi sẽ liên hệ để thấu hiểu nhu cầu ngoại giao của bạn trong vòng 24h.",
  message = "Yêu cầu tư vấn giải pháp quà tặng từ Landing Page",
  buttonText = "Gửi yêu cầu tư vấn",
  icon = <MessageSquare className="w-6 h-6 text-amber-900" />, // Icon tin nhắn màu Hổ phách
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
    if (!formData.name.trim())
      newErrors.name = "Vui lòng nhập tên của quý khách";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại liên hệ";
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
      }, 4000); // Tăng thời gian đọc thông báo thành công lên chút
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
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-[#F9F8F6] border border-stone-200 shadow-2xl rounded-sm overflow-hidden font-sans">
        {/* Background Texture nhẹ nhàng */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url("https://www.transparenttextures.com/patterns/cream-paper.png")`,
          }}
        />

        {/* Close Button - Màu Stone tối giản */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-900 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col h-full relative z-10">
          {isSuccess ? (
            // --- SUCCESS STATE: Sang trọng & Ấm áp ---
            <div className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[420px]">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300 border border-amber-100">
                <CheckCircle2 className="w-8 h-8 text-amber-700" />
              </div>

              <h2 className="font-serif text-3xl text-stone-900 mb-3 italic">
                Đã tiếp nhận yêu cầu
              </h2>
              <p className="text-stone-600 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                Cảm ơn quý khách đã tin tưởng <strong>Printz Curator</strong>.{" "}
                <br />
                Chuyên viên tư vấn sẽ liên hệ lại trong vòng{" "}
                <strong className="text-amber-800">24h</strong> làm việc.
              </p>

              <div className="w-full bg-white/50 rounded-sm p-4 border border-stone-200 text-xs text-stone-500 space-y-2 mb-6 backdrop-blur-sm">
                <p className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> Thông tin
                  được bảo mật tuyệt đối
                </p>
                <p className="italic">Tự động đóng sau giây lát...</p>
              </div>
            </div>
          ) : (
            // --- FORM STATE: Heritage Style ---
            <>
              {/* Header: Dùng màu Amber làm điểm nhấn */}
              <div className="px-8 pt-12 pb-6 text-center border-b border-stone-200/60">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 mb-5 shadow-sm border border-amber-100">
                  {icon}
                </div>

                <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-3 leading-tight">
                  {title}
                </h2>
                <p className="text-stone-500 text-sm font-light leading-relaxed max-w-sm mx-auto">
                  {subtitle}
                </p>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-[10px] font-bold uppercase tracking-widest text-stone-500 ml-1"
                    >
                      Tên của Quý khách
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="VD: Anh Phúc / Chị Thảo..."
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3.5 border bg-white text-stone-900 placeholder:text-stone-300 placeholder:font-light transition-all rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-500 hover:border-amber-300 ${
                        errors.name
                          ? "border-red-400 focus:border-red-500"
                          : "border-stone-200"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-[10px] ml-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>{" "}
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-[10px] font-bold uppercase tracking-widest text-stone-500 ml-1"
                    >
                      Số điện thoại liên hệ
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="VD: 0912 345 678"
                      disabled={isSubmitting}
                      className={`w-full px-4 py-3.5 border bg-white text-stone-900 placeholder:text-stone-300 placeholder:font-light transition-all rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-500 hover:border-amber-300 ${
                        errors.phone
                          ? "border-red-400 focus:border-red-500"
                          : "border-stone-200"
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-[10px] ml-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-500"></span>{" "}
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Submit Button - Style nút tối màu sang trọng */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-stone-900 hover:bg-amber-900 text-[#F9F8F6] rounded-sm font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-lg hover:shadow-xl mt-2 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Đang kết nối...</span>
                    ) : (
                      <>
                        {buttonText} <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* --- POLICY FOOTER --- */}
                <div className="mt-8 pt-6 border-t border-stone-200/60 text-center">
                  <p className="text-[10px] text-stone-400 mb-3 font-light italic">
                    Printz Curator cam kết bảo mật thông tin cá nhân của Quý
                    khách.
                  </p>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    <Link
                      to="/policy"
                      className="text-[10px] text-stone-500 hover:text-amber-800 underline decoration-stone-300 hover:decoration-amber-800 transition-all flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3 h-3" /> Chính sách Bảo mật
                    </Link>
                    <Link
                      to="/warranty"
                      className="text-[10px] text-stone-500 hover:text-amber-800 underline decoration-stone-300 hover:decoration-amber-800 transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3" /> Cam kết Độc bản
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
