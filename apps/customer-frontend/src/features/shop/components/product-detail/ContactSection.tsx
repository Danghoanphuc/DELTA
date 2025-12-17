// ContactSection.tsx - Section 8: Contact Form
import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/utils/toast";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company: "",
    logo: null as File | null,
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Cảm ơn bạn! Chúng tôi sẽ liên hệ trong 24h.");
    // TODO: Send to backend
  };

  return (
    <section
      id="contact-form"
      data-section="8"
      className="relative bg-amber-50 py-24 opacity-0 transition-all duration-1000 min-h-screen flex items-center"
    >
      <div className="mx-auto max-w-2xl px-6 w-full">
        <h2 className="mb-4 text-center font-serif text-4xl">
          Nhận bản demo thiết kế miễn phí
        </h2>
        <p className="mb-12 text-center text-stone-600">
          Gửi thông tin để nhận bản thiết kế logo lên hộp quà này
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Input
            placeholder="Họ và tên *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-12"
          />
          <Input
            placeholder="Số điện thoại *"
            required
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="h-12"
          />
          <Input
            placeholder="Tên công ty *"
            required
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            className="h-12"
          />
          <div>
            <label className="mb-2 block text-sm text-stone-600">
              Upload Logo (PNG, SVG, AI)
            </label>
            <Input
              type="file"
              accept=".png,.svg,.ai"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  logo: e.target.files?.[0] || null,
                })
              }
              className="h-12"
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-amber-900 hover:bg-amber-800"
          >
            Gửi yêu cầu
          </Button>
        </form>
      </div>
    </section>
  );
}
