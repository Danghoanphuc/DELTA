// SectionNavigation.tsx - Header navigation
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SectionNavigationProps {
  activeSection: number;
  sectionNames: string[];
  sectionsRef: React.MutableRefObject<HTMLElement[]>;
  onSectionClick: (idx: number) => void;
  onContactClick: () => void;
}

export function SectionNavigation({
  activeSection,
  sectionNames,
  sectionsRef,
  onSectionClick,
  onContactClick,
}: SectionNavigationProps) {
  const navigate = useNavigate();

  if (activeSection === 0) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar">
          {/* Back button */}
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">
              Quay lại
            </span>
          </button>

          {/* Section navigation */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            {sectionNames.map((name, idx) => (
              <button
                key={idx}
                onClick={() => onSectionClick(idx)}
                className={`relative px-3 py-2 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  activeSection === idx
                    ? "text-amber-900 font-bold"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {name}
                {/* Active indicator */}
                {activeSection === idx && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                )}
              </button>
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={onContactClick}
            className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            Liên hệ
          </button>
        </div>
      </div>
    </div>
  );
}
