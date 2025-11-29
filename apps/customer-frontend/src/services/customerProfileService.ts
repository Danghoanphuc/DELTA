// src/services/customerProfileService.ts
import axiosClient from "@/shared/lib/axios";
import type { SavedAddress, AddressFormData } from "@/types/address";

class CustomerProfileService {
  /**
   * Lấy tất cả địa chỉ đã lưu
   */
  async getSavedAddresses(): Promise<SavedAddress[]> {
    const response = await axiosClient.get("/customer-profile/addresses");
    return response.data.data;
  }

  /**
   * Lấy địa chỉ mặc định
   */
  async getDefaultAddress(): Promise<SavedAddress | null> {
    const response = await axiosClient.get(
      "/customer-profile/addresses/default"
    );
    return response.data.data;
  }

  /**
   * Thêm địa chỉ mới
   */
  async addAddress(addressData: AddressFormData): Promise<SavedAddress> {
    const response = await axiosClient.post(
      "/customer-profile/addresses",
      addressData
    );
    return response.data.data;
  }

  /**
   * Cập nhật địa chỉ
   */
  async updateAddress(
    addressId: string,
    addressData: Partial<AddressFormData>
  ): Promise<SavedAddress> {
    const response = await axiosClient.put(
      `/customer-profile/addresses/${addressId}`,
      addressData
    );
    return response.data.data;
  }

  /**
   * Xóa địa chỉ
   */
  async deleteAddress(addressId: string): Promise<void> {
    await axiosClient.delete(`/customer-profile/addresses/${addressId}`);
  }

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(addressId: string): Promise<SavedAddress> {
    const response = await axiosClient.post(
      `/customer-profile/addresses/${addressId}/set-default`
    );
    return response.data.data;
  }
}

export const customerProfileService = new CustomerProfileService();
