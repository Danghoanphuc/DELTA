// frontend/src/pages/printer/SupportPage.tsx (ĐÃ REFACTOR)
import { ContactMethodsGrid } from "@/components/printer/ContactMethodsGrid";
import { FaqAccordion } from "@/components/printer/FaqAccordion";
import { SupportFormCard } from "@/components/printer/SupportFormCard";

export function SupportPage() {
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
        <ContactMethodsGrid />

        {/* FAQ and Support Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FaqAccordion />
          <SupportFormCard />
        </div>
      </div>
    </div>
  );
}
