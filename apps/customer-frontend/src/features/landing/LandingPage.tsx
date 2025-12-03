import { Header, Footer } from "./components";
import {
  LPHero,
  LPSocialProof,
  LPFeaturedCategories,
  LPProcess,
  LPAiUsp, // Giữ lại Zin AI nhưng định vị là Design Assistant
  LPFeaturedProducts,
  LPCta,
} from "./components/sections";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <Header />

      <main>
        <LPHero />
        <LPSocialProof />

        {/* Value Proposition Statement */}
        <section className="py-16 bg-slate-50 text-center px-4">
          <p className="text-2xl md:text-3xl font-serif italic text-slate-600 max-w-4xl mx-auto leading-relaxed">
            "Doanh nghiệp không cần một cái chợ in ấn giá rẻ. <br />
            Họ cần một đối tác đảm bảo{" "}
            <strong className="text-slate-900 not-italic">
              hình ảnh thương hiệu
            </strong>{" "}
            luôn hoàn hảo."
          </p>
        </section>

        <LPProcess />
        <LPFeaturedCategories />
        <LPAiUsp />
        <LPFeaturedProducts />
        <LPCta />
      </main>

      <Footer />
    </div>
  );
}
