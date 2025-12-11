// src/features/organization/pages/SupportPage.tsx
// ✅ B2B Organization Support

import { HelpCircle, MessageCircle, Phone, Mail, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export function SupportPage() {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Chat trực tuyến",
      description: "Hỗ trợ nhanh qua chat",
      action: "Bắt đầu chat",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Phone,
      title: "Hotline",
      description: "1900 xxxx (8h-22h)",
      action: "Gọi ngay",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Mail,
      title: "Email",
      description: "support@printz.vn",
      action: "Gửi email",
      color: "text-[#C63321]",
      bgColor: "bg-[#FFF5F3]",
    },
  ];

  const faqs = [
    {
      question: "Làm sao để đặt hàng số lượng lớn?",
      answer:
        "Bạn có thể liên hệ trực tiếp với đội ngũ sales để được báo giá tốt nhất cho đơn hàng số lượng lớn.",
    },
    {
      question: "Thời gian giao hàng là bao lâu?",
      answer:
        "Thời gian giao hàng phụ thuộc vào loại sản phẩm và số lượng. Thông thường từ 3-7 ngày làm việc.",
    },
    {
      question: "Làm sao để xuất hóa đơn VAT?",
      answer:
        "Vui lòng cập nhật mã số thuế trong phần Cài đặt. Hóa đơn sẽ được xuất tự động sau mỗi đơn hàng.",
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">Hỗ trợ</h1>
          <p className="text-[#57534E]">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {supportOptions.map((option, index) => (
            <Card
              key={index}
              className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`w-14 h-14 rounded-full ${option.bgColor} flex items-center justify-center mx-auto mb-4`}
                >
                  <option.icon className={option.color} size={28} />
                </div>
                <h3 className="font-semibold text-[#1C1917] mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-[#78716C] mb-4">
                  {option.description}
                </p>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C63321]" />
              Câu hỏi thường gặp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-[#FAFAF8] rounded-lg">
                  <h4 className="font-medium text-[#1C1917] mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-[#57534E]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SupportPage;
