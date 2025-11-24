import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Search, Filter, ArrowRight, Sparkles, SlidersHorizontal } from "lucide-react";
import { Header, Footer } from "./components";

export default function TemplateLibraryPage() {
  const categories = [
    "Tất cả", "Card Visit", "Bao bì", "Túi vải", "Standee", "Tờ rơi", "Tem nhãn", "Quà tặng"
  ];

  const templates = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Mẫu thiết kế Corporate ${i + 1}`,
    category: categories[i % (categories.length - 1) + 1],
    image: `https://source.unsplash.com/random/800x600?print,design&sig=${i}`,
    specs: "In Offset • C300",
    downloads: Math.floor(Math.random() * 1000) + 100,
  }));

  return (
    <div className="min-h-screen bg-paper-texture">
      <Header />
      {/* 1. HEADER: CLEAN & TECH */}
      <section className="relative pt-24 pb-12 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-grid-blue opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4">
              <Sparkles className="w-3 h-3" />
              Thư viện 10.000+ Mẫu
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Tìm kiếm <span className="text-blue-600">Cảm hứng</span> in ấn.
            </h1>
            <p className="text-lg text-slate-600">
              Khám phá các mẫu thiết kế chuẩn công nghiệp, sẵn sàng tùy biến và in ấn ngay lập tức.
            </p>
          </div>

          {/* SEARCH BAR HIỆN ĐẠI */}
          <div className="max-w-2xl mx-auto relative group">
             <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
             <div className="relative flex bg-white rounded-2xl shadow-lg shadow-blue-900/5 p-2 border border-slate-100 items-center">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input 
                  type="text" 
                  placeholder="Bạn đang tìm mẫu gì? (VD: Card visit công nghệ...)" 
                  className="flex-1 px-4 py-3 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                />
                <Button className="bg-slate-900 text-white hover:bg-blue-600 rounded-xl px-6">
                  Tìm kiếm
                </Button>
             </div>
          </div>
        </div>
      </section>

      {/* 2. FILTERS & GRID */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {categories.map((cat, index) => (
                <button
                  key={index}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    index === 0
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Button variant="outline" className="hidden md:flex gap-2 rounded-xl border-slate-200">
               <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
            </Button>
          </div>

          {/* Templates Grid - Style "Specimen" */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {templates.map((template) => (
              <div 
                key={template.id} 
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Image Area */}
                <div className="aspect-[3/4] bg-slate-100 relative overflow-hidden">
                   <ImageWithFallback 
                      src="https://images.unsplash.com/photo-1626785774583-b61d2830d309?q=80&w=600&auto=format&fit=crop" 
                      alt={template.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   />
                   {/* Overlay Action */}
                   <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Button className="bg-white text-slate-900 hover:bg-blue-50 hover:text-blue-600 rounded-full font-bold shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-all">
                         Xem chi tiết
                      </Button>
                   </div>
                </div>

                {/* Info Area */}
                <div className="p-4">
                   <div className="flex items-start justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {template.category}
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        ⬇ {template.downloads}
                      </span>
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">{template.title}</h3>
                   <p className="text-xs text-slate-500 font-mono border-t border-slate-100 pt-2 mt-2">
                     {template.specs}
                   </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button variant="outline" className="px-8 py-6 rounded-2xl border-2 text-base hover:bg-slate-50">
              Tải thêm mẫu thiết kế
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}