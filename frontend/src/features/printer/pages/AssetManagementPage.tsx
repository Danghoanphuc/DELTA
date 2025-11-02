import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
// SỬA: Thay 'File3d' (không tồn tại) bằng 'FileBox'
import { UploadCloud, FileBox, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// Định nghĩa 1 "Bề mặt" (Surface) mà người dùng sẽ map
interface SurfaceInput {
  key: string; // vd: "main_body"
  name: string; // vd: "Thân hộp"
  materialName: string; // vd: "Material_Lid" (tên trong file GLB)
  dielineFile: File | null; // File SVG
}

export function AssetManagementPage() {
  const [assetName, setAssetName] = useState("");
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [surfaces, setSurfaces] = useState<SurfaceInput[]>([
    {
      key: "surface1",
      name: "Bề mặt chính",
      materialName: "",
      dielineFile: null,
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGlbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith(".glb") || file.name.endsWith(".gltf"))) {
      setGlbFile(file);
      if (!assetName) {
        setAssetName(file.name.replace(/\.(glb|gltf)$/, ""));
      }
    } else {
      toast.error("Vui lòng chỉ tải lên file .glb hoặc .gltf");
    }
  };

  const handleSurfaceChange = (
    index: number,
    field: keyof SurfaceInput,
    value: string
  ) => {
    const newSurfaces = [...surfaces];
    (newSurfaces[index] as any)[field] = value;
    setSurfaces(newSurfaces);
  };

  const handleDielineChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file && file.type === "image/svg+xml") {
      const newSurfaces = [...surfaces];
      newSurfaces[index].dielineFile = file;
      setSurfaces(newSurfaces);
    } else {
      toast.error("Vui lòng chỉ tải lên file .svg cho dieline");
    }
  };

  const addSurface = () => {
    setSurfaces([
      ...surfaces,
      {
        key: `surface${surfaces.length + 1}`,
        name: "",
        materialName: "",
        dielineFile: null,
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !assetName ||
      !glbFile ||
      surfaces.some((s) => !s.name || !s.materialName || !s.dielineFile)
    ) {
      toast.error(
        "Vui lòng điền đầy đủ Tên Phôi, file GLB và các Bề mặt thiết kế (SVG)."
      );
      return;
    }

    setIsSubmitting(true);
    toast.info("Đang tải phôi 3D và dieline lên...");

    try {
      const formData = new FormData();
      formData.append("name", assetName); // Tên Phôi
      formData.append("modelFile", glbFile); // File GLB

      // Map các bề mặt và file dieline
      const surfaceMap: any[] = [];
      surfaces.forEach((surface, index) => {
        // Tên file phải duy nhất, vd: "surface1_dieline.svg"
        const dielineFileName = `${surface.key}_${surface.dielineFile!.name}`;
        formData.append("dielineFiles", surface.dielineFile!, dielineFileName);

        surfaceMap.push({
          key: surface.key,
          name: surface.name,
          materialName: surface.materialName,
          // Server sẽ dùng tên file này để tìm và gán URL
          dielineSvgFileName: dielineFileName,
        });
      });

      formData.append("surfaces", JSON.stringify(surfaceMap));

      // GỌI API ĐỂ LƯU PHÔI (TẠO MỘT ENDPOINT MỚI, VD: /assets/upload-phoi)
      // (Mở comment này khi API sẵn sàng)
      // await api.post("/assets/upload-phoi", formData);

      console.log(
        "FormData to submit (ĐÃ SỬA):",
        Object.fromEntries(formData.entries())
      );
      toast.success(`Đã tải lên Phôi "${assetName}" thành công!`);
      // Reset form (tùy chọn)
      setAssetName("");
      setGlbFile(null);
      setSurfaces([
        {
          key: "surface1",
          name: "Bề mặt chính",
          materialName: "",
          dielineFile: null,
        },
      ]);
    } catch (err) {
      toast.error("Tải phôi thất bại.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý Kho Phôi (3D/2D)
          </h1>
          <p className="text-gray-600">
            Tải lên các file .glb và .svg dieline (khuôn) của bạn tại đây.
          </p>
        </div>

        {/* Form Tải Lên */}
        <form onSubmit={handleSubmit}>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Tải lên Phôi mới</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-2">
                <Label htmlFor="assetName">Tên Phôi *</Label>
                <Input
                  id="assetName"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="VD: Hộp nắp gài, Ly giấy 12oz..."
                  required
                />
              </div>

              {/* Tải file GLB */}
              <div className="space-y-2">
                <Label htmlFor="glbFile">File Mô hình 3D (.glb) *</Label>
                <Input
                  id="glbFile"
                  type="file"
                  accept=".glb,.gltf"
                  onChange={handleGlbChange}
                  required
                />
                {glbFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    {/* SỬA: Dùng icon 'FileBox' đã import */}
                    <FileBox size={16} /> {glbFile.name}
                  </div>
                )}
              </div>

              <hr />

              {/* Map Bề mặt (Surfaces) */}
              <h4 className="font-semibold">Map Bề mặt Thiết kế (Dieline) *</h4>
              <div className="space-y-4">
                {surfaces.map((surface, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-3 p-4 border rounded-lg bg-gray-50"
                  >
                    <Input
                      placeholder="Tên bề mặt (VD: Thân hộp)"
                      value={surface.name}
                      onChange={(e) =>
                        handleSurfaceChange(index, "name", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Tên Material (trong file GLB)"
                      value={surface.materialName}
                      onChange={(e) =>
                        handleSurfaceChange(
                          index,
                          "materialName",
                          e.target.value
                        )
                      }
                      required
                    />
                    <div>
                      <Input
                        type="file"
                        accept="image/svg+xml"
                        onChange={(e) => handleDielineChange(index, e)}
                        required
                      />
                      {surface.dielineFile && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                          <FileText size={16} /> {surface.dielineFile.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSurface}
              >
                + Thêm bề mặt (Nếu có 2 mặt in)
              </Button>

              <hr />

              {/* Nút Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <UploadCloud className="mr-2" />
                )}
                {isSubmitting ? "Đang tải lên..." : "Lưu Phôi"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
