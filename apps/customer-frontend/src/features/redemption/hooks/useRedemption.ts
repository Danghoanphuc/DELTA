// src/features/redemption/hooks/useRedemption.ts
// ✅ SOLID: Single Responsibility - Redemption state management

import { useState, useEffect, useCallback } from "react";
import { redemptionService } from "../services/redemption.service";

export interface RedemptionItem {
  name: string;
  description?: string;
  imageUrl?: string;
  allowSizeSelection: boolean;
  availableSizes: string[];
  allowColorSelection: boolean;
  availableColors: { name: string; hex: string; imageUrl?: string }[];
  quantity: number;
  isRequired: boolean;
}

export interface RedemptionLink {
  id: string;
  name: string;
  description?: string;
  items: RedemptionItem[];
  branding: {
    logoUrl?: string;
    primaryColor: string;
    headerImageUrl?: string;
    welcomeTitle: string;
    welcomeMessage?: string;
    thankYouTitle: string;
    thankYouMessage?: string;
    senderName?: string;
  };
  settings: {
    requirePhone: boolean;
    requireAddress: boolean;
    customFields?: {
      name: string;
      label: string;
      type: string;
      required: boolean;
    }[];
  };
  organization: { name: string; logo?: string };
  expiresAt?: string;
  remainingRedemptions: number;
}

export interface Selection {
  itemIndex: number;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

const INITIAL_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  city: "",
};

export type RedemptionStep = "items" | "info" | "success";

export function useRedemption(token: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<RedemptionLink | null>(null);
  const [step, setStep] = useState<RedemptionStep>("items");
  const [selections, setSelections] = useState<Selection[]>([]);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  const loadLink = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await redemptionService.getPublicLink(token);
      setLink(data);

      // Initialize selections
      const initialSelections = data.items.map(
        (item: RedemptionItem, idx: number) => ({
          itemIndex: idx,
          selectedSize: item.availableSizes?.[0] || undefined,
          selectedColor: item.availableColors?.[0]?.name || undefined,
          quantity: item.quantity,
        })
      );
      setSelections(initialSelections);
    } catch (err: any) {
      setError(err.message || "Link không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLink();
  }, [loadLink]);

  const updateSelection = (
    itemIndex: number,
    field: "selectedSize" | "selectedColor",
    value: string
  ) => {
    setSelections((prev) =>
      prev.map((sel) =>
        sel.itemIndex === itemIndex ? { ...sel, [field]: value } : sel
      )
    );
  };

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const validateForm = (): string | null => {
    if (!link) return "Link không hợp lệ";
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return "Vui lòng điền đầy đủ thông tin";
    }
    if (link.settings.requirePhone && !formData.phone) {
      return "Vui lòng nhập số điện thoại";
    }
    if (link.settings.requireAddress && !formData.city) {
      return "Vui lòng nhập địa chỉ giao hàng";
    }
    return null;
  };

  const submit = async (): Promise<boolean> => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      setSubmitting(true);
      setError(null);

      await redemptionService.redeemLink(token!, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        shippingAddress: {
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          city: formData.city,
          country: "Vietnam",
        },
        selections,
      });

      setStep("success");
      return true;
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const goToStep = (newStep: RedemptionStep) => {
    setError(null);
    setStep(newStep);
  };

  return {
    loading,
    submitting,
    error,
    link,
    step,
    selections,
    formData,
    updateSelection,
    updateFormData,
    submit,
    goToStep,
    setError,
  };
}
