// src/features/chat/components/ChatPrinterCarousel.tsx

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { MapPin, Star, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface Printer {
  _id: string;
  businessName: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  coverImage?: string;
  address?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  specialties?: string[];
  priceTier?: string;
  productionSpeed?: string;
  rating?: number;
  totalReviews?: number;
  isVerified?: boolean;
}

const ChatPrinterCard = ({ printer }: { printer: Printer }) => {
  const logoUrl = printer.logoUrl || "/placeholder-printer.jpg";
  const addressText = printer.address
    ? `${printer.address.district || ""}, ${printer.address.city || ""}`.replace(/^,\s*|,\s*$/g, "")
    : "";

  return (
    <Card className="overflow-hidden shadow-md border">
      <div className="aspect-video bg-gray-100 relative">
        {printer.coverImage ? (
          <ImageWithFallback
            src={printer.coverImage}
            alt={printer.businessName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
            {printer.logoUrl ? (
              <ImageWithFallback
                src={printer.logoUrl}
                alt={printer.businessName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-3xl font-bold">
                {printer.businessName[0]?.toUpperCase()}
              </span>
            )}
          </div>
        )}
        {printer.isVerified && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Đã xác thực
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <div className="flex items-start gap-2 mb-2">
          {printer.logoUrl && (
            <ImageWithFallback
              src={printer.logoUrl}
              alt={printer.businessName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{printer.businessName}</h3>
            {printer.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-gray-600">
                  {printer.rating.toFixed(1)}
                  {printer.totalReviews ? ` (${printer.totalReviews})` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {addressText && (
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{addressText}</span>
          </p>
        )}

        {printer.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{printer.description}</p>
        )}

        {printer.specialties && printer.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {printer.specialties.slice(0, 2).map((specialty, idx) => (
              <span
                key={idx}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
              >
                {specialty}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {printer.contactPhone && (
              <a
                href={`tel:${printer.contactPhone}`}
                className="text-blue-600 hover:text-blue-700"
                title={printer.contactPhone}
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {printer.contactEmail && (
              <a
                href={`mailto:${printer.contactEmail}`}
                className="text-blue-600 hover:text-blue-700"
                title={printer.contactEmail}
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
          </div>
          <Link to={`/printers/${printer._id}`}>
            <Button size="sm" variant="outline">
              Xem
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

interface ChatPrinterCarouselProps {
  printers: Printer[];
}

export const ChatPrinterCarousel = ({ printers }: ChatPrinterCarouselProps) => {
  if (!printers || printers.length === 0) {
    return null;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full max-w-xs md:max-w-md"
    >
      <CarouselContent className="-ml-3">
        {printers.map((printer) => (
          <CarouselItem key={printer._id} className="pl-3 basis-4/5">
            <ChatPrinterCard printer={printer} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {printers.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 -translate-y-1/2" />
        </>
      )}
    </Carousel>
  );
};

