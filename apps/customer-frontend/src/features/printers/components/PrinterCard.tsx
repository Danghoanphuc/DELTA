// apps/customer-frontend/src/features/printers/components/PrinterCard.tsx
// ✅ SOCIAL: Printer card with "Chat with Printer" button

import { Link } from "react-router-dom";
import { useChatWithPrinter } from "../../chat/hooks/useChatWithPrinter";

interface PrinterCardProps {
  printer: {
    _id: string;
    businessName: string;
    avatarUrl?: string;
    rating?: number;
    location?: string;
    description?: string;
  };
  className?: string;
}

export const PrinterCard: React.FC<PrinterCardProps> = ({
  printer,
  className = "",
}) => {
  const { startChatWithPrinter, isLoading } = useChatWithPrinter();

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${className}`}
    >
      <div className="flex items-start gap-4">
        {/* Printer Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {printer.avatarUrl ? (
            <img
              src={printer.avatarUrl}
              alt={printer.businessName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl">
              {printer.businessName[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Printer Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/printers/${printer._id}`}
            className="font-bold text-lg text-gray-900 hover:text-blue-600 transition"
          >
            {printer.businessName}
          </Link>

          {printer.rating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500">★</span>
              <span className="text-sm text-gray-700">
                {printer.rating.toFixed(1)}
              </span>
            </div>
          )}

          {printer.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {printer.location}
            </p>
          )}

          {printer.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {printer.description}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <Link
          to={`/printers/${printer._id}`}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-center font-medium"
        >
          Xem chi tiết
        </Link>
        <button
          onClick={() => startChatWithPrinter(printer._id)}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
        >
          {isLoading ? (
            "Đang mở..."
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Nhắn tin
            </>
          )}
        </button>
      </div>
    </div>
  );
};

