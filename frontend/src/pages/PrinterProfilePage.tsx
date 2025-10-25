// frontend/src/pages/PrinterProfilePage.tsx

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/lib/api"; // (Import "Trạm chỉ huy" API của bạn)
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

// 1. Định nghĩa Schema (Luật lệ của Form)
const profileSchema = z.object({
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),

  // Chúng ta "flatten" (làm phẳng) object address để form dễ xử lý
  addressStreet: z.string().optional(),
  addressWard: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  longitude: z.string().optional(), // Dùng string, sẽ convert sang number khi gửi
  latitude: z.string().optional(),

  // Dùng string, sẽ convert sang array khi gửi
  specialties: z.string().optional(),

  priceTier: z.enum(["cheap", "standard", "premium"]),
  productionSpeed: z.enum(["fast", "standard"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// --- COMPONENT CHÍNH ---
const PrinterProfilePage = () => {
  const { user, setUser, loading } = useAuthStore();
  const navigate = useNavigate();

  // Guard 1: Chờ AuthStore sẵn sàng (đang fetchMe)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải dữ liệu hồ sơ...
      </div>
    );
  }

  // Guard 2: Kiểm tra User (Sau khi đã hết loading)
  // Nếu hết loading mà VẪN không có user, đá về /signin
  if (!user) {
    toast.error("Không tìm thấy người dùng. Vui lòng đăng nhập.");
    // Dùng navigate trong useEffect hoặc trả về null và để component khác xử lý
    // Tạm thời trả về null
    return null;
    // Tốt hơn: navigate("/signin") (nhưng có thể gây lỗi render)
  }

  // Guard 3: Kiểm tra Role (user đã chắc chắn tồn tại)
  if (user.role !== "printer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Lỗi Truy Cập</h2>
        <p>Bạn phải là 'Nhà in' mới có thể truy cập trang này.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Quay về Trang chủ
        </Button>
      </div>
    );
  }
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    // 3. Điền giá trị mặc định từ user (trong store) vào form
    defaultValues: {
      displayName: user?.displayName || "",
      phone: user?.phone || "",
      addressStreet: user?.address?.street || "",
      addressWard: user?.address?.ward || "",
      addressDistrict: user?.address?.district || "",
      addressCity: user?.address?.city || "",
      longitude: user?.address?.location?.coordinates?.[0]?.toString() || "",
      latitude: user?.address?.location?.coordinates?.[1]?.toString() || "",
      specialties: user?.specialties?.join(", ") || "", // Nối array thành string
      priceTier: user?.priceTier || "standard",
      productionSpeed: user?.productionSpeed || "standard",
    },
  });

  // 4. Hàm xử lý Submit
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // 4.1. "Tái cấu trúc" dữ liệu phẳng thành object lồng nhau
      const payload = {
        displayName: values.displayName,
        phone: values.phone,
        specialties:
          values.specialties
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) || [],
        priceTier: values.priceTier,
        productionSpeed: values.productionSpeed,
        address: {
          street: values.addressStreet,
          ward: values.addressWard,
          district: values.addressDistrict,
          city: values.addressCity,
          location: {
            type: "Point",
            coordinates: [
              parseFloat(values.longitude || "0"), // [long]
              parseFloat(values.latitude || "0"), // [lat]
            ],
          },
        },
      };

      // 4.2. GỌI API
      const response = await api.put("/printer/profile", payload);

      // 4.3. Cập nhật user trong store (Zustand)
      setUser(response.data.printer);
      toast.success("Cập nhật hồ sơ thành công!");
      navigate("/"); // Quay về trang chat
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    }
  };

  // 5. Kiểm tra Role
  if (user?.role !== "printer") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Lỗi Truy Cập</h2>
        <p>Bạn phải là 'Nhà in' mới có thể truy cập trang này.</p>
        <Button onClick={() => navigate("/")} className="mt-4">
          Quay về Trang chủ
        </Button>
      </div>
    );
  }

  // 6. Render Form
  return (
    <ScrollArea className="h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto p-6 lg:p-10">
        <h1 className="text-3xl font-bold mb-2">Hồ Sơ Nhà In</h1>
        <p className="text-gray-600 mb-8">
          Cập nhật thông tin của bạn để khách hàng có thể tìm thấy bạn.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 bg-white p-8 rounded-lg shadow-md"
          >
            {/* --- Phần Thông tin chung --- */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Thông tin chung
              </h2>
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hiển thị (Tên tiệm in)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: In ấn Nhanh TDM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="090..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* --- Phần Địa chỉ & Vị trí --- */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Địa chỉ & Vị trí
              </h2>
              <FormField
                name="addressStreet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số đường</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Nguyễn Văn Linh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  name="addressWard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phường/Xã</FormLabel>
                      <FormControl>
                        <Input placeholder="Phú Cường" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="addressDistrict"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quận/Huyện</FormLabel>
                      <FormControl>
                        <Input placeholder="Thủ Dầu Một" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="addressCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉnh/Thành</FormLabel>
                      <FormControl>
                        <Input placeholder="Bình Dương" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Tọa độ (Quan trọng cho tìm kiếm "Gần tôi"):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kinh độ (Longitude)</FormLabel>
                      <FormControl>
                        <Input placeholder="106.6822" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vĩ độ (Latitude)</FormLabel>
                      <FormControl>
                        <Input placeholder="10.9791" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* --- Phần Dịch vụ --- */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Dịch vụ</h2>
              <FormField
                control={form.control}
                name="specialties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chuyên môn</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="áo thun, cốc sứ, banner..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nhập các dịch vụ của bạn, cách nhau bằng dấu phẩy (,).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priceTier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phân khúc giá</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn phân khúc giá" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cheap">Rẻ (Cheap)</SelectItem>
                          <SelectItem value="standard">
                            Tiêu chuẩn (Standard)
                          </SelectItem>
                          <SelectItem value="premium">
                            Cao cấp (Premium)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productionSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tốc độ sản xuất</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tốc độ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fast">Nhanh (Fast)</SelectItem>
                          <SelectItem value="standard">
                            Tiêu chuẩn (Standard)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
};

export default PrinterProfilePage;
