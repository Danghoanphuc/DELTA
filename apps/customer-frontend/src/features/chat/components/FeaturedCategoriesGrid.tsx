// src/features/chat/components/FeaturedCategoriesGrid.tsx (TẠO MỚI)
import { Card, CardContent } from "@/shared/components/ui/card";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { cn } from "@/shared/lib/utils";
import { Link } from "react-router-dom";

// Dữ liệu giả (Lấy 4 mục)
const featuredCategories = [
  {
    title: "Card Visit",
    imageSrc:
      "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    link: "/shop?category=business-card",
  },
  {
    title: "Bao bì & Hộp",
    imageSrc:
      "https://images.unsplash.com/photo-1578604432133-66c3cf14a8b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    link: "/shop?category=packaging",
  },
  {
    title: "Áo thun",
    imageSrc:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    link: "/shop?category=t-shirt",
  },
  {
    title: "Standee & Banner",
    imageSrc:
      "https://images.unsplash.com/photo-1507925921958-b72a27b11ad3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    link: "/shop?category=banner",
  },
];

/**
 * Component: Hiển thị danh mục nổi bật (ảnh)
 * Dữ liệu sẽ được lấy từ API
 */
export const FeaturedCategoriesGrid = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {featuredCategories.map((category) => (
        <Link to={category.link} key={category.title}>
          <Card
            className={cn(
              "overflow-hidden rounded-lg cursor-pointer group border-2",
              "border-gray-200 bg-white hover:border-blue-500"
            )}
          >
            {/* Ảnh */}
            <div className="aspect-square relative overflow-hidden">
              <ImageWithFallback
                src={category.imageSrc}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            {/* Text */}
            <div className="p-2 bg-white text-center h-12 flex items-center justify-center">
              <h4
                className={cn(
                  "text-xs font-semibold text-gray-800 transition-colors",
                  "group-hover:text-blue-600"
                )}
              >
                {category.title}
              </h4>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};
