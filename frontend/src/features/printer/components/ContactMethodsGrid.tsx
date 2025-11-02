// src/components/printer/ContactMethodsGrid.tsx (COMPONENT MỚI)
import { MessageCircle, Phone, Mail } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

export function ContactMethodsGrid() {
  const contactMethods = [
    {
      icon: MessageCircle,
      title: "Chat trực tuyến",
      desc: "Trò chuyện ngay với hỗ trợ viên (Phản hồi trong 2 phút)",
      button: "Bắt đầu chat",
      color: "blue" as const,
    },
    {
      icon: Phone,
      title: "Gọi Hotline",
      desc: "1900 1234 (Phản hồi ngay lập tức, 24/7)",
      button: "Gọi ngay",
      color: "green" as const,
    },
    {
      icon: Mail,
      title: "Gửi Email",
      desc: "hotro@printz.vn (Phản hồi trong 24 giờ)",
      button: "Gửi email",
      color: "gray" as const,
    },
  ];

  const getColorClasses = (color: "blue" | "green" | "gray") => {
    const colorMap = {
      blue: {
        button: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: "text-blue-500",
      },
      green: {
        button: "bg-green-600 hover:bg-green-700 text-white",
        icon: "text-green-500",
      },
      gray: {
        button: "bg-gray-600 hover:bg-gray-700 text-white",
        icon: "text-gray-500",
      },
    };
    return colorMap[color];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {contactMethods.map((method) => {
        const colors = getColorClasses(method.color);
        return (
          <Card key={method.title} className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-medium">
                {method.title}
              </CardTitle>
              <method.icon className={`w-5 h-5 ${colors.icon}`} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{method.desc}</p>
              <Button className={`w-full ${colors.button}`}>
                {method.button}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
