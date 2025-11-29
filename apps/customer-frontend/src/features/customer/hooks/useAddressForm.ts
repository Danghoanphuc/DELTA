// apps/customer-frontend/src/features/customer/hooks/useAddressForm.ts
/**
 * Main orchestrator hook for AddressForm
 * Combines GPS, GHN, and form logic
 */

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useGPSLocation } from "./useGPSLocation";
import { useGHNLocations } from "./useGHNLocations";
import { findMatchingProvince } from "../utils/addressMatchers";
import { toast } from "@/shared/utils/toast";

export const useAddressForm = () => {
  const form = useFormContext();
  const [isGPSFilled, setIsGPSFilled] = useState(false);

  // Use custom hooks
  const gps = useGPSLocation();
  const ghn = useGHNLocations();

  // Watch for province/district changes to trigger cascading
  const watchedProvinceID = form.watch("shippingAddress.provinceId");
  const watchedDistrictID = form.watch("shippingAddress.districtId");

  // Load districts when province changes
  useEffect(() => {
    if (watchedProvinceID) {
      ghn.loadDistricts(watchedProvinceID);
      // Reset district and ward
      form.setValue("shippingAddress.districtId", undefined);
      form.setValue("shippingAddress.wardCode", "");
      form.setValue("shippingAddress.districtName", "");
      form.setValue("shippingAddress.wardName", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedProvinceID]);

  // Load wards when district changes
  useEffect(() => {
    if (watchedDistrictID) {
      ghn.loadWards(watchedDistrictID);
      // Reset ward
      form.setValue("shippingAddress.wardCode", "");
      form.setValue("shippingAddress.wardName", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDistrictID]);

  // Handle GPS detection
  const handleGPSDetect = async () => {
    const location = await gps.detectLocation();

    if (!location) return;

    // Save coordinates
    form.setValue("shippingAddress.coordinates", {
      lat: location.lat,
      lng: location.lng,
    });

    // Fill street address
    const streetAddr = location.street || location.fullAddress;
    form.setValue("shippingAddress.street", streetAddr);

    // Smart match province
    if (location.city) {
      const matchedProvince = findMatchingProvince(
        location.city,
        ghn.provinces
      );

      if (matchedProvince) {
        form.setValue("shippingAddress.provinceId", matchedProvince.ProvinceID);
        form.setValue("shippingAddress.cityName", matchedProvince.ProvinceName);
        toast.success("Đã chọn tỉnh/thành", {
          description: matchedProvince.ProvinceName,
        });
      }
    }

    setIsGPSFilled(true);
  };

  // Handle GPS clear
  const handleGPSClear = () => {
    gps.clearLocation();
    form.setValue("shippingAddress.coordinates", undefined);
    setIsGPSFilled(false);
  };

  // Handle province change
  const handleProvinceChange = (provinceId: number, provinceName: string) => {
    form.setValue("shippingAddress.cityName", provinceName);
  };

  // Handle district change
  const handleDistrictChange = (districtId: number, districtName: string) => {
    form.setValue("shippingAddress.districtName", districtName);
  };

  // Handle ward change
  const handleWardChange = (wardCode: string, wardName: string) => {
    form.setValue("shippingAddress.wardName", wardName);
  };

  // Helper to check if field is valid
  const isFieldValid = (fieldName: string) => {
    const fieldState = form.getFieldState(fieldName);
    return (
      fieldState.isDirty && !fieldState.invalid && !!form.getValues(fieldName)
    );
  };

  return {
    // GPS
    isDetecting: gps.isDetecting,
    detectedLocation: gps.detectedLocation,
    isGPSFilled,
    handleGPSDetect,
    handleGPSClear,

    // GHN
    provinces: ghn.provinces,
    districts: ghn.districts,
    wards: ghn.wards,
    isLoadingProvinces: ghn.isLoadingProvinces,
    isLoadingDistricts: ghn.isLoadingDistricts,
    isLoadingWards: ghn.isLoadingWards,

    // Handlers
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,

    // Utils
    isFieldValid,
  };
};
