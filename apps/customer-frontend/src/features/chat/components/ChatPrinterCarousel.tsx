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
import { MapPin, Star, Phone, Mail, CheckCircle2 } from "lucide-react";
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
  const addressText = printer.address
    ? `${printer.address.district || ""}, ${
        printer.address.city || ""
      }`.replace(/^,\s*|,\s*$/g, "")
    : "";

  return (
    <Card className="group overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Cover Image Area */}
      <div className="aspect-[2/1] bg-stone-100 relative overflow-hidden">
        {printer.coverImage ? (
          <ImageWithFallback
            src={printer.coverImage}
            alt={printer.businessName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-200">
            <span className="font-serif text-4xl text-stone-400 font-bold opacity-30">
              {printer.businessName[0]}
            </span>
          </div>
        )}

        {/* Verified Badge: Primary Color */}
        {printer.isVerified && (
          <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm uppercase tracking-wider">
            <CheckCircle2 size={10} /> Verified
          </div>
        )}

        {/* Logo Overlay */}
        <div className="absolute -bottom-5 left-3">
          <div className="w-10 h-10 rounded-sm border-2 border-white bg-white shadow-sm overflow-hidden">
            <ImageWithFallback
              src={printer.logoUrl || "/placeholder.jpg"}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      <CardContent className="pt-7 px-3 pb-3">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-serif font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {printer.businessName}
          </h3>
          {printer.rating && (
            <div className="flex items-center gap-1 bg-stone-50 px-1.5 py-0.5 rounded-sm border border-stone-100">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-mono font-bold text-stone-700">
                {printer.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {addressText && (
          <p className="text-[11px] text-stone-500 mb-3 flex items-center gap-1 font-sans">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{addressText}</span>
          </p>
        )}

        {/* Specialties Tags */}
        <div className="flex flex-wrap gap-1 mb-3 h-[22px] overflow-hidden">
          {printer.specialties?.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-sm border border-stone-200 uppercase tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 border-dashed">
          <Link to={`/printers/${printer._id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full h-8 text-xs bg-black text-white hover:bg-primary shadow-none rounded-sm transition-colors uppercase tracking-wider font-bold"
            >
              Ghé thăm
            </Button>
          </Link>
          {printer.contactPhone && (
            <a
              href={`tel:${printer.contactPhone}`}
              className="w-8 h-8 flex items-center justify-center border border-stone-200 rounded-sm hover:border-primary hover:text-primary transition-colors"
            >
              <Phone size={14} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ChatPrinterCarousel = ({ printers }: { printers: Printer[] }) => {
  if (!printers?.length) return null;

  return (
    <Carousel
      opts={{ align: "start", loop: false }}
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
          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 border-stone-200 bg-white/90 backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 border-stone-200 bg-white/90 backdrop-blur hover:bg-primary hover:border-primary hover:text-white transition-all" />
        </>
      )}
    </Carousel>
  );
};
