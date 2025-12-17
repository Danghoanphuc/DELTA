// ProductDetailPage.tsx - REFACTORED theo SOLID principles
// Single Responsibility: Chỉ orchestrate các sections, không chứa UI logic

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useProductDetail } from "../hooks/useProductDetail";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

// Import section components
import { HeroSection } from "../components/product-detail/HeroSection";
import { IntroSection } from "../components/product-detail/IntroSection";
import {
  StorytellingMaterialSection,
  StorytellingProcessSection,
} from "../components/product-detail/StorytellingSection";
import { GallerySection } from "../components/product-detail/GallerySection";
import { ApplicationSection } from "../components/product-detail/ApplicationSection";
import { CustomizationSection } from "../components/product-detail/CustomizationSection";
import { ArtisanSection } from "../components/product-detail/ArtisanSection";
import { ContactSection } from "../components/product-detail/ContactSection";
import { SectionNavigation } from "../components/product-detail/SectionNavigation";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { product, loading } = useProductDetail();

  const [isMuted, setIsMuted] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef<HTMLElement[]>([]);

  const sectionNames = [
    "Trang chủ",
    "Giới thiệu",
    "Nguyên liệu",
    "Quy trình",
    "Chi tiết",
    "Ứng dụng",
    "Cá nhân hóa",
    "Nghệ nhân",
    "Liên hệ",
  ];

  // Hide scroll hint after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Collect sections
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>("[data-section]");
    sectionsRef.current = Array.from(sections);
  }, [product]);

  // Intersection Observer for section tracking
  useEffect(() => {
    const sections = document.querySelectorAll("[data-section]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in-up");
            const sectionIndex = parseInt(
              entry.target.getAttribute("data-section") || "0"
            );
            setActiveSection(sectionIndex);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [product]);

  // Fullpage Scroll - One wheel = One section
  useEffect(() => {
    let isScrollingLocal = false;
    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingLocal) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      const direction = e.deltaY > 0 ? 1 : -1;

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let currentIndex = 0;

      sectionsRef.current.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        if (scrollPosition >= sectionTop) {
          currentIndex = index;
        }
      });

      const nextIndex = Math.max(
        0,
        Math.min(sectionsRef.current.length - 1, currentIndex + direction)
      );

      if (nextIndex !== currentIndex) {
        isScrollingLocal = true;

        const targetSection = sectionsRef.current[nextIndex];
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrollingLocal = false;
        }, 600);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleVideoToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleContactClick = () => {
    document
      .getElementById("contact-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSectionClick = (idx: number) => {
    const section = sectionsRef.current[idx];
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveSection(idx);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-900">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-stone-900 text-white">
        <h2 className="font-serif text-2xl">Không tìm thấy tác phẩm</h2>
        <Button onClick={() => navigate("/shop")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Bộ sưu tập
        </Button>
      </div>
    );
  }

  return (
    <div className="relative bg-stone-50 text-stone-900">
      {/* Section Navigation Header */}
      <SectionNavigation
        activeSection={activeSection}
        sectionNames={sectionNames}
        sectionsRef={sectionsRef}
        onSectionClick={handleSectionClick}
        onContactClick={handleContactClick}
      />

      {/* Hero Section */}
      <HeroSection
        product={product}
        showScrollHint={showScrollHint}
        isMuted={isMuted}
        onVideoToggle={handleVideoToggle}
        onContactClick={handleContactClick}
      />

      {/* Introduction Section */}
      <IntroSection product={product} />

      {/* Storytelling - Nguyên liệu */}
      <StorytellingMaterialSection product={product} />

      {/* Storytelling - Quy trình */}
      <StorytellingProcessSection product={product} />

      {/* Gallery Section - Chi tiết */}
      <GallerySection product={product} />

      {/* Application Section - Ứng dụng */}
      <ApplicationSection product={product} />

      {/* Customization Section - Cá nhân hóa */}
      <CustomizationSection product={product} />

      {/* Artisan Section - Nghệ nhân */}
      <ArtisanSection product={product} />

      {/* Contact Section - Liên hệ */}
      <ContactSection />
    </div>
  );
}
