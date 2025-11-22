// apps/customer-frontend/src/features/customer/components/AddressForm.tsx
import { useFormContext } from 'react-hook-form';
import { useState, useEffect } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  VIETNAM_LOCATIONS,
  getDistrictsByCity,
  getWardsByDistrict,
  detectLocationFromCoords,
  type District,
  type Ward,
} from '@/data/location-mock';

export const AddressForm = () => {
  const form = useFormContext();

  // State cho cascading selects
  const [selectedCityCode, setSelectedCityCode] = useState<string>('');
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('');
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  const [availableWards, setAvailableWards] = useState<Ward[]>([]);

  // State cho Geolocation
  const [isDetecting, setIsDetecting] = useState(false);

  // Watch city và district để update cascading
  const watchedCity = form.watch('shippingAddress.city');
  const watchedDistrict = form.watch('shippingAddress.district');

  // ============================================
  // GEOLOCATION HANDLER
  // ============================================
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị');
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Gọi hàm detect location (mock)
          const detected = await detectLocationFromCoords(latitude, longitude);

          // Auto-fill form
          form.setValue('shippingAddress.city', detected.city);
          form.setValue('shippingAddress.district', detected.district);
          form.setValue('shippingAddress.ward', detected.ward);

          // Update state để trigger cascading
          setSelectedCityCode(detected.cityCode);
          setSelectedDistrictCode(detected.districtCode);

          // Update available options
          const districts = getDistrictsByCity(detected.cityCode);
          const wards = getWardsByDistrict(detected.cityCode, detected.districtCode);
          setAvailableDistricts(districts);
          setAvailableWards(wards);

          toast.success('Đã xác định vị trí của bạn!', {
            description: `${detected.district}, ${detected.city}`,
          });

          // Auto-focus vào trường "Địa chỉ cụ thể"
          setTimeout(() => {
            const streetInput = document.querySelector(
              'input[name="shippingAddress.street"]'
            ) as HTMLInputElement;
            streetInput?.focus();
          }, 300);
        } catch (error) {
          toast.error('Không thể xác định địa chỉ từ tọa độ');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Bạn đã từ chối quyền truy cập vị trí', {
            description: 'Vui lòng bật quyền định vị trong cài đặt trình duyệt',
          });
        } else {
          toast.error('Không thể lấy vị trí của bạn');
        }
      }
    );
  };

  // ============================================
  // CASCADING LOGIC
  // ============================================

  // Khi chọn City -> Load Districts
  useEffect(() => {
    if (watchedCity) {
      const city = VIETNAM_LOCATIONS.find((c) => c.name === watchedCity);
      if (city) {
        setSelectedCityCode(city.code);
        setAvailableDistricts(city.districts);
        // Reset district và ward
        form.setValue('shippingAddress.district', '');
        form.setValue('shippingAddress.ward', '');
        setAvailableWards([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCity]);

  // Khi chọn District -> Load Wards
  useEffect(() => {
    if (watchedDistrict && selectedCityCode) {
      const district = availableDistricts.find((d) => d.name === watchedDistrict);
      if (district) {
        setSelectedDistrictCode(district.code);
        const wards = getWardsByDistrict(selectedCityCode, district.code);
        setAvailableWards(wards);
        // Reset ward
        form.setValue('shippingAddress.ward', '');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedDistrict, selectedCityCode, availableDistricts]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Địa chỉ giao hàng</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLocateMe}
              disabled={isDetecting}
              className="gap-2"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang định vị...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  📍 Định vị hiện tại
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Họ và tên */}
          <FormField
            control={form.control}
            name="shippingAddress.fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Số điện thoại */}
          <FormField
            control={form.control}
            name="shippingAddress.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0912345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tỉnh/Thành phố */}
          <FormField
            control={form.control}
            name="shippingAddress.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VIETNAM_LOCATIONS.map((city) => (
                      <SelectItem key={city.code} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quận/Huyện */}
          <FormField
            control={form.control}
            name="shippingAddress.district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quận/Huyện</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedCityCode || availableDistricts.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Quận/Huyện" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDistricts.map((district) => (
                      <SelectItem key={district.code} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phường/Xã */}
          <FormField
            control={form.control}
            name="shippingAddress.ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phường/Xã</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedDistrictCode || availableWards.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Phường/Xã" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableWards.map((ward) => (
                      <SelectItem key={ward.code} value={ward.name}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Địa chỉ cụ thể (Số nhà, tên đường) */}
          <FormField
            control={form.control}
            name="shippingAddress.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ cụ thể (Số nhà, tên đường)</FormLabel>
                <FormControl>
                  <Input placeholder="123 Đường Nguyễn Huệ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Country (Hidden, default to Việt Nam) */}
          <input
            type="hidden"
            {...form.register('shippingAddress.country')}
            value="Việt Nam"
          />
        </CardContent>
      </Card>
    </div>
  );
};
