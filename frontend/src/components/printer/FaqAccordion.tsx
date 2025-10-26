// src/components/printer/FaqAccordion.tsx (COMPONENT MỚI)
import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FaqAccordion() {
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

  return (
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
  );
}
