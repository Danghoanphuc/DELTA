import { Facebook, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/shared/components/ui/Logo";

export function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-stone-100 text-stone-900 font-sans border-t border-stone-200">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 mb-20">
          {/* CỘT 1: BRAND IDENTITY (Chiếm 4 cột) */}
          <div className="md:col-span-4 space-y-8 pr-8">
            <Logo variant="full" color="default" />

            <p className="text-stone-500 leading-relaxed font-light text-lg">
              The premium infrastructure for corporate printing & brand
              management.
            </p>

            {/* Social Icons - Minimal */}
            <div className="flex gap-4 pt-4">
              {[Facebook, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 flex items-center justify-center border border-stone-300 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all rounded-none"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* CỘT 2: SHOP (Chiếm 2 cột) */}
          <div className="md:col-span-2">
            <h4 className="font-serif text-2xl font-bold text-stone-900 mb-8 italic">
              Products.
            </h4>
            <ul className="space-y-4">
              {["Business Cards", "Marketing", "Stickers", "Packaging"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => handleNavClick("/shop")}
                      className="text-stone-500 hover:text-emerald-800 transition-colors text-sm font-medium uppercase tracking-wide"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* CỘT 3: COMPANY (Chiếm 2 cột) */}
          <div className="md:col-span-2">
            <h4 className="font-serif text-2xl font-bold text-stone-900 mb-8 italic">
              Company.
            </h4>
            <ul className="space-y-4">
              {["Our Story", "For Enterprise", "Sustainability", "Careers"].map(
                (item) => (
                  <li key={item}>
                    <button
                      onClick={() => handleNavClick("/about")}
                      className="text-stone-500 hover:text-emerald-800 transition-colors text-sm font-medium uppercase tracking-wide"
                    >
                      {item}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* CỘT 4: NEWSLETTER (Chiếm 4 cột) */}
          <div className="md:col-span-4 bg-white p-8 border border-stone-200">
            <h4 className="font-serif text-2xl font-bold text-stone-900 mb-4 italic">
              Stay in the know.
            </h4>
            <p className="text-stone-500 text-sm mb-6">
              Nhận thông tin về xu hướng thiết kế và mã ưu đãi độc quyền.
            </p>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-stone-50 border-b-2 border-stone-200 px-4 py-3 outline-none focus:border-emerald-800 transition-colors rounded-none placeholder:text-stone-400"
              />
              <button className="bg-stone-900 text-white px-6 py-3 hover:bg-emerald-900 transition-colors rounded-none">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-stone-300 flex flex-col md:flex-row justify-between items-center text-xs font-mono text-stone-400 uppercase tracking-widest gap-4">
          <p>© 2025 PRINTZ VIETNAM INC.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-stone-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-stone-900">
              Terms of Service
            </a>
            <a href="#" className="hover:text-stone-900">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
