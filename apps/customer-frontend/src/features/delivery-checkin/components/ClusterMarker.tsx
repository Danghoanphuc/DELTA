// apps/customer-frontend/src/features/delivery-checkin/components/ClusterMarker.tsx
/**
 * Cluster Marker Component
 * Displays a cluster of check-ins on the map
 *
 * Requirements: 12.2
 */

interface ClusterMarkerProps {
  count: number;
  onClick?: () => void;
}

export function ClusterMarker({ count, onClick }: ClusterMarkerProps) {
  // Determine size based on count
  const getSize = () => {
    if (count < 10) return "w-10 h-10 text-sm";
    if (count < 50) return "w-12 h-12 text-base";
    if (count < 100) return "w-14 h-14 text-lg";
    return "w-16 h-16 text-xl";
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getSize()}
        bg-orange-500 hover:bg-orange-600
        text-white font-bold
        rounded-full
        flex items-center justify-center
        shadow-lg
        border-4 border-white
        cursor-pointer
        transition-all duration-200
        hover:scale-110
      `}
      title={`${count} điểm giao hàng - Click để phóng to`}
    >
      {count}
    </button>
  );
}
