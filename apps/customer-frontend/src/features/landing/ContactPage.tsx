import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Phone, Mail, MapPin, Send, MessageSquare } from "lucide-react";
import { Header, Footer } from "./components";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header /> 
      
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
         <div className="absolute inset-0 bg-grid-blue opacity-10"></div>
         <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Liên hệ Printz</h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
               Chúng tôi luôn sẵn sàng hỗ trợ. Gửi yêu cầu và đội ngũ kỹ thuật sẽ phản hồi trong vòng 2 giờ làm việc.
            </p>
         </div>
      </section>

      {/* CONTACT CONTENT - Dạng thẻ nổi (Floating Card) */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20 mb-20">
         <div className="bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-5 min-h-[600px]">
            
            {/* LEFT: INFO (2 cols) - Nền Xanh Printz */}
            <div className="md:col-span-2 bg-blue-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
               <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Thông tin liên hệ</h3>
                  <p className="text-blue-100 mb-8">Kết nối trực tiếp với văn phòng.</p>
                  
                  <div className="space-y-6">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                           <Phone className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-blue-200 text-sm">Tổng đài hỗ trợ</p>
                           <p className="font-bold text-lg">1900 xxxx</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                           <Mail className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-blue-200 text-sm">Email</p>
                           <p className="font-bold">support@printz.vn</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                           <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-blue-200 text-sm">Trụ sở chính</p>
                           <p className="font-medium">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Socials Bottom */}
               <div className="relative z-10 mt-10">
                  <p className="text-sm text-blue-200 mb-4">Mạng xã hội</p>
                  <div className="flex gap-4">
                     {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors"></div>
                     ))}
                  </div>
               </div>
            </div>

            {/* RIGHT: FORM (3 cols) */}
            <div className="md:col-span-3 p-10 bg-white">
               <form className="space-y-6 h-full flex flex-col justify-center">
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label>Họ và tên</Label>
                        <Input placeholder="Nguyễn Văn A" className="rounded-xl bg-slate-50 border-slate-200 py-6" />
                     </div>
                     <div className="space-y-2">
                        <Label>Số điện thoại</Label>
                        <Input placeholder="0912..." className="rounded-xl bg-slate-50 border-slate-200 py-6" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label>Email</Label>
                     <Input type="email" placeholder="email@example.com" className="rounded-xl bg-slate-50 border-slate-200 py-6" />
                  </div>
                  <div className="space-y-2">
                     <Label>Nội dung cần hỗ trợ</Label>
                     <Textarea 
                        placeholder="Mô tả yêu cầu của bạn..." 
                        className="rounded-xl bg-slate-50 border-slate-200 min-h-[150px] resize-none" 
                     />
                  </div>

                  <div className="pt-4">
                     <Button className="w-full py-6 rounded-xl bg-slate-900 text-white hover:bg-blue-600 text-lg shadow-lg">
                        Gửi tin nhắn <Send className="ml-2 w-4 h-4" />
                     </Button>
                  </div>
               </form>
            </div>

         </div>
      </div>
      <Footer />
    </div>
  );
}