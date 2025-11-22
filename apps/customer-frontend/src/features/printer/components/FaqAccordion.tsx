// src/features/printer/components/FaqAccordion.tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";

export function FaqAccordion() {
  const faqs = [
    {
      q: "Làm thế nào để thêm sản phẩm mới?",
      a: "Vào mục 'Sản phẩm' > Nhấn nút 'Thêm sản phẩm mới' màu cam ở góc phải. Bạn sẽ được hướng dẫn qua quy trình 5 bước để đăng bán sản phẩm.",
    },
    {
      q: "Khi nào tôi nhận được tiền thanh toán?",
      a: "Tiền sẽ được chuyển vào 'Số dư khả dụng' sau khi đơn hàng hoàn tất 3 ngày (để đảm bảo không có khiếu nại). Bạn có thể rút tiền bất cứ lúc nào khi số dư > 200.000đ.",
    },
    {
      q: "Tôi có thể từ chối đơn hàng không?",
      a: "Có. Nếu không thể thực hiện đơn hàng, bạn có thể bấm 'Từ chối' ở trạng thái Chờ xác nhận. Lưu ý: Việc từ chối quá nhiều có thể ảnh hưởng đến điểm uy tín của xưởng.",
    },
    {
      q: "Làm sao để thay đổi thông tin xưởng in?",
      a: "Truy cập mục 'Cài đặt' > 'Thông tin Xưởng'. Tại đây bạn có thể cập nhật Logo, Tên xưởng, Địa chỉ và Mô tả.",
    },
    {
      q: "Phí nền tảng PrintZ là bao nhiêu?",
      a: "PrintZ thu phí hoa hồng cố định trên mỗi đơn hàng thành công. Mức phí chi tiết tùy thuộc vào gói dịch vụ bạn đăng ký (Standard: 5%, Premium: 3%).",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index} className="border-b border-gray-100 last:border-0 px-6">
            <AccordionTrigger className="text-gray-800 hover:text-orange-600 hover:no-underline py-4 text-left text-sm font-medium">
               {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-gray-500 pb-4 leading-relaxed">
               {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}