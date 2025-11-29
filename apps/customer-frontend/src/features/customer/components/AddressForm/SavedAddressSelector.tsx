// src/features/customer/components/AddressForm/SavedAddressSelector.tsx
import { useState } from "react";
import { MapPin, ChevronDown, Star, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { useSavedAddresses } from "../../hooks/useSavedAddresses";
import { AddressFormModal } from "../settings/AddressFormModal";
import type { SavedAddress } from "@/types/address";

interface SavedAddressSelectorProps {
  onSelectAddress: (address: SavedAddress) => void;
  currentAddress?: {
    street?: string;
    city?: string;
  };
}

export const SavedAddressSelector = ({
  onSelectAddress,
  currentAddress,
}: SavedAddressSelectorProps) => {
  const { addresses, defaultAddress, isLoading, deleteAddress, setAsDefault } =
    useSavedAddresses();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(
    null
  );

  // Tìm địa chỉ đang được chọn (match với form hiện tại)
  const selectedAddress = addresses.find(
    (addr) =>
      addr.street === currentAddress?.street &&
      addr.city === currentAddress?.city
  );

  const handleSelectAddress = (address: SavedAddress) => {
    onSelectAddress(address);
    setIsModalOpen(false);
  };

  const handleEdit = (address: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddress(address);
    setIsAddModalOpen(true);
  };

  const handleDelete = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc muốn xóa địa chỉ này?")) {
      await deleteAddress(addressId);
    }
  };

  const handleSetDefault = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await setAsDefault(addressId);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingAddress(null);
  };

  return (
    <>
      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "w-full p-4 rounded-xl border-2 transition-all text-left",
          "hover:border-blue-400 hover:shadow-md",
          selectedAddress
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 bg-white"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              selectedAddress
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-400"
            )}
          >
            <MapPin className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            {selectedAddress ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">
                    {selectedAddress.recipientName}
                  </p>
                  {selectedAddress.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {selectedAddress.phone}
                </p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {selectedAddress.street}, {selectedAddress.ward},{" "}
                  {selectedAddress.district}, {selectedAddress.city}
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-gray-900 mb-1">
                  Chọn địa chỉ đã lưu
                </p>
                <p className="text-sm text-gray-500">
                  {addresses.length > 0
                    ? `Bạn có ${addresses.length} địa chỉ đã lưu`
                    : "Chưa có địa chỉ nào được lưu"}
                </p>
              </>
            )}
          </div>

          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 mt-2" />
        </div>
      </button>

      {/* Modal Quản Lý Địa Chỉ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Sổ địa chỉ của bạn</span>
              <Button
                onClick={handleAddNew}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm mới
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-4">
                  Chưa có địa chỉ nào được lưu
                </p>
                <Button onClick={handleAddNew} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm địa chỉ đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddress?._id === address._id;

                  return (
                    <Card
                      key={address._id}
                      className={cn(
                        "p-4 cursor-pointer transition-all hover:shadow-md relative",
                        isSelected
                          ? "border-blue-500 border-2 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      )}
                      onClick={() => handleSelectAddress(address)}
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
                        <div className="text-sm text-gray-600">
                          {address.phone}
                        </div>
                        <div className="text-sm text-gray-700">
                          {address.street}, {address.ward}, {address.district},{" "}
                          {address.city}
                        </div>
                      </div>

                      <div
                        className="flex gap-2 mt-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!address.isDefault && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleSetDefault(address._id, e)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Đặt mặc định
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleEdit(address, e)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => handleDelete(address._id, e)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {isSelected && (
                        <div className="absolute top-4 left-4">
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Thêm/Sửa Địa Chỉ */}
      <AddressFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        address={editingAddress}
      />
    </>
  );
};
