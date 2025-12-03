import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { Check, Lock, MousePointer2, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* 1. HERO TEXT ONLY - BOLD STATEMENT */}
      <section className="pt-40 pb-20 px-4 text-center">
        <h1 className="font-serif text-5xl md:text-7xl text-stone-900 mb-8 max-w-4xl mx-auto leading-tight">
          Quản trị Thương hiệu. <br />
          <span className="italic text-emerald-800">Không phải việc vặt.</span>
        </h1>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-10 font-light">
          Printz for Business cung cấp hạ tầng để bạn kiểm soát Brand
          Consistency, phân quyền đặt hàng và minh bạch hóa đơn cho toàn bộ tổ
          chức.
        </p>
        <Button className="bg-emerald-900 hover:bg-emerald-800 text-white px-10 py-6 rounded-none text-lg">
          Mở tài khoản Doanh nghiệp
        </Button>
      </section>

      {/* 2. PROBLEMS & SOLUTIONS - GRID MINIMAL */}
      <section className="py-24 px-4 max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-3 gap-px bg-stone-200 border border-stone-200">
          {/* Card 1 */}
          <div className="bg-white p-12 hover:bg-stone-50 transition-colors group">
            <div className="w-12 h-12 border border-stone-200 rounded-full flex items-center justify-center mb-8 group-hover:border-emerald-800 group-hover:text-emerald-800 transition-colors">
              <Lock strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-xl text-stone-900 mb-4">
              Brand Control
            </h3>
            <p className="text-stone-500 leading-relaxed">
              Khóa cứng Template (Logo, Font, Layout). Nhân viên chỉ được sửa
              thông tin cá nhân. Không còn lỗi sai nhận diện thương hiệu.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-12 hover:bg-stone-50 transition-colors group">
            <div className="w-12 h-12 border border-stone-200 rounded-full flex items-center justify-center mb-8 group-hover:border-emerald-800 group-hover:text-emerald-800 transition-colors">
              <MousePointer2 strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-xl text-stone-900 mb-4">
              Self-Service Ordering
            </h3>
            <p className="text-stone-500 leading-relaxed">
              Trao quyền cho nhân viên tự đặt in danh thiếp, đồng phục. Yêu cầu
              in sẽ được gửi đến Admin để duyệt (Approve) trước khi sản xuất.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-12 hover:bg-stone-50 transition-colors group">
            <div className="w-12 h-12 border border-stone-200 rounded-full flex items-center justify-center mb-8 group-hover:border-emerald-800 group-hover:text-emerald-800 transition-colors">
              <Receipt strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-xl text-stone-900 mb-4">
              Centralized Billing
            </h3>
            <p className="text-stone-500 leading-relaxed">
              Không còn hàng trăm hóa đơn lẻ tẻ. Printz tổng hợp công nợ và xuất
              01 hóa đơn VAT duy nhất vào cuối tháng cho bộ phận kế toán.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
