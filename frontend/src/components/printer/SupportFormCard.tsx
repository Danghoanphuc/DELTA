// src/components/printer/SupportFormCard.tsx (COMPONENT MỚI)
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";

export function SupportFormCard() {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <FileText size={20} className="text-orange-600" />
          Gửi yêu cầu hỗ trợ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="subject">Tiêu đề</Label>
          <Input
            id="subject"
            placeholder="VD: Vấn đề về đơn hàng DH001"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="message">Nội dung</Label>
          <Textarea
            id="message"
            placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
            className="mt-1 h-32"
          />
        </div>
        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
          Gửi Yêu Cầu
        </Button>
      </CardContent>
    </Card>
  );
}
