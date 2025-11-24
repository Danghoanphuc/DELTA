import React from "react";

export const CreativeLogo = ({
  className = "w-full h-full",
}: {
  className?: string;
}) => {
  // Path bao ngoài (khung chữ P)
  const containerPath =
    "M0 56.6421C0 53.99 1.05357 51.4464 2.92893 49.5711L49.5711 2.92894C51.4464 1.05357 53.99 0 56.6421 0H105H200C205.523 0 210 4.47715 210 10V105V153.289C210 155.982 208.914 158.561 206.987 160.443L159.164 207.154C157.296 208.978 154.788 210 152.177 210H102.5H10C4.47716 210 0 205.523 0 200V105V56.6421Z";
  
  // Path chữ P bên trong
  const pPath = `M63 59.0515L91.0515 31V59.0515H63ZM96.6621 31H124.7136V59.0515H96.6621ZM130.323 31L158.375 59.0515H130.323V31ZM130.323 67.4669H158.375V95.5184H130.323ZM130.323 98.3235H158.375L130.323 126.375V98.3235ZM96.6621 98.3235H124.7136V126.375H96.6621ZM63 64.6615H91.0515V92.713H63ZM63 98.3235H91.0515V126.375H63ZM63 131.985H91.0515V160.0365H63ZM63 165.647H91.0515L63 193.698V165.647Z`;

  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg
        viewBox="0 0 210 210"
        fill="none"
        className="w-full h-full overflow-visible drop-shadow-2xl animate-float"
      >
        <defs>
          <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" /> {/* blue-500 */}
            <stop offset="50%" stopColor="#06b6d4" /> {/* cyan-500 */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* blue-500 loop */}
          </linearGradient>
          
          {/* Gradient bóng bẩy cho phần Fill */}
          <linearGradient id="fill-shine" x1="0%" y1="0%" x2="0%" y2="100%">
             <stop offset="0%" stopColor="#2563eb" stopOpacity="0.9"/>
             <stop offset="100%" stopColor="#0891b2" stopOpacity="0.9"/>
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Nét vẽ chạy liên tục (Ink Flow Effect) */}
        <path
          d={containerPath}
          stroke="url(#brand-gradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="animate-draw-path opacity-80"
        />
        
        {/* Layer 2: Phần Fill "Thở" bên trong */}
        <path 
            d={containerPath} 
            fill="url(#fill-shine)" 
            className="animate-pulse-slow"
        />

        {/* Layer 3: Chữ P trắng nổi bật */}
        <path
          d={pPath}
          fill="white"
          fillOpacity="0.95"
          className="drop-shadow-sm"
        />
      </svg>

      <style>{`
        /* Hiệu ứng chạy viền như dòng mực in */
        .animate-draw-path {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 3s linear infinite;
        }

        /* Hiệu ứng nhịp thở nhẹ nhàng, sang trọng */
        .animate-pulse-slow {
            animation: pulse-opacity 3s ease-in-out infinite;
        }
        
        /* Hiệu ứng trôi lơ lửng */
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        @keyframes dash {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes pulse-opacity {
          0%, 100% { opacity: 0.1; transform: scale(0.98); }
          50% { opacity: 0.3; transform: scale(1); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};