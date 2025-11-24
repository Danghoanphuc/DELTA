import { Header, Footer } from "./components";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Check, Building2, Users, Award, Target, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Quản lý đơn hàng tập trung",
      description: "Dashboard tổng quan cho toàn bộ đơn hàng in ấn của doanh nghiệp.",
    },
    {
      icon: Users,
      title: "Đội ngũ hỗ trợ chuyên dụng",
      description: "Account Manager riêng và hotline 24/7 cho khách hàng doanh nghiệp.",
    },
    {
      icon: Award,
      title: "Chất lượng đảm bảo",
      description: "Cam kết SLA, kiểm tra chất lượng 3 lớp trước khi giao hàng.",
    },
    {
      icon: Target,
      title: "Giá ưu đãi theo volume",
      description: "Báo giá cạnh tranh với mức chiết khấu hấp dẫn cho đơn hàng lớn.",
    },
    {
      icon: TrendingUp,
      title: "Báo cáo & Phân tích",
      description: "Dashboard phân tích chi phí, xu hướng và tối ưu ngân sách in ấn.",
    },
    {
      icon: Zap,
      title: "Giao hàng nhanh",
      description: "Hậu cần tối ưu với nhiều điểm giao hàng trên toàn quốc.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "Liên hệ",
      description: "Phù hợp cho doanh nghiệp nhỏ",
      features: [
        "Tối đa 50 đơn hàng/tháng",
        "Hỗ trợ email & chat",
        "Báo giá trong 24h",
        "Giao hàng tiêu chuẩn",
      ],
    },
    {
      name: "Professional",
      price: "Liên hệ",
      description: "Lý tưởng cho doanh nghiệp vừa",
      features: [
        "Không giới hạn đơn hàng",
        "Account Manager riêng",
        "Báo giá ưu đãi",
        "Giao hàng nhanh (2-5 ngày)",
        "Báo cáo định kỳ",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Tùy chỉnh",
      description: "Giải pháp tùy biến cho tập đoàn",
      features: [
        "Không giới hạn đơn hàng",
        "Đội ngũ hỗ trợ chuyên dụng",
        "Giá thương lượng",
        "Giao hàng khẩn cấp (24-48h)",
        "Báo cáo real-time",
        "Tích hợp API/ERP",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20 text-sm font-medium mb-6">
              <Building2 className="w-4 h-4" />
              <span>Giải pháp Doanh nghiệp</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
              In ấn cho Doanh nghiệp
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-cyan-200">
                Chuyên nghiệp & Hiệu quả
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 leading-relaxed">
              Printz cung cấp giải pháp in ấn toàn diện cho doanh nghiệp với quy trình tối ưu,
              giá cả cạnh tranh và dịch vụ hỗ trợ chuyên nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate("/contact")}
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 rounded-2xl font-bold text-lg shadow-xl"
              >
                Liên hệ tư vấn
              </Button>
              <Button
                onClick={() => navigate("/app")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-2xl font-bold text-lg"
              >
                Xem demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Tại sao chọn Printz cho Doanh nghiệp?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Chúng tôi hiểu rõ nhu cầu in ấn của doanh nghiệp và cung cấp giải pháp tối ưu nhất.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card
                key={idx}
                className="p-6 bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Gói dịch vụ Doanh nghiệp
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Chọn gói phù hợp với quy mô và nhu cầu của doanh nghiệp bạn.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <Card
                key={idx}
                className={`p-8 border-2 relative ${
                  plan.popular
                    ? "border-blue-600 shadow-xl scale-105"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                    Phổ biến nhất
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-black text-blue-600 mb-6">{plan.price}</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate("/contact")}
                  className={`w-full py-6 rounded-xl font-bold text-lg ${
                    plan.popular
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900"
                  }`}
                >
                  Liên hệ báo giá
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sẵn sàng bắt đầu với Printz?
          </h2>
          <p className="text-xl text-slate-300 mb-10">
            Đội ngũ của chúng tôi sẽ tư vấn và đề xuất giải pháp tốt nhất cho doanh nghiệp bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/contact")}
              className="bg-white text-slate-900 hover:bg-blue-50 px-8 py-6 rounded-2xl font-bold text-lg"
            >
              Liên hệ ngay
            </Button>
            <Button
              onClick={() => navigate("/trends")}
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-2xl font-bold text-lg"
            >
              Xem case studies
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

