// apps/customer-frontend/src/features/customer/components/AddressForm/LocationSelects.tsx
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormControl } from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, Sparkles, Info } from "lucide-react";
import type {
  GHNProvince,
  GHNDistrict,
  GHNWard,
} from "@/services/ghnLocationService";

interface LocationSelectsProps {
  provinces: GHNProvince[];
  districts: GHNDistrict[];
  wards: GHNWard[];
  isLoadingProvinces: boolean;
  isLoadingDistricts: boolean;
  isLoadingWards: boolean;
  onProvinceChange: (provinceId: number, provinceName: string) => void;
  onDistrictChange: (districtId: number, districtName: string) => void;
  onWardChange: (wardCode: string, wardName: string) => void;
}

export const LocationSelects = ({
  provinces,
  districts,
  wards,
  isLoadingProvinces,
  isLoadingDistricts,
  isLoadingWards,
  onProvinceChange,
  onDistrictChange,
  onWardChange,
}: LocationSelectsProps) => {
  const form = useFormContext();
  const watchedProvinceID = form.watch("shippingAddress.provinceId");
  const watchedDistrictID = form.watch("shippingAddress.districtId");

  // Find selected district for smart notification
  const selectedDistrict = districts.find(
    (d) => d.DistrictID === Number(watchedDistrictID)
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Province Select */}
        <FormField
          control={form.control}
          name="shippingAddress.provinceId"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  const province = provinces.find(
                    (p) => p.ProvinceID === Number(val)
                  );
                  if (province) {
                    onProvinceChange(
                      province.ProvinceID,
                      province.ProvinceName
                    );
                  }
                }}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="h-[56px] rounded-xl border border-gray-200 bg-white relative px-4 pt-4 pb-2 text-left focus:ring-2 focus:ring-blue-600 focus:border-blue-600 shadow-sm">
                    <div className="absolute top-2 left-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider pointer-events-none">
                      Tỉnh / Thành phố
                    </div>
                    <div className="pt-2 w-full truncate flex items-center text-sm font-medium">
                      {isLoadingProvinces && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                      )}
                      <SelectValue placeholder="Chọn Tỉnh/Thành" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {provinces.map((p) => (
                    <SelectItem
                      key={p.ProvinceID}
                      value={p.ProvinceID.toString()}
                    >
                      {p.ProvinceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* District Select */}
        <FormField
          control={form.control}
          name="shippingAddress.districtId"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(val) => {
                  field.onChange(Number(val));
                  const district = districts.find(
                    (d) => d.DistrictID === Number(val)
                  );
                  if (district) {
                    onDistrictChange(
                      district.DistrictID,
                      district.DistrictName
                    );
                  }
                }}
                value={field.value?.toString()}
                disabled={!watchedProvinceID || isLoadingDistricts}
              >
                <FormControl>
                  <SelectTrigger className="h-[56px] rounded-xl border border-gray-200 bg-white relative px-4 pt-4 pb-2 text-left focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-gray-50 disabled:opacity-70 shadow-sm">
                    <div className="absolute top-2 left-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider pointer-events-none">
                      Quận / Huyện
                    </div>
                    <div className="pt-2 w-full truncate flex items-center text-sm font-medium">
                      {isLoadingDistricts && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                      )}
                      <SelectValue placeholder="Chọn Quận/Huyện" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {districts.map((d) => (
                    <SelectItem
                      key={d.DistrictID}
                      value={d.DistrictID.toString()}
                      className="py-2.5"
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-medium text-gray-900">
                          {d.DistrictName}
                        </span>
                        {d.isNew && d.oldName && (
                          <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-blue-100">
                            <Sparkles size={10} /> {d.oldName}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Ward Select */}
        <FormField
          control={form.control}
          name="shippingAddress.wardCode"
          render={({ field }) => (
            <FormItem>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  const ward = wards.find((w) => w.WardCode === val);
                  if (ward) {
                    onWardChange(ward.WardCode, ward.WardName);
                  }
                }}
                value={field.value}
                disabled={!watchedDistrictID || isLoadingWards}
              >
                <FormControl>
                  <SelectTrigger className="h-[56px] rounded-xl border border-gray-200 bg-white relative px-4 pt-4 pb-2 text-left focus:ring-2 focus:ring-blue-600 focus:border-blue-600 disabled:bg-gray-50 disabled:opacity-70 shadow-sm">
                    <div className="absolute top-2 left-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider pointer-events-none">
                      Phường / Xã
                    </div>
                    <div className="pt-2 w-full truncate flex items-center text-sm font-medium">
                      {isLoadingWards && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-600" />
                      )}
                      <SelectValue placeholder="Chọn Phường/Xã" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {wards.map((w) => (
                    <SelectItem key={w.WardCode} value={w.WardCode}>
                      {w.WardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </div>

      {/* Smart Notification for new districts */}
      {selectedDistrict?.isNew && selectedDistrict.oldName && (
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl animate-in zoom-in-95 duration-300">
          <div className="bg-white p-2 rounded-full shadow-sm text-blue-600 mt-0.5 border border-blue-50">
            <Info size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900 flex items-center gap-2">
              Khu vực: {selectedDistrict.DistrictName}
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Mới cập nhật
              </span>
            </p>
            <p className="text-xs text-blue-700 mt-1 leading-relaxed opacity-90">
              Địa chỉ này đã bao gồm <strong>{selectedDistrict.oldName}</strong>
              . Hệ thống đã tự động chuẩn hóa dữ liệu để shipper giao hàng chính
              xác nhất.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
