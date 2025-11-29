// src/features/customer/hooks/useSavedAddresses.ts
import { useState, useEffect } from "react";
import { customerProfileService } from "@/services/customerProfileService";
import { toast } from "@/shared/utils/toast";
import type { SavedAddress, AddressFormData } from "@/types/address";

export const useSavedAddresses = () => {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<SavedAddress | null>(
    null
  );

  // Load địa chỉ
  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await customerProfileService.getSavedAddresses();
      setAddresses(data);

      // Tìm địa chỉ mặc định
      const defaultAddr = data.find((addr) => addr.isDefault) || null;
      setDefaultAddress(defaultAddr);
    } catch (error: any) {
      console.error("Failed to load addresses:", error);
      toast.error("Không thể tải danh sách địa chỉ");
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm địa chỉ mới
  const addAddress = async (addressData: AddressFormData) => {
    try {
      const newAddress = await customerProfileService.addAddress(addressData);
      setAddresses((prev) => [...prev, newAddress]);

      if (newAddress.isDefault) {
        setDefaultAddress(newAddress);
      }

      toast.success("Đã lưu địa chỉ thành công");
      return newAddress;
    } catch (error: any) {
      console.error("Failed to add address:", error);
      toast.error("Không thể lưu địa chỉ");
      throw error;
    }
  };

  // Cập nhật địa chỉ
  const updateAddress = async (
    addressId: string,
    addressData: Partial<AddressFormData>
  ) => {
    try {
      const updatedAddress = await customerProfileService.updateAddress(
        addressId,
        addressData
      );

      setAddresses((prev) =>
        prev.map((addr) => (addr._id === addressId ? updatedAddress : addr))
      );

      if (updatedAddress.isDefault) {
        setDefaultAddress(updatedAddress);
      }

      toast.success("Đã cập nhật địa chỉ");
      return updatedAddress;
    } catch (error: any) {
      console.error("Failed to update address:", error);
      toast.error("Không thể cập nhật địa chỉ");
      throw error;
    }
  };

  // Xóa địa chỉ
  const deleteAddress = async (addressId: string) => {
    try {
      await customerProfileService.deleteAddress(addressId);

      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));

      if (defaultAddress?._id === addressId) {
        const newDefault = addresses.find(
          (addr) => addr._id !== addressId && addr.isDefault
        );
        setDefaultAddress(newDefault || null);
      }

      toast.success("Đã xóa địa chỉ");
    } catch (error: any) {
      console.error("Failed to delete address:", error);
      toast.error("Không thể xóa địa chỉ");
      throw error;
    }
  };

  // Đặt địa chỉ mặc định
  const setAsDefault = async (addressId: string) => {
    try {
      const updatedAddress = await customerProfileService.setDefaultAddress(
        addressId
      );

      // Cập nhật tất cả địa chỉ
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr._id === addressId,
        }))
      );

      setDefaultAddress(updatedAddress);
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch (error: any) {
      console.error("Failed to set default address:", error);
      toast.error("Không thể đặt địa chỉ mặc định");
      throw error;
    }
  };

  // Load khi mount
  useEffect(() => {
    loadAddresses();
  }, []);

  return {
    addresses,
    defaultAddress,
    isLoading,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
  };
};
