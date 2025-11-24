import { Cpu, Zap } from "lucide-react";

// --- BỘ SƯU TẬP LOGO MÁY IN (Inline SVG Components) ---
// Chúng ta định nghĩa logo như một component để dễ tái sử dụng và truyền class style

const LogoHeidelberg = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M2.209 0h4.418v24H2.209V0zM17.373 0h4.418v24h-4.418V0zM6.627 10.8h10.746v2.4H6.627v-2.4z" />
  </svg>
);

const LogoHP = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1.566 5.688L8.91 16.313h2.074l1.524-8.625H10.434zm3.21 0L12.12 16.313h2.075l1.523-8.625h-2.074z" />
  </svg>
);

const LogoCanon = ({ className }: { className?: string }) => (
  <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
    <path d="M21.714 10.14c-1.029 0-1.608.908-1.608 1.812 0 .634.277 1.427 1.253 1.427.884 0 1.182-.638 1.253-1.123h1.359c-.153 1.342-1.327 2.348-2.699 2.348-1.594 0-2.743-1.202-2.743-2.814 0-1.666 1.248-2.921 2.812-2.921 1.408 0 2.511 1.014 2.658 2.336h-1.362c-.105-.519-.464-1.065-1.149-1.065H21.714zm-7.451-1.187L13.2 13.025l-1.026-4.072h-1.666l1.774 5.777h1.753l1.699-5.777h-1.471zM6.057 8.953c-1.66 0-2.851 1.241-2.851 2.941 0 1.637 1.148 2.786 2.78 2.786.724 0 1.477-.232 1.95-.735l-.03.64h1.421V9.051H8.035l.044.644c-.482-.485-1.26-.742-2.022-.742zm8.328 5.728h1.49V9.051h-1.49v5.63zm-12.104 0h1.49V9.051H2.281v5.63zm3.742-.99c.81 0 1.341-.667 1.341-1.787 0-1.148-.516-1.777-1.368-1.777-.873 0-1.383.667-1.383 1.787 0 1.084.512 1.777 1.41 1.777z" />
  </svg>
);

const LogoKonica = ({ className }: { className?: string }) => (
   <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5h-3v-9h3v9zm4.5 0h-3v-5h3v5zm0-6.5h-3v-2.5h3v2.5z"/>
   </svg>
)

const LogoFujifilm = ({ className }: { className?: string }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M10.2 7.8V5.4H7.8V3h9v2.4h-2.4v2.4h4.2v2.4h-4.2v4.8h-2.4v-4.8H7.8v4.8H5.4v-4.8h4.8zM13.8 16.2h-3.6v2.4h3.6v-2.4zM7.8 16.2H5.4v2.4h2.4v-2.4zM18.6 16.2h-2.4v2.4h2.4v-2.4zM7.8 19.8H5.4v1.2h2.4v-1.2zM13.8 19.8h-3.6v1.2h3.6v-1.2zM18.6 19.8h-2.4v1.2h2.4v-1.2z"/>
    </svg>
)

const LogoRicoh = ({ className }: { className?: string }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M4.5 4.5h15v15h-15v-15zm12 12v-9h-9v9h9zm-4.5-2.25h-3v-4.5h3v4.5z"/>
    </svg>
)

const LogoKomori = ({ className }: { className?: string }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
)

const LogoKodak = ({ className }: { className?: string }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}>
        <path d="M10.5 4.5H4.5v15h6v-15zm9 0h-2.25l-4.5 7.5 4.5 7.5h2.25L15 12l4.5-7.5z"/>
    </svg>
)


// --- COMPONENT CHÍNH ---

export function LPSocialProof() {
  const partners = [
    { name: "HEIDELBERG", type: "OFFSET XL", Logo: LogoHeidelberg },
    { name: "HP INDIGO", type: "DIGITAL PRESS", Logo: LogoHP },
    { name: "CANON", type: "IMAGEPRESS", Logo: LogoCanon },
    // Thêm các hãng khác vào đây...
  ];

  const duplicatedPartners = [...partners, ...partners, ...partners, ...partners];

  return (
    <section className="bg-white border-b border-slate-100 py-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center gap-8">
           {/* Label Tĩnh */}
           <div className="hidden md:flex items-center gap-2 text-slate-400 font-medium whitespace-nowrap pr-8 border-r border-slate-100">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Powering by</span>
           </div>

           {/* Marquee */}
           <div className="flex-1 overflow-hidden relative mask-linear-fade">
              <div 
                className="flex w-max animate-marquee items-center gap-16"
                style={{ animationDuration: "50s" }}
              >
                {duplicatedPartners.map((partner, index) => {
                  const LogoComponent = partner.Logo;
                  return (
                    <div key={index} className="flex items-center gap-3 group cursor-default opacity-50 hover:opacity-100 transition-opacity duration-300">
                      <LogoComponent className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">{partner.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{partner.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>
      </div>
      
      {/* CSS Mask để làm mờ 2 bên băng chuyền */}
      <style>{`.mask-linear-fade { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }`}</style>
    </section>
  );
}