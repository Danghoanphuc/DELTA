import React from "react";
import { useScrollAnimation } from "@/shared/hooks/useScrollAnimation";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

// Animation variants for different effects
const animationVariants = {
  fadeInUp: {
    initial: "opacity-0 translate-y-8",
    animate: "opacity-100 translate-y-0",
    transition: "transition-all duration-700 ease-out",
  },
  fadeInDown: {
    initial: "opacity-0 -translate-y-8",
    animate: "opacity-100 translate-y-0",
    transition: "transition-all duration-700 ease-out",
  },
  fadeInLeft: {
    initial: "opacity-0 -translate-x-8",
    animate: "opacity-100 translate-x-0",
    transition: "transition-all duration-700 ease-out",
  },
  fadeInRight: {
    initial: "opacity-0 translate-x-8",
    animate: "opacity-100 translate-x-0",
    transition: "transition-all duration-700 ease-out",
  },
  fadeIn: {
    initial: "opacity-0",
    animate: "opacity-100",
    transition: "transition-opacity duration-700 ease-out",
  },
  scaleIn: {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
    transition: "transition-all duration-700 ease-out",
  },
};

interface ScrollAnimationProps {
  children: React.ReactNode;
  variant?: keyof typeof animationVariants;
  delay?: number;
  className?: string;
  options?: UseScrollAnimationOptions;
}

export function ScrollAnimation({
  children,
  variant = "fadeInUp",
  delay = 0,
  className = "",
  options = {},
}: ScrollAnimationProps) {
  const { elementRef, isVisible } = useScrollAnimation(options);
  const animation = animationVariants[variant];

  return (
    <div
      ref={elementRef}
      className={`${animation.initial} ${isVisible ? animation.animate : ""} ${
        animation.transition
      } ${className}`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      }}
    >
      {children}
    </div>
  );
}
