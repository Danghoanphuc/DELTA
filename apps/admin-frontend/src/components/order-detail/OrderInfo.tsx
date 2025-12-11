// src/components/order-detail/OrderInfo.tsx
// ✅ SOLID: Single Responsibility - Display order information

interface OrderInfoProps {
  order: any;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function OrderInfo({ order }: OrderInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Thông tin đơn hàng</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Tổ chức</p>
          <p className="font-medium">{order.organization?.businessName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Người tạo</p>
          <p className="font-medium">{order.createdBy?.displayName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Ngày tạo</p>
          <p className="font-medium">{formatDate(order.createdAt)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Số người nhận</p>
          <p className="font-medium">{order.totalRecipients}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Tổng tiền</p>
          <p className="font-medium text-orange-600">
            {formatCurrency(order.pricing?.total || 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Swag Pack</p>
          <p className="font-medium">{order.swagPack?.name}</p>
        </div>
      </div>
    </div>
  );
}
