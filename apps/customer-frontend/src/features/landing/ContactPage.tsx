import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  FileText,
  Send,
} from "lucide-react";
import { Header } from "./components/LandingHeader";
import { Footer } from "./components/LandingFooter";
import { LocationMap } from "./components/LocationMap"; // Import component bản đồ Phúc vừa tạo
import { Link } from "react-router-dom";
import { useContactForm } from "./hooks/useContactForm";

export default function ContactPage() {
  const { isSubmitting, submitForm } = useContactForm();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length < 10) {
      return "Số điện thoại phải có ít nhất 10 chữ số";
    }

    if (cleanPhone.length > 11) {
      return "Số điện thoại không được quá 11 chữ số";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      email: "",
      message: "",
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }

    // Validate phone
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else {
      newErrors.phone = validatePhone(formData.phone);
    }

    // Validate email (optional but if provided, must be valid)
    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate message
    if (!formData.message.trim()) {
      newErrors.message = "Vui lòng nhập nội dung cần hỗ trợ";
    }

    setErrors(newErrors);
    return (
      !newErrors.name &&
      !newErrors.phone &&
      !newErrors.email &&
      !newErrors.message
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const success = await submitForm({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      message: formData.message,
    });

    if (success) {
      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        message: "",
      });
      setErrors({
        name: "",
        phone: "",
        email: "",
        message: "",
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // For phone field, only allow numbers and common phone formatting characters
    if (name === "phone") {
      const cleanValue = value.replace(/[^\d\s\-\+\(\)]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: cleanValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-12 px-6 border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <span className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-3 block">
            Liên hệ Printz
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-4">
            Kết nối với chúng tôi
          </h1>
          <p className="text-base text-stone-600 font-light max-w-xl">
            Đội ngũ Printz sẵn sàng tư vấn giải pháp in ấn & quà tặng B2B tối ưu
            nhất cho bạn trong vòng <strong>15 phút</strong>.
          </p>
        </div>
      </section>

      {/* 2. MAIN CONTENT: INFO & FORM */}
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 min-h-[600px]">
        {/* LEFT: INFO */}
        <div className="bg-stone-900 text-stone-200 p-8 md:p-16 flex flex-col justify-between">
          <div className="space-y-10">
            {/* Address - Đã cập nhật về Bình Dương để khớp với Map */}
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Văn phòng & Xưởng
                </p>
                <p className="text-lg font-serif text-white">
                  Số 123 Đại lộ Bình Dương, P. Phú Thọ,
                  <br />
                  TP. Thủ Dầu Một, Bình Dương.
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Hotline B2B (24/7)
                </p>
                <a
                  href="tel:0865726848"
                  className="text-2xl font-serif text-white hover:text-emerald-400"
                >
                  0865 726 848
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Email
                </p>
                <a
                  href="mailto:b2b@printz.vn"
                  className="text-2xl font-serif text-white hover:text-emerald-400"
                >
                  b2b@printz.vn
                </a>
              </div>
            </div>
          </div>

          {/* SLA Compact */}
          <div className="mt-12 pt-8 border-t border-stone-800 grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Clock className="w-4 h-4" />{" "}
                <span className="font-bold text-xs uppercase">
                  Phản hồi 5 phút
                </span>
              </div>
              <p className="text-stone-500 text-xs">Trong giờ hành chính</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <ShieldCheck className="w-4 h-4" />{" "}
                <span className="font-bold text-xs uppercase">
                  Bảo hành 1-1
                </span>
              </div>
              <p className="text-stone-500 text-xs">Cam kết chất lượng</p>
            </div>
          </div>
        </div>

        {/* RIGHT: COMPACT FORM */}
        <div className="bg-white p-8 md:p-16 flex flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 max-w-md mx-auto w-full"
          >
            <h3 className="font-serif text-2xl text-stone-900 mb-6">
              Gửi yêu cầu báo giá
            </h3>

            {/* Nhập liệu gọn gàng */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Họ và tên của bạn *"
                  required
                  disabled={isSubmitting}
                  className={`border-0 border-b px-0 py-3 text-base focus-visible:ring-0 bg-transparent rounded-none placeholder:text-stone-400 ${
                    errors.name
                      ? "border-red-500 focus-visible:border-red-600"
                      : "border-stone-200 focus-visible:border-emerald-800"
                  }`}
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1 absolute">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative">
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Số điện thoại *"
                    required
                    disabled={isSubmitting}
                    className={`border-0 border-b px-0 py-3 text-base focus-visible:ring-0 bg-transparent rounded-none placeholder:text-stone-400 ${
                      errors.phone
                        ? "border-red-500 focus-visible:border-red-600"
                        : "border-stone-200 focus-visible:border-emerald-800"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-600 text-xs mt-1 absolute">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Email (Nếu có)"
                    disabled={isSubmitting}
                    className={`border-0 border-b px-0 py-3 text-base focus-visible:ring-0 bg-transparent rounded-none placeholder:text-stone-400 ${
                      errors.email
                        ? "border-red-500 focus-visible:border-red-600"
                        : "border-stone-200 focus-visible:border-emerald-800"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1 absolute">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative">
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Nội dung cần hỗ trợ (Ví dụ: In 100 bộ Giftset Tết...)"
                  required
                  disabled={isSubmitting}
                  className={`border-0 border-b px-0 py-3 text-base min-h-[100px] resize-none focus-visible:ring-0 bg-transparent rounded-none placeholder:text-stone-400 ${
                    errors.message
                      ? "border-red-500 focus-visible:border-red-600"
                      : "border-stone-200 focus-visible:border-emerald-800"
                  }`}
                />
                {errors.message && (
                  <p className="text-red-600 text-xs mt-1 absolute">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit & Policy */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-emerald-900 text-white rounded-sm h-12 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi ngay"}{" "}
                <Send className="w-3 h-3" />
              </Button>
              <p className="text-[10px] text-stone-400 mt-3 text-center">
                Thông tin được bảo mật theo{" "}
                <Link to="/policy" className="underline hover:text-stone-900">
                  CSBM
                </Link>{" "}
                của Printz.
              </p>
            </div>

            {/* Quick Links Compact - Tích hợp đầy đủ theo yêu cầu */}
            <div className="pt-8 mt-4 border-t border-stone-100 grid grid-cols-2 gap-2">
              <Link
                to="/policy/shipping"
                className="text-xs text-stone-500 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3 h-3" /> Chính sách Giao vận
              </Link>
              <Link
                to="/policy/warranty"
                className="text-xs text-stone-500 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3 h-3" /> Bảo hành & Đổi trả
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* 3. LOCATION MAP - Nhúng vào đây */}
      <LocationMap />

      <Footer />
    </div>
  );
}
