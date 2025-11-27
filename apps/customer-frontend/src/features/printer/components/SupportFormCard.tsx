// src/features/printer/components/SupportFormCard.tsx
import { useForm } from "react-hook-form";
import { toast } from "@/shared/utils/toast";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Loader2, Send, Paperclip } from "lucide-react";

type SupportFormValues = {
  subject: string;
  email: string;
  message: string;
};

export function SupportFormCard() {
  const form = useForm<SupportFormValues>({
    defaultValues: { subject: "", email: "", message: "" },
  });

  const onSubmit = async (data: SupportFormValues) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Support Request:", data);
    toast.success("Đã gửi yêu cầu thành công!", {
      description: "Mã ticket của bạn là #REQ-2024-889. Vui lòng kiểm tra email.",
    });
    form.reset();
  };

  return (
    <Card className="border-none shadow-lg bg-white overflow-hidden">
      <CardContent className="p-0">
        {/* Form Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-100">
           <p className="text-sm text-gray-600">
              Điền thông tin chi tiết bên dưới. Đội ngũ kỹ thuật sẽ phản hồi qua email của bạn.
           </p>
        </div>

        <div className="p-6 md:p-8">
           <Form {...form}>
             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: "Email là bắt buộc", pattern: { value: /^\S+@\S+$/i, message: "Email không hợp lệ" } }}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-700">Email liên hệ <span className="text-red-500">*</span></Label>
                        <FormControl>
                          <Input placeholder="name@example.com" className="bg-gray-50 border-gray-200 focus:bg-white transition-all" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    rules={{ required: "Tiêu đề là bắt buộc" }}
                    render={({ field }) => (
                      <FormItem>
                        <Label className="text-gray-700">Vấn đề gặp phải <span className="text-red-500">*</span></Label>
                        <FormControl>
                          <Input placeholder="VD: Lỗi không tải được file..." className="bg-gray-50 border-gray-200 focus:bg-white transition-all" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>

               <FormField
                 control={form.control}
                 name="message"
                 rules={{ required: "Nội dung là bắt buộc", minLength: { value: 20, message: "Vui lòng mô tả chi tiết hơn (tối thiểu 20 ký tự)" } }}
                 render={({ field }) => (
                   <FormItem>
                     <Label className="text-gray-700">Chi tiết vấn đề <span className="text-red-500">*</span></Label>
                     <FormControl>
                       <Textarea
                         placeholder="Mô tả chi tiết vấn đề, mã đơn hàng liên quan, hoặc các bước để tái hiện lỗi..."
                         className="min-h-[150px] bg-gray-50 border-gray-200 focus:bg-white transition-all resize-none"
                         {...field}
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />

               <div className="flex items-center justify-between pt-2">
                  <Button type="button" variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                     <Paperclip size={16} className="mr-2" /> Đính kèm ảnh/file
                  </Button>

                  <Button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 text-white px-8 shadow-lg shadow-gray-900/20 transition-all"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                         <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi...
                      </>
                    ) : (
                      <>
                         Gửi yêu cầu <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
               </div>
             </form>
           </Form>
        </div>
      </CardContent>
    </Card>
  );
}