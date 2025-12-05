// src/features/organization/hooks/useSendSwag.ts
// ✅ SOLID: Single Responsibility - Send swag wizard state

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import {
  swagOrderService,
  SwagPack,
  Recipient,
} from "../services/swag-order.service";

export interface SendSwagState {
  selectedPack: SwagPack | null;
  selectedRecipientIds: string[];
  orderName: string;
  shippingMethod: string;
  sendImmediately: boolean;
  scheduledDate: string;
  notifyRecipients: boolean;
  customMessage: string;
}

const INITIAL_STATE: SendSwagState = {
  selectedPack: null,
  selectedRecipientIds: [],
  orderName: "",
  shippingMethod: "standard",
  sendImmediately: true,
  scheduledDate: "",
  notifyRecipients: true,
  customMessage: "",
};

export function useSendSwag() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packs, setPacks] = useState<SwagPack[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [state, setState] = useState<SendSwagState>(INITIAL_STATE);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [packsData, recipientsData] = await Promise.all([
        swagOrderService.getPacks(),
        swagOrderService.getRecipients(),
      ]);
      setPacks(packsData);
      setRecipients(recipientsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // State updaters
  const selectPack = (pack: SwagPack) => {
    setState((prev) => ({ ...prev, selectedPack: pack }));
  };

  const toggleRecipient = (id: string) => {
    setState((prev) => ({
      ...prev,
      selectedRecipientIds: prev.selectedRecipientIds.includes(id)
        ? prev.selectedRecipientIds.filter((i) => i !== id)
        : [...prev.selectedRecipientIds, id],
    }));
  };

  const toggleAllRecipients = (filteredIds: string[]) => {
    setState((prev) => ({
      ...prev,
      selectedRecipientIds:
        prev.selectedRecipientIds.length === filteredIds.length
          ? []
          : filteredIds,
    }));
  };

  const updateSettings = (updates: Partial<SendSwagState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Pricing calculation
  const calculatePricing = () => {
    if (!state.selectedPack)
      return { packPrice: 0, total: 0, shipping: 0, kitting: 0, totalPacks: 0 };

    const packPrice = state.selectedPack.pricing?.unitPrice || 0;
    const count = state.selectedRecipientIds.length;
    const totalPacks = packPrice * count;
    const shipping =
      state.shippingMethod === "express"
        ? 50000 * count
        : state.shippingMethod === "overnight"
        ? 100000 * count
        : 30000 * count;
    const kitting = 5000 * count;

    return {
      packPrice,
      totalPacks,
      shipping,
      kitting,
      total: totalPacks + shipping + kitting,
    };
  };

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return !!state.selectedPack;
      case 2:
        return state.selectedRecipientIds.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (canGoNext() && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit
  const submitOrder = async () => {
    if (!state.selectedPack || state.selectedRecipientIds.length === 0) {
      toast.error("Vui lòng chọn bộ quà và người nhận");
      return false;
    }

    setIsSubmitting(true);
    try {
      await swagOrderService.createOrder({
        name: state.orderName || `Gửi quà - ${state.selectedPack.name}`,
        swagPackId: state.selectedPack._id,
        recipientIds: state.selectedRecipientIds,
        shippingMethod: state.shippingMethod,
        scheduledSendDate: state.sendImmediately ? null : state.scheduledDate,
        notifyRecipients: state.notifyRecipients,
        customMessage: state.customMessage,
      });
      toast.success("Đã tạo đơn gửi quà!");
      reset();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setCurrentStep(1);
    setState(INITIAL_STATE);
  };

  return {
    currentStep,
    isLoading,
    isSubmitting,
    packs,
    recipients,
    state,
    selectPack,
    toggleRecipient,
    toggleAllRecipients,
    updateSettings,
    calculatePricing,
    canGoNext,
    goNext,
    goBack,
    submitOrder,
    reset,
  };
}
