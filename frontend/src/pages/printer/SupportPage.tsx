// src/pages/printer/SupportPage.tsx
import {
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Video,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // 👈 Sửa
import { Button } from "@/components/ui/button"; // 👈 Sửa
import { Input } from "@/components/ui/input"; // 👈 Sửa
import { Textarea } from "@/components/ui/textarea"; // 👈 Thêm

export function SupportPage() {
  // ... (Toàn bộ code JSX và logic từ file Printer/SupportPage.tsx của bạn) ...
  const faqs = [
    {
      question: "Làm thế nào để thêm sản phẩm mới?",
      answer:
        "Vào mục Sản phẩm > Chọn danh mục > Chọn loại sản phẩm > Điền thông tin chi tiết và lưu.",
    },
    // ... (v.v...)
  ];
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Hỗ trợ</h1>
          <p className="text-gray-600">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>
        {/* ... (Phần còn lại của file SupportPage.tsx) ... */}
      </div>
    </div>
  );
}
