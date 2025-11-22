// src/features/printer/pages/SupportPage.tsx
import { ContactMethodsGrid } from "@/features/printer/components/ContactMethodsGrid";
import { FaqAccordion } from "@/features/printer/components/FaqAccordion";
import { SupportFormCard } from "@/features/printer/components/SupportFormCard";
import { LifeBuoy, MessageSquare, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export function SupportPage() {
  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      
      {/* HERO HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 sticky top-0 z-20 bg-white/80 backdrop-blur-md">
         <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <LifeBuoy size={28} />
               </div>
               <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Trung tâm Hỗ trợ</h1>
            </div>
            <p className="text-gray-500 text-lg max-w-2xl">
               Chúng tôi ở đây để giúp bạn. Tìm câu trả lời nhanh hoặc liên hệ trực tiếp với đội ngũ hỗ trợ.
            </p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* SECTION 1: LIÊN HỆ NHANH */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
          >
             <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-gray-800">Kênh liên hệ ưu tiên</h2>
             </div>
             <ContactMethodsGrid />
          </motion.section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* SECTION 2: FORM GỬI YÊU CẦU (CHIẾM 7 PHẦN) */}
            <motion.div 
               className="lg:col-span-7 space-y-6"
               initial={{ opacity: 0, x: -20 }} 
               animate={{ opacity: 1, x: 0 }} 
               transition={{ duration: 0.4, delay: 0.1 }}
            >
               <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-gray-800">Gửi yêu cầu hỗ trợ</h2>
               </div>
               <SupportFormCard />
            </motion.div>

            {/* SECTION 3: FAQ (CHIẾM 5 PHẦN) */}
            <motion.div 
               className="lg:col-span-5 space-y-6"
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               transition={{ duration: 0.4, delay: 0.2 }}
            >
               <div className="flex items-center gap-2">
                  <BookOpen className="text-gray-500" size={20} />
                  <h2 className="text-xl font-bold text-gray-800">Câu hỏi thường gặp</h2>
               </div>
               <FaqAccordion />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}