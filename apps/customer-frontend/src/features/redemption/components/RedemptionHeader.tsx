// src/features/redemption/components/RedemptionHeader.tsx
// ✅ SOLID: Single Responsibility - Header display only

import { Gift } from "lucide-react";
import { RedemptionLink } from "../hooks/useRedemption";

interface RedemptionHeaderProps {
  link: RedemptionLink;
}

export function RedemptionHeader({ link }: RedemptionHeaderProps) {
  return (
    <div
      className="py-8 px-4"
      style={{ backgroundColor: link.branding.primaryColor }}
    >
      <div className="max-w-2xl mx-auto text-center text-white">
        {link.branding.logoUrl || link.organization.logo ? (
          <img
            src={link.branding.logoUrl || link.organization.logo}
            alt={link.organization.name}
            className="h-12 mx-auto mb-4 object-contain"
          />
        ) : (
          <Gift className="w-12 h-12 mx-auto mb-4" />
        )}
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {link.branding.welcomeTitle}
        </h1>
        {link.branding.welcomeMessage && (
          <p className="opacity-90">{link.branding.welcomeMessage}</p>
        )}
        {link.branding.senderName && (
          <p className="mt-2 text-sm opacity-75">
            Từ {link.branding.senderName}
          </p>
        )}
      </div>
    </div>
  );
}
