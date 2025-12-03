/**
 * Editorial Design System Components
 * Các component mẫu theo Printz Editorial Style
 */

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

// 1. Editorial Section Container
export function EditorialSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative bg-[#F9F8F6] overflow-hidden ${className}`}>
      {/* Texture Overlay */}
      <div className="texture-overlay" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// 2. Editorial Button (Primary CTA)
export function EditorialButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button onClick={onClick} className={`btn-editorial ${className}`}>
      {children}
    </button>
  );
}

// 3. Editorial Link (Secondary)
export function EditorialLink({
  children,
  href,
  className = "",
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`link-editorial group inline-flex items-center gap-2 ${className}`}
    >
      {children}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </a>
  );
}

// 4. Editorial Card
export function EditorialCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`card-editorial p-6 ${className}`}>{children}</div>;
}

// 5. Editorial Label
export function EditorialLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`label-editorial ${className}`}>{children}</span>;
}

// 6. Editorial Heading
export function EditorialHeading({
  children,
  size = "xl",
  className = "",
}: {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-2xl md:text-4xl",
    md: "text-4xl md:text-6xl",
    lg: "text-6xl md:text-8xl",
    xl: "text-8xl md:text-9xl",
  };

  return (
    <h1
      className={`font-yrsa ${sizeClasses[size]} text-stone-900 leading-[0.95] tracking-tight ${className}`}
    >
      {children}
    </h1>
  );
}

// 7. Editorial Paragraph
export function EditorialParagraph({
  children,
  size = "base",
  className = "",
}: {
  children: ReactNode;
  size?: "sm" | "base" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "text-base",
    base: "text-lg",
    lg: "text-xl",
  };

  return (
    <p
      className={`${sizeClasses[size]} text-stone-600 font-light leading-relaxed ${className}`}
    >
      {children}
    </p>
  );
}

// 8. Editorial Image
export function EditorialImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      className={`img-editorial w-full h-full object-cover ${className}`}
    />
  );
}

// 9. Editorial Container
export function EditorialContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-[1440px] mx-auto px-8 lg:px-24 ${className}`}>
      {children}
    </div>
  );
}

// 10. Editorial Grid (2 columns)
export function EditorialGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 ${className}`}>
      {children}
    </div>
  );
}
