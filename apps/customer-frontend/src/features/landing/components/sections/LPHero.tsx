import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sample product images - replace with actual images
const FLOATING_PRODUCTS = [
  { id: 1, emoji: "👕", label: "Áo thun", top: "15%", left: "8%", delay: 0 },
  { id: 2, emoji: "🎒", label: "Balo", top: "25%", right: "12%", delay: 0.2 },
  { id: 3, emoji: "☕", label: "Ly sứ", bottom: "30%", left: "5%", delay: 0.4 },
  {
    id: 4,
    emoji: "📓",
    label: "Sổ tay",
    bottom: "20%",
    right: "8%",
    delay: 0.6,
  },
  { id: 5, emoji: "🧢", label: "Nón", top: "45%", left: "2%", delay: 0.3 },
  { id: 6, emoji: "🖊️", label: "Bút", top: "60%", right: "5%", delay: 0.5 },
];

const TRUSTED_LOGOS = ["VinGroup", "FPT", "Viettel", "MWG", "Techcombank"];

export function LPHero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating products */}
      {FLOATING_PRODUCTS.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: product.delay + 0.5, duration: 0.5 }}
          className="absolute hidden lg:flex items-center justify-center"
          style={{
            top: product.top,
            left: product.left,
            right: product.right,
            bottom: product.bottom,
          }}
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{
              duration: 3 + product.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl shadow-xl border border-white/20"
          >
            {product.emoji}
          </motion.div>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Nền tảng quà tặng & ấn phẩm thương hiệu #1 Việt Nam
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6"
          >
            Quà tặng thương hiệu
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              người nhận muốn giữ
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10"
          >
            Từ thiết kế, sản xuất đến giao hàng tận tay. Chúng tôi lo tất cả để
            thương hiệu của bạn tỏa sáng.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Button
              onClick={() => navigate("/contact")}
              size="lg"
              className="bg-white text-slate-900 hover:bg-white/90 rounded-full px-8 py-7 text-base font-bold shadow-2xl shadow-white/20 hover:shadow-white/30 transition-all"
            >
              Nhận báo giá miễn phí
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              onClick={() => navigate("/shop")}
              variant="ghost"
              size="lg"
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full px-8 py-7 text-base font-medium"
            >
              <Play className="mr-2 w-5 h-5 fill-current" />
              Xem cách hoạt động
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 max-w-xl mx-auto mb-16"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                500+
              </div>
              <div className="text-sm text-white/50">Doanh nghiệp</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                50K+
              </div>
              <div className="text-sm text-white/50">Sản phẩm đã giao</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                98%
              </div>
              <div className="text-sm text-white/50">Hài lòng</div>
            </div>
          </motion.div>

          {/* Trusted by */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-sm text-white/40 mb-6 uppercase tracking-wider">
              Được tin dùng bởi
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
              {TRUSTED_LOGOS.map((logo, i) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ opacity: 1 }}
                  className="text-white font-bold text-lg sm:text-xl tracking-tight cursor-default transition-opacity"
                >
                  {logo}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
