import { Header, Footer } from "./components";
import {
  LPHero,
  LPSocialProof,
  LPPlatformFeatures,
  LPProcess,
  LPCta,
  LPMap,
  LPB2BSolutions,
} from "./components/sections";
import { useTranslation } from "react-i18next";
import { LanguageSEO } from "@/components/seo/LanguageSEO";
import { StructuredData } from "@/components/seo/StructuredData";

function ValueProposition() {
  return (
    <section className="py-20 bg-stone-50 text-center px-4 border-b border-stone-200">
      <p className="text-2xl md:text-4xl font-serif italic text-stone-500 max-w-5xl mx-auto leading-relaxed">
        "Thương hiệu không được xây dựng bằng giá cả,{" "}
        <br className="hidden md:block" />
        mà bằng những{" "}
        <strong className="text-stone-900 not-italic border-b-2 border-emerald-500">
          thông điệp nhất quán
        </strong>
        <br className="hidden md:block" />
        và{" "}
        <strong className="text-stone-900 not-italic border-b-2 border-emerald-500">
          niềm tin
        </strong>{" "}
        gieo vào{" "}
        <strong className="text-stone-900 not-italic border-b-2 border-emerald-500">
          tâm trí
        </strong>{" "}
        đối tác."
      </p>
    </section>
  );
}
export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-900">
      <LanguageSEO
        title={t("seo.title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
        image="https://printz.vn/og-image.jpg"
      />
      <StructuredData />
      <Header />

      <main>
        <LPHero />

        {/* Social Proof - Đặt ngay sau Hero để lấy Trust */}
        <LPSocialProof />

        {/* Value Proposition Statement */}
        <ValueProposition />

        {/* CORE SOLUTIONS (Thay cho Featured Categories cũ) */}
        <LPB2BSolutions />

        {/* PLATFORM FEATURES */}
        <LPPlatformFeatures />

        {/* HOW IT WORKS */}
        <LPProcess />

        {/* MAP - Vietnam Coverage */}
        <LPMap />

        <LPCta />
      </main>

      <Footer />
    </div>
  );
}
