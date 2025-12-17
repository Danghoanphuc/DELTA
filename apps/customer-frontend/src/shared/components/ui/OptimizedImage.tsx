// apps/customer-frontend/src/shared/components/ui/OptimizedImage.tsx
// Performance-optimized image component with WebP, lazy loading, and proper dimensions

import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean; // If true, load immediately (above-the-fold images)
  placeholder?: "blur" | "empty";
  objectFit?: "cover" | "contain" | "fill" | "none";
  sizes?: string; // Responsive sizes attribute
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Convert image URL to WebP format (for Cloudinary/Unsplash)
 * Adds optimization parameters for better performance
 */
function getOptimizedUrl(src: string, width?: number): string {
  if (!src) return "";

  // Cloudinary optimization
  if (src.includes("cloudinary.com")) {
    // Add WebP format and quality optimization
    const params = ["f_webp", "q_auto:good"];
    if (width) params.push(`w_${width}`);

    // Insert params before /upload/ or after /upload/
    if (src.includes("/upload/")) {
      return src.replace("/upload/", `/upload/${params.join(",")}/`);
    }
    return src;
  }

  // Unsplash optimization
  if (src.includes("unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("fm", "webp");
    url.searchParams.set("q", "80");
    if (width) url.searchParams.set("w", width.toString());
    return url.toString();
  }

  // UI Avatars - already optimized
  if (src.includes("ui-avatars.com")) {
    return src;
  }

  // Placehold.co - add webp
  if (src.includes("placehold.co")) {
    return src.replace(/\.(png|jpg|jpeg)/, ".webp");
  }

  return src;
}

/**
 * Generate srcset for responsive images
 */
function generateSrcSet(src: string, baseWidth?: number): string {
  if (!src || src.includes("ui-avatars.com")) return "";

  const widths = baseWidth
    ? [baseWidth, baseWidth * 1.5, baseWidth * 2]
    : [320, 640, 960, 1280];

  return widths
    .map((w) => `${getOptimizedUrl(src, Math.round(w))} ${Math.round(w)}w`)
    .join(", ");
}

/**
 * OptimizedImage - Performance-optimized image component
 *
 * Features:
 * - Automatic WebP conversion for Cloudinary/Unsplash
 * - Native lazy loading
 * - Proper width/height to prevent CLS
 * - Blur placeholder option
 * - Responsive srcset
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  placeholder = "empty",
  objectFit = "cover",
  sizes,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Optimized URL
  const optimizedSrc = getOptimizedUrl(src, width);
  const srcSet = generateSrcSet(src, width);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Check if image is already cached
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  // Object fit class
  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
  }[objectFit];

  // Error fallback
  if (hasError) {
    return (
      <div
        className={`bg-stone-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-stone-400 text-xs">Không tải được ảnh</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur placeholder */}
      {placeholder === "blur" && !isLoaded && (
        <div
          className="absolute inset-0 bg-stone-200 animate-pulse"
          style={{ width, height }}
        />
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        srcSet={srcSet || undefined}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          ${objectFitClass}
          ${placeholder === "blur" && !isLoaded ? "opacity-0" : "opacity-100"}
          transition-opacity duration-300
        `}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "auto",
        }}
      />
    </div>
  );
}

export default OptimizedImage;
