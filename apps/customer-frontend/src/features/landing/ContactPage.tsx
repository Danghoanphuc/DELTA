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
  User,
} from "lucide-react";
import { Header } from "./components/LandingHeader";
import { Footer } from "./components/LandingFooter";
import { LocationMap } from "./components/LocationMap";
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

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else {
      newErrors.phone = validatePhone(formData.phone);
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ";
    }

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

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HERO SECTION */}
      <section className="pt-32 pb-12 px-6 border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <span className="text-emerald-800 font-bold tracking-widest uppercase text-xs mb-3 block">
            Kết nối với Nhà Giám Tuyển
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-stone-900 leading-tight mb-4 italic">
            Khởi Đầu Một Mối Giao Hảo
          </h1>
          <p className="text-base text-stone-600 font-light max-w-2xl leading-relaxed">
            Hãy để chúng tôi lắng nghe câu chuyện của bạn và cùng nhau kiến tạo
            những tác phẩm quà tặng xứng tầm.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-[1440px] mx-auto grid lg:grid-cols-2 min-h-[600px]">
        {/* LEFT: INFO */}
        <div className="bg-stone-900 text-stone-200 p-8 md:p-16 flex flex-col justify-between">
          <div className="space-y-10">
            {/* Address */}
            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Văn phòng Printz
                </p>
                <p className="text-lg font-serif text-white mb-2">
                  Đường DK6A, Phường Thới Hòa,
                  <br />
                  TP. Hồ Chí Minh.
                </p>
                <p className="text-sm text-stone-400 italic">
                  Mời bạn ghé thăm để thưởng trà và trực tiếp cảm nhận chất
                  liệu.
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Hotline Tư vấn (24/7)
                </p>
                <a
                  href="tel:0865726848"
                  className="text-2xl font-serif text-white hover:text-emerald-400 transition-colors"
                >
                  0865 726 848
                </a>
                <p className="text-sm text-stone-400 mt-1">
                  Dành riêng cho Khách hàng Doanh nghiệp
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">
                  Email Hợp tác
                </p>
                <a
                  href="mailto:curator@annamcurator.vn"
                  className="text-2xl font-serif text-white hover:text-emerald-400 transition-colors"
                >
                  curator@annamcurator.vn
                </a>
              </div>
            </div>
          </div>

          {/* Service Pledge */}
          <div className="mt-12 pt-8 border-t border-stone-800">
            <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">
              Cam kết Dịch vụ
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Phản hồi Tận tâm
                  </p>
                  <p className="text-xs text-stone-400">
                    Phản hồi trong vòng 30 phút trong giờ hành chính
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Bảo mật Tuyệt đối
                  </p>
                  <p className="text-xs text-stone-400">
                    Chúng tôi tôn trọng sự riêng tư về thông tin người nhận quà
                    và chiến lược ngoại giao
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">Tư vấn 1:1</p>
                  <p className="text-xs text-stone-400">
                    Mỗi doanh nghiệp sẽ có một chuyên viên chăm sóc riêng biệt
                    (Personal Concierge)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="bg-white p-8 md:p-16 flex flex-col justify-center">
          <form
            onSubmit={handleSubmit}
            className="space-y-5 max-w-md mx-auto w-full"
          >
            <h3 className="font-serif text-2xl text-stone-900 mb-6 italic">
              Chia sẻ câu chuyện của bạn
            </h3>

            <div className="space-y-4">
              <div className="relative">
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tên của quý khách *"
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
                    placeholder="Số điện thoại liên hệ *"
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
                    placeholder="Email công việc"
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
                  placeholder="Quý khách đang tìm kiếm giải pháp quà tặng cho dịp nào? (VD: Quà Tết, Tặng đối tác nước ngoài, Kỷ niệm thành lập...)"
                  required
                  disabled={isSubmitting}
                  className={`border-0 border-b px-0 py-3 text-base min-h-[120px] resize-none focus-visible:ring-0 bg-transparent rounded-none placeholder:text-stone-400 ${
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

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-900 hover:bg-emerald-900 text-white rounded-sm h-12 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}{" "}
                <Send className="w-3 h-3" />
              </Button>
              <p className="text-[10px] text-stone-400 mt-3 text-center">
                Thông tin được bảo mật tuyệt đối theo{" "}
                <Link to="/policy" className="underline hover:text-stone-900">
                  Chính sách Bảo mật
                </Link>{" "}
                của chúng tôi.
              </p>
            </div>

            <div className="pt-8 mt-4 border-t border-stone-100 grid grid-cols-2 gap-2">
              <Link
                to="/policy/limited"
                className="text-xs text-stone-500 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3 h-3" /> Chính sách Độc bản & Giới hạn
              </Link>
              <Link
                to="/policy/bespoke"
                className="text-xs text-stone-500 hover:text-emerald-800 flex items-center gap-1.5 transition-colors"
              >
                <FileText className="w-3 h-3" /> Quy trình Chế tác & Đặt hàng
              </Link>
            </div>
          </form>
        </div>
      </div>

      <LocationMap />

      {/* CEO CONTACT BOX */}
      <section className="py-16 px-6 bg-[#F9F8F6]">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-amber-400 text-2xl">
              ✦
            </div>
            <div className="absolute bottom-4 left-8 text-emerald-400 text-lg">
              ✦
            </div>
            <div className="absolute top-6 right-6 text-3xl">👀</div>

            <div className="flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
              {/* CEO Photo */}
              <div className="shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-stone-100 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop"
                    alt="Raymond - Giám đốc điều hành"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <p className="text-xl md:text-2xl text-stone-600 mb-2 font-light">
                  Tất nhiên, bạn cũng có thể liên hệ với chúng tôi
                </p>
                <p className="text-xl md:text-2xl text-stone-900 font-serif italic mb-4">
                  → Giám đốc điều hành nếu bạn muốn.
                </p>

                <div className="mb-4">
                  <p className="font-bold text-stone-900">Đặng Hoàn Phúc</p>
                  <p className="text-sm text-emerald-700 uppercase tracking-widest text-xs">
                    Giám đốc điều hành
                  </p>
                </div>

                {/* Contact buttons */}
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <a
                    href="mailto:phucdh@printz.vn"
                    className="w-10 h-10 rounded-sm bg-stone-900 hover:bg-emerald-900 flex items-center justify-center transition-colors"
                    title="Email"
                  >
                    <Mail className="w-5 h-5 text-white" />
                  </a>
                  <a
                    href="https://zalo.me/0865726848"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-sm bg-stone-900 hover:bg-emerald-900 flex items-center justify-center transition-colors"
                    title="Zalo"
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 48 48"
                    >
                      <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm7.747 28.773c-.465.93-1.86 1.707-2.79 1.86-.93.155-1.86.465-6.2-1.395-5.27-2.325-8.525-7.905-8.835-8.215-.31-.465-2.325-3.255-2.325-6.2 0-2.945 1.395-4.34 1.86-4.96.465-.62 1.085-.775 1.395-.775.31 0 .62 0 .93.155.31.155.775.155 1.085.93.31.775 1.24 3.1 1.395 3.255.155.31.31.62.155.93-.155.31-.31.62-.465.93-.31.31-.62.62-.93.93-.31.31-.62.62-.31 1.085.31.465 1.395 2.325 3.1 3.72 2.17 1.86 3.875 2.48 4.495 2.79.62.31.93.155 1.24-.155.31-.31 1.24-1.395 1.55-1.86.31-.465.775-.465 1.24-.31.465.155 2.945 1.395 3.41 1.705.465.31.93.465 1.085.775.155.31.155 1.55-.31 2.79z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
