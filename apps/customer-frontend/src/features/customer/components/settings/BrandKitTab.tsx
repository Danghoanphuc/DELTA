// src/features/customer/components/settings/BrandKitTab.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Upload, Plus, Trash2 } from "lucide-react";

// (Đây là dữ liệu giả, chúng ta sẽ lấy từ API ở Bàn giao 2)
const mockBrandKit = {
  logos: [
    {
      id: "1",
      url: "https://via.placeholder.com/150/0000FF/FFFFFF?text=Logo1",
    },
    {
      id: "2",
      url: "https://via.placeholder.com/150/FF0000/FFFFFF?text=Logo2",
    },
  ],
  colors: ["#4F46E5", "#D946EF", "#F59E0B"],
};

export function BrandKitTab() {
  // TODO:
  // const { brandKit, isLoading, addLogo, removeLogo, addColor, removeColor } = useBrandKit();

  return (
    <div className="space-y-6">
      {/* Card 1: Quản lý Logos */}
      <Card>
        <CardHeader>
          <CardTitle>Logos thương hiệu</CardTitle>
          <CardDescription>
            Tải lên logo của bạn. AI Zin sẽ tự động sử dụng chúng khi tạo thiết
            kế mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {mockBrandKit.logos.map((logo) => (
              <Card
                key={logo.id}
                className="aspect-square relative group overflow-hidden"
              >
                <img
                  src={logo.url}
                  alt="Logo"
                  className="w-full h-full object-contain p-2"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              className="aspect-square border-dashed border-2 flex flex-col items-center justify-center h-full"
              asChild
            >
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-xs mt-1 text-gray-500">Tải lên</span>
                <input type="file" id="logo-upload" className="hidden" />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Quản lý Màu sắc */}
      <Card>
        <CardHeader>
          <CardTitle>Màu sắc thương hiệu</CardTitle>
          <CardDescription>
            Thêm mã màu chính. AI Zin sẽ ưu tiên các màu này.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {mockBrandKit.colors.map((color, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <div
                  className="w-8 h-8 rounded-full border"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-sm">{color}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 text-gray-400 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Input type="color" className="w-12 h-10 p-1" />
              <Input placeholder="#..." className="w-24 font-mono" />
              <Button type="button">
                <Plus className="w-4 h-4 mr-1" /> Thêm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
