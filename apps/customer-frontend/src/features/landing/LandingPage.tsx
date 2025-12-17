import { Header, Footer } from "./components";
import {
  LPSocialProof,
  LPPlatformFeatures,
  LPCta,
  LPMap,
  MagazineHero,
} from "./components/sections";
import { CuratorManifesto } from "./components/sections/CuratorManifesto";
import { EditorsPick } from "./components/sections/EditorsPick";
import { useTranslation } from "react-i18next";
import { LanguageSEO } from "@/components/seo/LanguageSEO";
import { StructuredData } from "@/components/seo/StructuredData";

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900 selection:bg-amber-200 selection:text-amber-900">
      <LanguageSEO
        title="Printz Curator | Quà Tặng Ngoại Giao & Di Sản"
        description="Nhà giám tuyển quà tặng B2B cao cấp. Nơi kết tinh di sản Việt thành vị thế doanh nghiệp."
        keywords={t("seo.keywords")}
        image="https://printz.vn/og-magazine-cover.jpg"
      />
      <StructuredData />

      {/* MENU HEADER */}
      <Header transparent={true} />

      <main>
        {/* 1. MAGAZINE COVER (Thay LPHero cũ) */}
        <MagazineHero />

        {/* 2. TRUST NETWORK (Giữ nguyên - Rất quan trọng với B2B) */}
        <LPSocialProof />

        {/* 3. EDITOR'S PICK (Mới - Dẫn vào bài viết 5 Khúc) */}
        <EditorsPick />

        {/* 4. CURATOR MANIFESTO - Giải thích sự khác biệt */}
        <CuratorManifesto />

        {/* 5. THE COLLECTIONS - Placeholder for future B2B Solutions section */}

        {/* 5. CORE VALUES (Giữ nguyên) */}
        <LPPlatformFeatures />

        {/* 6. MAP & CTA (Giữ nguyên) */}
        <LPMap />
        <LPCta />
      </main>

      <Footer />
    </div>
  );
}
