import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { Header, Footer } from "./components";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      <Header />

      {/* HEADER KHÔNG GIAN LỚN */}
      <section className="pt-40 pb-20 px-4 border-b border-stone-200">
        <div className="max-w-[1440px] mx-auto">
          <h1 className="font-serif text-6xl md:text-8xl text-stone-900 leading-none mb-6 italic">
            Get in touch.
          </h1>
          <p className="text-xl text-stone-500 font-light max-w-2xl">
            Bạn cần tư vấn giải pháp in ấn cho doanh nghiệp? Đội ngũ Printz sẵn
            sàng hỗ trợ.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto grid md:grid-cols-2 min-h-[800px]">
        {/* LEFT: INFO - DARK MODE */}
        <div className="bg-stone-900 text-white p-12 md:p-20 flex flex-col justify-between border-r border-stone-800">
          <div>
            <span className="font-mono text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase mb-12 block">
              Headquarters
            </span>

            <div className="space-y-12">
              <div className="group">
                <p className="text-stone-500 text-sm mb-2 uppercase tracking-widest">
                  Office
                </p>
                <div className="flex items-start gap-4">
                  <MapPin
                    className="w-6 h-6 text-white mt-1"
                    strokeWidth={1.5}
                  />
                  <p className="text-2xl font-serif leading-relaxed">
                    TechHub Building, <br />
                    123 Nguyen Hue, Dist 1,
                    <br />
                    Ho Chi Minh City, VN
                  </p>
                </div>
              </div>

              <div className="group">
                <p className="text-stone-500 text-sm mb-2 uppercase tracking-widest">
                  Contact
                </p>
                <div className="space-y-4">
                  <a
                    href="tel:1900xxxx"
                    className="flex items-center gap-4 text-2xl font-serif hover:text-emerald-400 transition-colors"
                  >
                    <Phone className="w-6 h-6" strokeWidth={1.5} /> 1900 xxxx
                  </a>
                  <a
                    href="mailto:b2b@printz.vn"
                    className="flex items-center gap-4 text-2xl font-serif hover:text-emerald-400 transition-colors"
                  >
                    <Mail className="w-6 h-6" strokeWidth={1.5} /> b2b@printz.vn
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-stone-800">
            <p className="text-stone-500 text-sm mb-4">Follow Us</p>
            <div className="flex gap-6 font-mono text-sm">
              <a href="#" className="hover:text-emerald-400 uppercase">
                Facebook
              </a>
              <a href="#" className="hover:text-emerald-400 uppercase">
                LinkedIn
              </a>
              <a href="#" className="hover:text-emerald-400 uppercase">
                Behance
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM - CLEAN & SHARP */}
        <div className="bg-white p-12 md:p-20">
          <form className="space-y-8 max-w-lg">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold tracking-widest text-stone-500">
                  Full Name
                </Label>
                <Input
                  placeholder="Ex: Nguyen Van A"
                  className="rounded-none border-0 border-b-2 border-stone-200 px-0 py-4 text-xl focus-visible:ring-0 focus-visible:border-stone-900 bg-transparent placeholder:text-stone-300 font-serif"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold tracking-widest text-stone-500">
                  Work Email
                </Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  className="rounded-none border-0 border-b-2 border-stone-200 px-0 py-4 text-xl focus-visible:ring-0 focus-visible:border-stone-900 bg-transparent placeholder:text-stone-300 font-serif"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase text-xs font-bold tracking-widest text-stone-500">
                  Message
                </Label>
                <Textarea
                  placeholder="Tell us about your project..."
                  className="rounded-none border-0 border-b-2 border-stone-200 px-0 py-4 text-xl min-h-[150px] resize-none focus-visible:ring-0 focus-visible:border-stone-900 bg-transparent placeholder:text-stone-300 font-serif"
                />
              </div>
            </div>

            <div className="pt-8">
              <Button className="w-full bg-stone-900 text-white hover:bg-emerald-900 rounded-none py-8 text-base uppercase tracking-widest font-bold">
                Send Inquiry <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
