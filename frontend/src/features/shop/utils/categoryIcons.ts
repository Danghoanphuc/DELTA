// src/features/shop/utils/categoryIcons.ts
import {
  CreditCard,
  Shirt,
  Package,
  Megaphone,
  Palette,
  LucideIcon,
} from "lucide-react";

export const categoryIcons: { [key: string]: LucideIcon } = {
  "business-card": CreditCard,
  "t-shirt": Shirt,
  packaging: Package,
  banner: Megaphone,
  default: Palette,
};
