import { Header, Footer } from "./components";
import { ImageWithFallback } from "@/features/figma/ImageWithFallback";
import { Button } from "@/shared/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function TrendsPage() {
  const featuredPost = {
    category: "Deep Dive",
    title:
      "Sự trở lại của kỹ thuật in dập nổi (Letterpress) trong kỷ nguyên số.",
    excerpt:
      "Khi thế giới ngày càng phẳng, con người càng khao khát những điểm chạm vật lý. Letterpress không chỉ là in ấn, nó là điêu khắc trên giấy.",
    image:
      "https://images.unsplash.com/photo-1594901579895-8b29c9cc298a?q=80&w=2000&auto=format&fit=crop",
    date: "OCT 2025",
  };

  const posts = [
    {
      category: "Material",
      title: "Giấy mỹ thuật: Cuộc chơi của những gã khổng lồ Luxury.",
      image:
        "https://images.unsplash.com/photo-1586075010923-2dd45eeed8bd?q=80&w=800",
    },
    {
      category: "Technique",
      title: "Foil Stamping: Ép kim sao cho sang mà không sến?",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
    },
    {
      category: "Branding",
      title: "Minimalism: Tại sao khoảng trắng lại đắt tiền?",
      image:
        "https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=800",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* TITLE */}
      <section className="pt-40 pb-12 px-4 border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto flex items-end justify-between">
          <h1 className="font-serif text-8xl md:text-[10rem] text-stone-900 leading-none tracking-tighter opacity-10">
            INSIGHTS
          </h1>
          <p className="hidden md:block text-right font-mono text-xs uppercase tracking-widest text-stone-500 mb-4">
            Curated by Printz Editorial
            <br />
            EST. 2025
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 py-16">
        {/* FEATURED POST */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24 cursor-pointer group">
          <div className="overflow-hidden">
            <ImageWithFallback
              src={featuredPost.image}
              className="w-full h-[600px] object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6 border-b border-stone-200 pb-4">
              <span className="font-mono text-xs font-bold text-emerald-800 uppercase tracking-widest">
                {featuredPost.category}
              </span>
              <span className="font-mono text-xs text-stone-400 uppercase">
                {featuredPost.date}
              </span>
            </div>
            <h2 className="font-serif text-5xl md:text-6xl text-stone-900 leading-tight mb-6 group-hover:underline decoration-1 underline-offset-8">
              {featuredPost.title}
            </h2>
            <p className="text-xl text-stone-500 font-light leading-relaxed mb-8">
              {featuredPost.excerpt}
            </p>
            <Button
              variant="link"
              className="w-fit p-0 text-stone-900 font-bold uppercase tracking-widest hover:text-emerald-800"
            >
              Read Article <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* POST GRID */}
        <div className="grid md:grid-cols-3 gap-8 border-t border-stone-200 pt-16">
          {posts.map((post, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="overflow-hidden mb-6 h-[300px]">
                <ImageWithFallback
                  src={post.image}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="font-mono text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 block">
                {post.category}
              </span>
              <h3 className="font-serif text-2xl text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors">
                {post.title}
              </h3>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
