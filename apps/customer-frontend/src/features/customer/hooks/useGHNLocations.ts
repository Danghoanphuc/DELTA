// apps/customer-frontend/src/features/customer/hooks/useGHNLocations.ts
/**
 * Custom hook for GHN location data management
 * Handles cascading selects logic
 */

import { useState, useEffect } from "react";
import {
  ghnLocationService,
  type GHNProvince,
  type GHNDistrict,
  type GHNWard,
} from "@/services/ghnLocationService";

export const useGHNLocations = () => {
  const [provinces, setProvinces] = useState<GHNProvince[]>([]);
  const [districts, setDistricts] = useState<GHNDistrict[]>([]);
  const [wards, setWards] = useState<GHNWard[]>([]);

  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await ghnLocationService.getProvinces();
        setProvinces(
          data.sort((a, b) => a.ProvinceName.localeCompare(b.ProvinceName))
        );
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  // Load districts when province changes
  const loadDistricts = async (provinceId: number) => {
    setIsLoadingDistricts(true);
    setDistricts([]);
    setWards([]);

    try {
      const data = await ghnLocationService.getDistricts(provinceId);
      setDistricts(data);
    } catch (error) {
      console.error("Failed to load districts:", error);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  // Load wards when district changes
  const loadWards = async (districtId: number) => {
    setIsLoadingWards(true);
    setWards([]);

    try {
      const data = await ghnLocationService.getWards(districtId);
      setWards(data);
    } catch (error) {
      console.error("Failed to load wards:", error);
    } finally {
      setIsLoadingWards(false);
    }
  };

  return {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
    loadDistricts,
    loadWards,
  };
};
