import { Header, Footer } from "./components";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      <section className="pt-40 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6 italic">
            Legal & Privacy.
          </h1>
          <p className="text-stone-500">Last updated: December 02, 2025</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24">
        <Tabs defaultValue="terms" className="w-full">
          <TabsList className="w-full flex justify-center bg-transparent border-b border-stone-300 rounded-none h-auto p-0 mb-12">
            {["Terms of Service", "Privacy Policy", "Refund Policy"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab.split(" ")[0].toLowerCase()}
                  className="rounded-none border-b-2 border-transparent px-8 py-4 font-mono text-sm font-bold text-stone-400 uppercase tracking-widest data-[state=active]:border-emerald-800 data-[state=active]:text-stone-900 data-[state=active]:bg-transparent transition-all"
                >
                  {tab}
                </TabsTrigger>
              )
            )}
          </TabsList>

          <TabsContent
            value="terms"
            className="bg-white p-12 md:p-16 shadow-sm border border-stone-200"
          >
            <article className="prose prose-stone prose-lg max-w-none font-light">
              <h3 className="font-serif text-3xl text-stone-900 italic">
                1. Điều khoản chung
              </h3>
              <p>
                Chào mừng bạn đến với Printz. Khi sử dụng dịch vụ hạ tầng in ấn
                của chúng tôi, bạn đồng ý tuân thủ các điều khoản dịch vụ nghiêm
                ngặt nhằm đảm bảo quyền lợi cho cả hai bên.
              </p>

              <h3 className="font-serif text-3xl text-stone-900 italic mt-8">
                2. Quyền sở hữu trí tuệ
              </h3>
              <p>
                Mọi thiết kế được tạo ra trên nền tảng Printz đều thuộc quyền sở
                hữu của khách hàng (sau khi thanh toán). Tuy nhiên, Printz giữ
                quyền sử dụng hình ảnh sản phẩm thực tế cho mục đích Portfolio
                trừ khi có yêu cầu bảo mật (NDA).
              </p>

              {/* Thêm nội dung giả định... */}
            </article>
          </TabsContent>

          {/* Các Tab khác tương tự... */}
        </Tabs>
      </section>

      <Footer />
    </div>
  );
}
