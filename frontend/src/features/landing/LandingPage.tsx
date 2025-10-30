// src/features/landing/LandingPage.tsx (ĐÃ DỌN DẸP)

import { Header, Footer } from "./components";
import {
  LPHero,
  LPSocialProof,
  LPFeaturedCategories,
  LPProcess,
  LPAiUsp,
  LPFeaturedProducts,
  LPBlog,
  LPCta,
} from "./components/sections"; // <-- 1. Import tất cả section từ file index

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* 2. Render các component section theo thứ tự */}
      <LPHero />
      <LPSocialProof />
      <LPFeaturedCategories />
      <LPProcess />
      <LPAiUsp />
      <LPFeaturedProducts />
      <LPBlog />
      <LPCta />

      <Footer />
    </div>
  );
}
