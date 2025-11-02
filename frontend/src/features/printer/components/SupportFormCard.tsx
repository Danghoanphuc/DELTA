// src/components/printer/SupportFormCard.tsx (SỬA: THÊM LOGIC FORM)
import { FileText } from "lucide-react";
import { useForm } from "react-hook-form"; // SỬA: Thêm
import { toast } from "sonner"; // SỬA: Thêm
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form"; // SỬA: Thêm

type SupportFormValues = {
  subject: string;
  message: string;
};

export function SupportFormCard() {
  const form = useForm<SupportFormValues>({
    defaultValues: { subject: "", message: "" },
  });

  const onSubmit = (data: SupportFormValues) => {
    // TODO: Gọi API gửi email hoặc tạo ticket hỗ trợ
    console.log("Support Request Data:", data);
    toast.success("Đã gửi yêu cầu hỗ trợ!", {
      description: "Chúng tôi sẽ phản hồi bạn sớm nhất có thể.",
    });
    form.reset();
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <FileText size={20} className="text-orange-600" />
          Gửi yêu cầu hỗ trợ
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* SỬA: Bọc form lại */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              rules={{ required: "Tiêu đề không được để trống" }}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="subject">Tiêu đề</Label>
                  <FormControl>
                    <Input
                      id="subject"
                      placeholder="VD: Vấn đề về đơn hàng DH001"
                      className="mt-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              rules={{ required: "Nội dung không được để trống" }}
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="message">Nội dung</Label>
                  <FormControl>
                    <Textarea
                      id="message"
                      placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                      className="mt-1 h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit" // SỬA: Thêm type
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              disabled={form.formState.isSubmitting} // SỬA: Thêm
            >
              Gửi Yêu Cầu
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
