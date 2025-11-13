import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Search,
  Palette,
  Upload,
  MessageCircle,
  ShoppingCart,
  CreditCard,
  Printer,
  Package,
  Truck,
  CheckCircle,
} from "lucide-react";
import { Header, Footer } from "./components";
import { Link } from "react-router-dom";

export default function ProcessPage() {
  const steps = [
    {
      phase: "Giai đoạn 1",
      title: "Khám phá & Thiết kế",
      description: "Tìm kiếm mẫu thiết kế hoặc tạo mới với sự hỗ trợ của AI",
      icon: Palette,
      color: "from-blue-500 to-cyan-500",
      details: [
        {
          step: "1.1",
          title: "Tìm kiếm & Lựa chọn",
          icon: Search,
          content:
            "Duyệt qua hàng nghìn mẫu thiết kế được phân loại theo danh mục (Card visit, Áo thun, Standee...). Sử dụng bộ lọc thông minh để tìm mẫu phù hợp với phong cách và ngành nghề của bạn.",
        },
        {
          step: "1.2",
          title: "Tùy chỉnh thiết kế",
          icon: Palette,
          content:
            "Sử dụng trình chỉnh sửa trực quan để thay đổi màu sắc, font chữ, logo và nội dung. Hoặc tải lên thiết kế riêng của bạn với định dạng AI, PSD, PDF, hoặc PNG.",
        },
        {
          step: "1.3",
          title: "Tư vấn AI Zin",
          icon: MessageCircle,
          content:
            "Trò chuyện với AI Zin để nhận gợi ý về màu sắc, bố cục và phong cách phù hợp. Zin có thể tự động tạo thiết kế dựa trên mô tả của bạn hoặc cải thiện thiết kế hiện tại.",
        },
      ],
    },
    {
      phase: "Giai đoạn 2",
      title: "Đặt hàng & Thanh toán",
      description: "Chọn thông số sản phẩm và hoàn tất đơn hàng",
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-500",
      details: [
        {
          step: "2.1",
          title: "Chọn thông số",
          icon: Upload,
          content:
            "Lựa chọn số lượng, chất liệu, kích thước và hoàn thiện (phủ bóng, bo góc...). Hệ thống sẽ hiển thị giá cả minh bạch và thời gian giao hàng dự kiến cho từng tùy chọn.",
        },
        {
          step: "2.2",
          title: "So sánh nhà in",
          icon: ShoppingCart,
          content:
            "Xem danh sách các nhà in đủ năng lực thực hiện đơn hàng, được sắp xếp theo giá, đánh giá và thời gian giao hàng. Đọc đánh giá từ khách hàng trước đó để đưa ra lựa chọn tốt nhất.",
        },
        {
          step: "2.3",
          title: "Thanh toán an toàn",
          icon: CreditCard,
          content:
            "Thanh toán qua nhiều hình thức: chuyển khoản, ví điện tử, thẻ tín dụng. Hệ thống bảo mật SSL đảm bảo thông tin của bạn được bảo vệ tuyệt đối.",
        },
      ],
    },
    {
      phase: "Giai đoạn 3",
      title: "In ấn & Kiểm tra",
      description: "Nhà in thực hiện và kiểm soát chất lượng",
      icon: Printer,
      color: "from-green-500 to-emerald-500",
      details: [
        {
          step: "3.1",
          title: "Xác nhận & Sản xuất",
          icon: Printer,
          content:
            "Nhà in xác nhận đơn hàng và bắt đầu quá trình in ấn. Bạn nhận được thông báo qua email và SMS khi đơn hàng được tiếp nhận và bắt đầu sản xuất.",
        },
        {
          step: "3.2",
          title: "Kiểm tra chất lượng",
          icon: CheckCircle,
          content:
            "Đội ngũ QC của nhà in kiểm tra kỹ lưỡng từng sản phẩm: màu sắc, độ sắc nét, hoàn thiện. Ảnh mẫu sẽ được gửi cho bạn xác nhận trước khi in số lượng lớn (với đơn hàng > 500 sp).",
        },
        {
          step: "3.3",
          title: "Đóng gói chuyên nghiệp",
          icon: Package,
          content:
            "Sản phẩm được đóng gói cẩn thận, chống ẩm và va đập. Mã vận đơn được gửi ngay cho bạn để theo dõi hành trình giao hàng.",
        },
      ],
    },
    {
      phase: "Giai đoạn 4",
      title: "Giao hàng & Hỗ trợ",
      description: "Nhận sản phẩm và dịch vụ hậu mãi",
      icon: Truck,
      color: "from-orange-500 to-red-500",
      details: [
        {
          step: "4.1",
          title: "Vận chuyển nhanh chóng",
          icon: Truck,
          content:
            "Đối tác vận chuyển uy tín (Grab, Giao Hàng Nhanh, Viettel Post) giao hàng tận nơi. Thời gian giao hàng từ 1-7 ngày tùy theo vị trí và loại sản phẩm.",
        },
        {
          step: "4.2",
          title: "Kiểm tra & Nhận hàng",
          icon: CheckCircle,
          content:
            "Kiểm tra kỹ sản phẩm ngay khi nhận hàng. Nếu có bất kỳ vấn đề nào về chất lượng, hãy chụp ảnh và liên hệ ngay với chúng tôi trong vòng 24h.",
        },
        {
          step: "4.3",
          title: "Hỗ trợ sau bán",
          icon: MessageCircle,
          content:
            "Đội ngũ hỗ trợ sẵn sàng 24/7 qua chat, email hoặc hotline. Chính sách đổi trả trong 7 ngày nếu sản phẩm có lỗi từ nhà sản xuất.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTUxLDIzNCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="mb-6">
              <span className="block">Quy trình làm việc</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Đơn giản & Minh bạch
              </span>
            </h1>
            <p className="text-xl text-slate-600">
              Từ ý tưởng đến sản phẩm hoàn thiện chỉ trong 4 bước đơn giản.
              Printz.vn đồng hành cùng bạn trong suốt hành trình.
            </p>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm text-purple-600 mb-2">
                    {step.phase}
                  </div>
                  <h4 className="mb-3">{step.title}</h4>
                  <p className="text-slate-600">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Process */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {steps.map((step, stepIndex) => {
              const PhaseIcon = step.icon;
              return (
                <div key={stepIndex}>
                  {/* Phase Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <PhaseIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-purple-600 mb-1">
                        {step.phase}
                      </div>
                      <h2>{step.title}</h2>
                    </div>
                  </div>

                  {/* Detailed Steps */}
                  <div className="space-y-6">
                    {step.details.map((detail, detailIndex) => {
                      const DetailIcon = detail.icon;
                      return (
                        <Card
                          key={detailIndex}
                          className="p-8 hover:shadow-xl transition-shadow border-2 border-transparent hover:border-purple-200"
                        >
                          <div className="flex gap-6">
                            <div className="flex-shrink-0">
                              <div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center`}
                              >
                                <DetailIcon className="w-7 h-7 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">
                                  Bước {detail.step}
                                </span>
                                <h4>{detail.title}</h4>
                              </div>
                              <p className="text-slate-600 mb-4">
                                {detail.content}
                              </p>

                              {/* Summary Box */}
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm">
                                      <span className="text-purple-600">
                                        Tóm tắt:{" "}
                                      </span>
                                      {detail.step === "1.1" &&
                                        "Tìm kiếm mẫu thiết kế phù hợp từ kho mẫu đa dạng với bộ lọc thông minh."}
                                      {detail.step === "1.2" &&
                                        "Tùy chỉnh thiết kế theo ý muốn hoặc tải lên file thiết kế riêng của bạn."}
                                      {detail.step === "1.3" &&
                                        "Nhận tư vấn từ AI Zin để tối ưu thiết kế và tiết kiệm thời gian."}
                                      {detail.step === "2.1" &&
                                        "Lựa chọn thông số sản phẩm với giá cả và thời gian minh bạch."}
                                      {detail.step === "2.2" &&
                                        "So sánh nhiều nhà in để chọn phương án tốt nhất cho nhu cầu."}
                                      {detail.step === "2.3" &&
                                        "Thanh toán an toàn qua nhiều phương thức được bảo mật tối đa."}
                                      {detail.step === "3.1" &&
                                        "Nhà in xác nhận và bắt đầu sản xuất với thông báo theo dõi liên tục."}
                                      {detail.step === "3.2" &&
                                        "Kiểm tra chất lượng nghiêm ngặt đảm bảo sản phẩm hoàn hảo."}
                                      {detail.step === "3.3" &&
                                        "Đóng gói chuyên nghiệp và cung cấp mã vận đơn để theo dõi."}
                                      {detail.step === "4.1" &&
                                        "Giao hàng nhanh chóng qua đối tác vận chuyển uy tín."}
                                      {detail.step === "4.2" &&
                                        "Kiểm tra sản phẩm kỹ lưỡng ngay khi nhận hàng."}
                                      {detail.step === "4.3" &&
                                        "Hỗ trợ 24/7 và chính sách đổi trả linh hoạt trong 7 ngày."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Our Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Tại sao chọn quy trình của Printz.vn?</h2>
            <p className="text-slate-600">
              Những ưu điểm vượt trội mà chúng tôi mang lại
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h4 className="mb-3">Minh bạch 100%</h4>
              <p className="text-slate-600">
                Giá cả rõ ràng, quy trình công khai. Bạn luôn biết đơn hàng của
                mình đang ở đâu và được xử lý như thế nào.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
                <Printer className="w-8 h-8 text-white" />
              </div>
              <h4 className="mb-3">Chất lượng đảm bảo</h4>
              <p className="text-slate-600">
                Kiểm soát chất lượng chặt chẽ ở từng khâu. Đối tác nhà in được
                tuyển chọn kỹ lưỡng với tiêu chuẩn cao.
              </p>
            </Card>

            <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-200">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h4 className="mb-3">Nhanh chóng & Tiện lợi</h4>
              <p className="text-slate-600">
                Tiết kiệm thời gian với quy trình tối ưu. Từ đặt hàng đến nhận
                sản phẩm chỉ trong vài ngày.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-white">
            Sẵn sàng trải nghiệm quy trình đơn giản?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bắt đầu đặt hàng ngay hôm nay và cảm nhận sự khác biệt
          </p>
          <Button
            asChild
            className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-6 rounded-full"
          >
            <Link to="/app">Bắt đầu ngay</Link>
          </Button>
        </div>
      </section>
      <Footer />
    </div>
  );
}
