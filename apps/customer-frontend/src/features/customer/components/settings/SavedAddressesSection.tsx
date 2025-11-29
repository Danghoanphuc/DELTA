// src/features/customer/components/settings/SavedAddressesSection.tsx
import { useState } from "react";
import { Plus, MapPin, Trash2, Edit, Star } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { useSavedAddresses } from "../../hooks/useSavedAddresses";
import { AddressFormModal } from "./AddressFormModal";
import type { SavedAddress } from "@/types/address";

export const SavedAddressesSection = () => {
  const { addresses, isLoading, deleteAddress, setAsDefault } =
    useSavedAddresses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );

  const handleEdit = (address: SavedAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = async (addressId: string) => {
    if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      await deleteAddress(addressId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Địa chỉ đã lưu</h3>
        </div>
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Địa chỉ đã lưu</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm địa chỉ mới
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">Chưa có địa chỉ nào được lưu</p>
          <Button onClick={handleAddNew} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Thêm địa chỉ đầu tiên
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card
              key={address._id}
              className={`p-4 relative ${
                address.isDefault ? "border-blue-500 border-2" : ""
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Mặc định
                  </span>
                </div>
              )}

              <div className="space-y-2 pr-20">
                <div className="font-semibold text-gray-900">
                  {address.recipientName}
                </div>
                <div className="text-sm text-gray-600">{address.phone}</div>
                <div className="text-sm text-gray-700">
                  {address.street}, {address.ward}, {address.district},{" "}
                  {address.city}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAsDefault(address._id)}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Đặt mặc định
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(address._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        address={editingAddress}
      />
    </div>
  );
};
