import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import {
  Search,
  Filter,
  CreditCard,
  Shirt,
  ShoppingBag,
  Megaphone,
  FileText,
  Package,
  Award,
  Gift,
} from "lucide-react";

export default function TemplateLibraryPage() {
  const categories = [
    {
      icon: CreditCard,
      title: "Card Visit",
      count: 250,
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shirt,
      title: "Áo thun",
      count: 180,
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: ShoppingBag,
      title: "Túi vải",
      count: 120,
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Megaphone,
      title: "Standee",
      count: 90,
      color: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Tờ rơi",
      count: 200,
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Package,
      title: "Hộp quà",
      count: 75,
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Award,
      title: "Kỷ niệm chương",
      count: 60,
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Gift,
      title: "Quà tặng",
      count: 110,
      color: "from-teal-500 to-cyan-500",
    },
  ];

  const templates = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Mẫu thiết kế ${i + 1}`,
    category: categories[i % categories.length].title,
    image:
      "https://images.unsplash.com/photo-1579642984744-4dd0fe83c38c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNhcmRzJTIwcHJpbnRpbmd8ZW58MXx8fHwxNzYxNzIxODYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    downloads: Math.floor(Math.random() * 1000) + 100,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNDcsMTUxLDIzNCwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Kho mẫu thiết kế
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Hàng nghìn mẫu thiết kế chuyên nghiệp, sẵn sàng tùy chỉnh theo nhu
              cầu của bạn
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm mẫu thiết kế..."
                    className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-200 focus:border-purple-500 outline-none transition-colors"
                  />
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 rounded-full">
                  <Filter className="w-5 h-5 mr-2" />
                  Lọc
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <Button
              variant="outline"
              className="rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50 whitespace-nowrap"
            >
              Tất cả
            </Button>
            {categories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="rounded-full whitespace-nowrap hover:border-purple-200"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {cat.title} ({cat.count})
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-purple-200"
              >
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  <ImageWithFallback
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <Button className="w-full bg-white text-purple-600 hover:bg-blue-50 rounded-full">
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-purple-600 mb-1">
                    {template.category}
                  </div>
                  <h4 className="mb-2">{template.title}</h4>
                  <p className="text-sm text-slate-600">
                    {template.downloads} lượt tải
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              className="px-12 py-6 rounded-full border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              Xem thêm mẫu thiết kế
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
