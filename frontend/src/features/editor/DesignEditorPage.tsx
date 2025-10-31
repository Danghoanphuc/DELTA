// src/features/editor/DesignEditorPage.tsx
import React, { useRef, useEffect, useState } from "react";
// Import đúng cho Fabric v6
import { Canvas, Rect, IText, FabricImage } from "fabric";

import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/shared/lib/axios";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Text, Image, Save, Brush } from "lucide-react";

export function DesignEditorPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  const productId = searchParams.get("productId");
  const templateId = searchParams.get("templateId");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  // --- 1. KHỞI TẠO CANVAS ---
  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const canvas = new Canvas(canvasEl, {
      width: 500,
      height: 500,
      backgroundColor: "#ffffff",
    });
    fabricCanvasRef.current = canvas;

    const rect = new Rect({
      left: 10,
      top: 10,
      width: 480,
      height: 480,
      fill: "transparent",
      stroke: "#f0f0f0",
      strokeWidth: 2,
      selectable: false,
    });
    canvas.add(rect);

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // --- 2. TẢI DỮ LIỆU (NẾU CÓ) ---
  useEffect(() => {
    const loadTemplate = async () => {
      if (!templateId || !fabricCanvasRef.current) return;

      try {
        const res = await api.get(`/designs/templates/${templateId}`);
        const editorData = res.data?.data?.template?.editorData;
        if (editorData) {
          fabricCanvasRef.current.loadFromJSON(editorData, () => {
            fabricCanvasRef.current?.renderAll();
          });
        }
      } catch (err) {
        toast.error("Không thể tải mẫu thiết kế này");
        navigate("/templates");
      }
    };

    loadTemplate();
  }, [templateId, navigate]);

  // --- 3. CÁC HÀM CỦA THANH CÔNG CỤ ---
  const addText = () => {
    if (!fabricCanvasRef.current) return;
    const text = new IText("Sửa chữ này", {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: "#000000",
    });
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvasRef.current) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      try {
        // Fabric v6: Sử dụng FabricImage.fromURL với async/await
        const img = await FabricImage.fromURL(f.target?.result as string);
        img.scaleToWidth(150);
        fabricCanvasRef.current?.add(img);
        fabricCanvasRef.current?.renderAll();
      } catch (error) {
        console.error("Lỗi khi tải ảnh:", error);
        toast.error("Không thể tải ảnh lên");
      }
    };
    reader.readAsDataURL(file);
  };

  // --- 4. HÀM LƯU VÀ THÊM VÀO GIỎ HÀNG ---
  const handleSaveAndAddToCart = async () => {
    if (!fabricCanvasRef.current || !productId) {
      toast.error("Lỗi: Không tìm thấy sản phẩm để thêm vào giỏ hàng.");
      return;
    }
    setIsSaving(true);

    try {
      const editorData = fabricCanvasRef.current.toJSON();

      // Fabric v6: toBlob đã được hỗ trợ native và trả về Promise<Blob>
      const blob = await fabricCanvasRef.current.toBlob({
        format: "png",
        quality: 0.8,
      });

      if (!blob) {
        throw new Error("Không thể tạo ảnh preview");
      }

      const finalPreviewImageUrl = URL.createObjectURL(blob);

      const res = await api.post("/designs/customized", {
        editorData,
        finalPreviewImageUrl,
        baseTemplateId: templateId || undefined,
      });

      const customizedDesignId = res.data?.data?.design?._id;
      if (!customizedDesignId) {
        throw new Error("Không nhận được ID thiết kế đã lưu");
      }

      const quantity = 100; // Tạm thời
      const selectedPriceIndex = 0;

      await addToCart({
        productId: productId,
        quantity: quantity,
        selectedPriceIndex: selectedPriceIndex,
        customization: {
          notes: "Thiết kế từ trình editor",
          customizedDesignId: customizedDesignId,
        },
      });

      toast.success("Đã lưu thiết kế và thêm vào giỏ hàng!");
      navigate("/checkout");
    } catch (err) {
      console.error("Lỗi khi lưu thiết kế:", err);
      toast.error("Không thể lưu thiết kế của bạn.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 5. RENDER ---
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Thanh công cụ (Toolbar) */}
      <div className="w-full md:w-60 bg-white p-4 border-r flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4">Công cụ</h2>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={addText}
          >
            <Text size={18} className="mr-2" /> Thêm chữ
          </Button>

          <Label
            htmlFor="file-upload"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full cursor-pointer justify-start"
            )}
          >
            <Image size={18} className="mr-2" /> Tải ảnh lên
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          <Button variant="outline" className="w-full justify-start" disabled>
            <Brush size={18} className="mr-2" /> Vẽ hình
          </Button>
        </div>

        {/* Nút Save/Hoàn tất */}
        <div className="mt-8 border-t pt-4">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleSaveAndAddToCart}
            disabled={isSaving || !productId}
          >
            {isSaving ? (
              "Đang xử lý..."
            ) : (
              <>
                <Save size={18} className="mr-2" />
                {productId ? "Lưu & Thêm vào giỏ" : "Thiếu ID sản phẩm"}
              </>
            )}
          </Button>
          {!productId && (
            <p className="text-xs text-red-500 mt-2">
              Lỗi: Không tìm thấy productId. Vui lòng thử lại từ trang sản phẩm.
            </p>
          )}
        </div>
      </div>

      {/* Vùng Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <canvas ref={canvasRef} className="shadow-lg" />
      </div>
    </div>
  );
}
