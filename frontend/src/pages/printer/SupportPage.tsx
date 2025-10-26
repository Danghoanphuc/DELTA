// frontend/src/pages/printer/SupportPage.tsx (FIXED - Tailwind Dynamic Classes)

import { MessageCircle, Phone, Mail, FileText, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SupportPage() {
  const faqs = [
    {
      question: "Làm thế nào để thêm sản phẩm mới?",
      answer:
        "Vào mục 'Sản phẩm' > Nhấn nút 'Thêm sản phẩm mới' > Điền thông tin chi tiết và lưu.",
    },
    {
      question: "Tôi xem đơn hàng mới ở đâu?",
      answer:
        "Tất cả đơn hàng mới sẽ hiển thị trong mục 'Đơn hàng'. Bạn có thể lọc theo trạng thái 'Đang xử lý' hoặc 'Chờ xác nhận'.",
    },
    {
      question: "Làm thế nào để thay đổi thông tin xưởng in?",
      answer:
        "Vào mục 'Cài đặt', bạn có thể cập nhật tên, địa chỉ, chuyên môn, và các thông tin khác của xưởng in.",
    },
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Chat trực tuyến",
      desc: "Trò chuyện ngay với hỗ trợ viên (Phản hồi trong 2 phút)",
      button: "Bắt đầu chat",
      color: "blue" as const,
    },
    {
      icon: Phone,
      title: "Gọi Hotline",
      desc: "1900 1234 (Phản hồi ngay lập tức, 24/7)",
      button: "Gọi ngay",
      color: "green" as const,
    },
    {
      icon: Mail,
      title: "Gửi Email",
      desc: "hotro@printz.vn (Phản hồi trong 24 giờ)",
      button: "Gửi email",
      color: "gray" as const,
    },
  ];

  // ✅ FIXED: Tailwind color map (không dùng dynamic class names)
  const getColorClasses = (color: "blue" | "green" | "gray") => {
    const colorMap = {
      blue: {
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: "text-blue-500",
      },
      green: {
        button: "bg-green-600 hover:bg-green-700 text-white",
        icon: "text-green-500",
      },
      gray: {
        button: "bg-gray-600 hover:bg-gray-700 text-white",
        icon: "text-gray-500",
      },
    };
    return colorMap[color];
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hỗ trợ</h1>
          <p className="text-gray-600">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {contactMethods.map((method) => {
            const colors = getColorClasses(method.color);
            return (
              <Card
                key={method.title}
                className="border-none shadow-sm bg-white"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">
                    {method.title}
                  </CardTitle>
                  <method.icon className={`w-5 h-5 ${colors.icon}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{method.desc}</p>
                  {/* ✅ FIXED: Use color classes from map */}
                  <Button className={`w-full ${colors.button}`}>
                    {method.button}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ and Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FAQ */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <HelpCircle size={20} className="text-orange-600" />
                Câu hỏi thường gặp (FAQs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Support Form */}
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
        </div>
      </div>
    </div>
  );
}
