import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Clock,
  Copyright,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Logo } from "@/shared/components/ui/Logo";

// Custom Social Media Icons (replacing deprecated Lucide icons)
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

// Custom Pinterest Icon (Lucide doesn't have Pinterest)
function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-400 font-sans border-t border-stone-900">
      {/* 1. NEWSLETTER SECTION - "BẢN TIN DI SẢN" */}
      <div className="border-b border-stone-800">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center lg:text-left">
            <span className="text-amber-700 font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
              The Artisan Newsletter
            </span>
            <h3 className="text-2xl md:text-3xl text-stone-100 font-serif mb-3">
              Đăng ký nhận "Bản tin Di sản"
            </h3>
            <p className="text-stone-500 font-light text-sm leading-relaxed">
              Nhận các bài viết chuyên sâu về gốm men rạn, xu hướng quà tặng
              ngoại giao và thư mời sự kiện kín từ Giám tuyển.
            </p>
          </div>

          <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input
                type="email"
                placeholder="Email doanh nghiệp của bạn"
                className="w-full h-12 bg-stone-900 border border-stone-800 rounded-sm pl-11 pr-4 text-stone-200 text-sm focus:outline-none focus:border-amber-800 transition-colors placeholder:text-stone-600"
              />
            </div>
            <Button className="h-12 bg-amber-800 hover:bg-amber-900 text-white rounded-sm px-8 font-bold text-xs uppercase tracking-widest transition-all">
              Đăng ký
            </Button>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* CỘT 1: THƯƠNG HIỆU (4/12) */}
          <div className="lg:col-span-4 space-y-6 pr-8">
            <div className="mb-6">
              <Logo variant="full" color="white" />{" "}
              {/* Logo trắng cho nền đen */}
            </div>
            <p className="text-stone-500 text-sm leading-relaxed font-light">
              Nhà giám tuyển quà tặng di sản hàng đầu Việt Nam. Chúng tôi kể câu
              chuyện về vị thế doanh nghiệp thông qua ngôn ngữ của Gốm, Sơn mài
              và Lụa truyền thống.
            </p>
            <div className="flex gap-4 pt-2">
              {[
                {
                  Icon: FacebookIcon,
                  href: "https://www.facebook.com/profile.php?id=61581651096355",
                  label: "Facebook",
                },
                {
                  Icon: InstagramIcon,
                  href: "https://www.instagram.com/hoanphuc.16",
                  label: "Instagram",
                },
                {
                  Icon: TikTokIcon,
                  href: "https://www.tiktok.com/@printz.vn",
                  label: "TikTok",
                },
                {
                  Icon: YoutubeIcon,
                  href: "https://www.youtube.com/@DangHoanPhuc",
                  label: "YouTube",
                },
                {
                  Icon: PinterestIcon,
                  href: "https://www.pinterest.com/printzcurators/_profile/",
                  label: "Pinterest",
                },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-stone-500 hover:bg-amber-900 hover:text-white transition-all duration-300 border border-stone-800 hover:border-amber-900"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* CỘT 2: NĂNG LỰC GIÁM TUYỂN (2/12) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs border-b border-stone-800 pb-4 inline-block">
              Năng Lực
            </h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <Link
                  to="/solutions/corporate-gifting"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Tư vấn Ngoại giao
                </Link>
              </li>
              <li>
                <Link
                  to="/bespoke"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Chế tác Độc bản
                </Link>
              </li>
              <li>
                <Link
                  to="/shop"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Kho tàng Tác phẩm
                </Link>
              </li>
              <li>
                <Link
                  to="/process"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Quy trình Đóng gói
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-amber-600 hover:text-amber-500 transition-colors block py-1 font-medium flex items-center gap-2"
                >
                  Tải Hồ sơ năng lực <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CHÍNH SÁCH ĐẶC QUYỀN (3/12) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs border-b border-stone-800 pb-4 inline-block">
              Chính Sách Đặc Quyền
            </h4>
            <ul className="space-y-4 text-sm font-light">
              <li>
                <Link
                  to="/shipping-policy"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Chứng thư Giám tuyển
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-policy"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Vận chuyển Bảo đảm 100%
                </Link>
              </li>
              <li>
                <Link
                  to="/warranty"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Bảo hành "1 đổi 1" (Vỡ do vận chuyển)
                </Link>
              </li>
              <li>
                <Link
                  to="/design-guidelines"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Hướng dẫn Thiết kế Logo
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Câu hỏi thường gặp (B2B)
                </Link>
              </li>
              <li>
                <Link
                  to="/editorial-policy"
                  className="hover:text-amber-500 transition-colors block py-1"
                >
                  Chính sách Biên tập
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: VĂN PHÒNG GIÁM TUYỂN (3/12) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="text-stone-100 font-bold uppercase tracking-widest text-xs border-b border-stone-800 pb-4 inline-block">
              Văn Phòng Giám Tuyển
            </h4>
            <ul className="space-y-4 text-sm font-light text-stone-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-200 block mb-1">
                    Văn phòng:
                  </strong>
                  Đường DK6A, Phường Thới Hòa, TP. Hồ Chí Minh.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-200 block mb-1">
                    Hotline 24/7:
                  </strong>
                  <a
                    href="tel:0865726848"
                    className="hover:text-white transition-colors"
                  >
                    0865 726 848
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-stone-200 block mb-1">
                    Giờ làm việc:
                  </strong>
                  08:00 - 18:00 (Thứ 2 - Thứ 7)
                  <br />
                  <span className="text-xs italic opacity-70">
                    Chủ nhật: Vui lòng đặt hẹn trước.
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. COPYRIGHT & BOTTOM BAR */}
      <div className="bg-black py-6 border-t border-stone-900">
        <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-stone-600 text-xs flex items-center gap-1">
            <Copyright className="w-3 h-3" /> 2024 Printz Vietnam. Bảo lưu mọi
            quyền.
          </p>

          <div className="flex items-center gap-6">
            <span className="text-stone-600 text-xs italic font-serif">
              "Tinh hoa Cổ - Vị thế Kim"
            </span>
            <div className="h-3 w-[1px] bg-stone-800 hidden md:block"></div>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-stone-600">
              <Link to="/policy" className="hover:text-stone-400">
                Riêng tư
              </Link>
              <Link to="/policy" className="hover:text-stone-400">
                Điều khoản
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
