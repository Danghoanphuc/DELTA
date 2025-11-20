// apps/customer-frontend/src/features/printer/utils/categoryMapping.ts
// Helper utilities to map between legacy backend category enums
// and the richer PrintZ category taxonomy used in the new UI.

const legacyToPrintzMap: Record<string, string> = {
  "business-card": "business-cards",
  flyer: "postcards-marketing",
  banner: "signage-banners",
  brochure: "postcards-marketing",
  "t-shirt": "tshirts",
  mug: "promotional-products",
  sticker: "labels-stickers",
  packaging: "packaging",
  other: "promotional-products",
};

const printzToLegacyMap: Record<string, string> = {
  "business-cards": "business-card",
  "postcards-marketing": "flyer",
  "signage-banners": "banner",
  tshirts: "t-shirt",
  "promotional-products": "other",
  packaging: "packaging",
  "labels-stickers": "sticker",
  "tet-holiday-cards": "flyer",
  "calendar-gifts": "other",
};

export const toPrintzCategory = (legacyValue?: string | null) => {
  if (!legacyValue) return "";
  return legacyToPrintzMap[legacyValue] ?? legacyValue;
};

export const toLegacyCategory = (printzValue?: string | null) => {
  if (!printzValue) return "";
  return printzToLegacyMap[printzValue] ?? "other";
};

