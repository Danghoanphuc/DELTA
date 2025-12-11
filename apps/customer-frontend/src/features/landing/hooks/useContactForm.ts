// apps/customer-frontend/src/features/landing/hooks/useContactForm.ts
import { useState } from "react";
import { contactService, ContactFormData } from "../services/contact.service";
import { toast } from "sonner";

export function useContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async (
    data: Omit<ContactFormData, "latitude" | "longitude">
  ) => {
    setIsSubmitting(true);

    try {
      // ✅ KHÔNG dùng browser geolocation (sẽ hỏi permission)
      // Backend tự động lấy vị trí từ IP address - hoàn toàn âm thầm!
      const formData: ContactFormData = {
        ...data,
      };

      const response = await contactService.submitContactRequest(formData);

      toast.success(
        response.message ||
          "Đã gửi yêu cầu thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất."
      );

      return true;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        "Không thể gửi yêu cầu. Vui lòng thử lại sau.";

      toast.error(message);
      console.error("Error submitting contact form:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitForm,
  };
}
