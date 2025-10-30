"use client";

import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Hotline",
      info: "1900 xxxx",
      subInfo: "Hỗ trợ 24/7",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Mail,
      title: "Email",
      info: "support@printz.vn",
      subInfo: "Phản hồi trong 2h",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: MapPin,
      title: "Văn phòng",
      info: "123 Nguyễn Huệ, Q.1, TP.HCM",
      subInfo: "T2-T6: 8:00 - 18:00",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      info: "Chat trực tuyến",
      subInfo: "Phản hồi ngay lập tức",
      color: "from-orange-500 to-red-500",
    },
  ];

  const socialChannels = [
    {
      icon: Facebook,
      name: "Facebook",
      handle: "@printz.vn",
      link: "#",
      color: "hover:bg-blue-600",
    },
    {
      icon: Instagram,
      name: "Instagram",
      handle: "@printz.vn",
      link: "#",
      color: "hover:bg-pink-600",
    },
    {
      icon: MessageCircle,
      name: "Zalo",
      handle: "1900 xxxx",
      link: "#",
      color: "hover:bg-sky-600",
    },
  ];

  const offices = [
    {
      city: "Hồ Chí Minh",
      address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      phone: "028 1234 5678",
      hours: "T2-T6: 8:00 - 18:00, T7: 8:00 - 12:00",
    },
    {
      city: "Hà Nội",
      address: "456 Hoàn Kiếm, Quận Hoàn Kiếm, Hà Nội",
      phone: "024 1234 5678",
      hours: "T2-T6: 8:00 - 18:00, T7: 8:00 - 12:00",
    },
    {
      city: "Đà Nẵng",
      address: "789 Trần Phú, Quận Hải Châu, Đà Nẵng",
      phone: "0236 1234 567",
      hours: "T2-T6: 8:00 - 18:00, T7: 8:00 - 12:00",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTUxLDIzNCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="mb-6">
              <span className="block">Liên hệ với</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Printz.vn
              </span>
            </h1>
            <p className="text-xl text-slate-600">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông
              tin hoặc liên hệ trực tiếp qua các kênh dưới đây.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="mb-2">{info.title}</h4>
                  <p className="text-slate-900 mb-1">{info.info}</p>
                  <p className="text-sm text-slate-600">{info.subInfo}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <Card className="p-8 border-2 border-transparent hover:border-purple-200 transition-colors">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Nguyễn Văn A"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="email@example.com"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="0912 345 678"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Tiêu đề *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      placeholder="Tôi muốn hỏi về..."
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Nội dung *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                      required
                      rows={6}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 rounded-full"
                  >
                    Gửi tin nhắn
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </Card>
            </div>

            {/* Map & Info */}
            <div>
              <h2 className="mb-6">Văn phòng của chúng tôi</h2>

              {/* Map Placeholder */}
              <Card className="p-4 mb-6 overflow-hidden">
                <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                    <p className="text-slate-600">Bản đồ vị trí văn phòng</p>
                  </div>
                </div>
              </Card>

              {/* Office Locations */}
              <div className="space-y-4">
                {offices.map((office, index) => (
                  <Card
                    key={index}
                    className="p-6 border-2 border-transparent hover:border-purple-200 transition-colors"
                  >
                    <h4 className="mb-3">{office.city}</h4>
                    <div className="space-y-2 text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600" />
                        <p>{office.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 flex-shrink-0 text-purple-600" />
                        <p>{office.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 flex-shrink-0 text-purple-600" />
                        <p>{office.hours}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Channels */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Kết nối với chúng tôi</h2>
            <p className="text-slate-600">
              Theo dõi và liên hệ qua các kênh mạng xã hội
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {socialChannels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <a key={index} href={channel.link}>
                  <Card
                    className={`p-8 text-center cursor-pointer transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 group`}
                  >
                    <div
                      className={`w-16 h-16 rounded-full bg-slate-100 ${channel.color} flex items-center justify-center mx-auto mb-4 transition-colors`}
                    >
                      <Icon className="w-8 h-8 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="mb-2">{channel.name}</h4>
                    <p className="text-slate-600">{channel.handle}</p>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Câu hỏi thường gặp</h2>
            <p className="text-slate-600">
              Một số thắc mắc phổ biến từ khách hàng
            </p>
          </div>

          <div className="space-y-4">
            <Card className="p-6 border-2 border-transparent hover:border-purple-200 transition-colors">
              <h5 className="mb-2">Thời gian xử lý đơn hàng là bao lâu?</h5>
              <p className="text-slate-600">
                Thời gian xử lý phụ thuộc vào loại sản phẩm và số lượng. Thông
                thường từ 1-7 ngày làm việc.
              </p>
            </Card>

            <Card className="p-6 border-2 border-transparent hover:border-purple-200 transition-colors">
              <h5 className="mb-2">Tôi có thể hủy đơn hàng không?</h5>
              <p className="text-slate-600">
                Bạn có thể hủy đơn hàng miễn phí trong vòng 24h sau khi đặt
                hàng, trước khi nhà in bắt đầu sản xuất.
              </p>
            </Card>

            <Card className="p-6 border-2 border-transparent hover:border-purple-200 transition-colors">
              <h5 className="mb-2">Chính sách đổi trả như thế nào?</h5>
              <p className="text-slate-600">
                Chúng tôi hỗ trợ đổi trả trong 7 ngày nếu sản phẩm có lỗi từ nhà
                sản xuất. Chi tiết xem tại trang Chính sách.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6 text-white">Cần hỗ trợ ngay?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn
            24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-purple-600 hover:bg-blue-50 px-8 py-6 rounded-full">
              <Phone className="mr-2 w-5 h-5" />
              Gọi ngay: 1900 xxxx
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-6 rounded-full"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Chat trực tuyến
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
