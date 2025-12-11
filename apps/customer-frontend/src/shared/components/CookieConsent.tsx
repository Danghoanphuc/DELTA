import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookieConsent");
    if (!hasAccepted) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white border-t-2 border-stone-200 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* Content */}
            <div className="flex-1 flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-stone-900 mb-1">
                  Chúng tôi sử dụng cookies
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn,
                  phân tích lưu lượng truy cập và cá nhân hóa nội dung. Bằng
                  cách nhấp "Chấp nhận", bạn đồng ý với việc sử dụng cookies của
                  chúng tôi.{" "}
                  <Link
                    to="/policy?tab=privacy"
                    className="text-emerald-600 hover:text-emerald-700 underline font-medium"
                  >
                    Tìm hiểu thêm
                  </Link>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Từ chối
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                Chấp nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
