import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";

export function LPCta() {
  return (
    <section className="py-32 bg-white text-center px-4 border-t border-stone-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-5xl md:text-7xl text-stone-900 mb-8 italic">
          Ready to Elevate?
        </h2>
        <p className="text-xl text-stone-500 font-light mb-12 max-w-lg mx-auto">
          Nâng cấp vị thế thương hiệu của bạn với giải pháp in ấn toàn diện từ
          Printz.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Button
            asChild
            className="bg-stone-900 text-white hover:bg-emerald-900 px-12 py-8 text-base tracking-widest uppercase font-bold rounded-none transition-all"
          >
            <Link to="/app">Start Project</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-stone-200 text-stone-900 hover:border-stone-900 px-12 py-8 text-base tracking-widest uppercase font-bold rounded-none transition-all"
          >
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
