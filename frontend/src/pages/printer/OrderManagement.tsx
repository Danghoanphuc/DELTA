// src/pages/printer/OrderManagement.tsx (ĐÃ SỬA)
// Sửa lỗi TS6133, TS6192: Bằng cách thêm JSX để sử dụng các import
import { Search, Filter, Download, Eye, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Thêm import Table
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function OrderManagement() {
  // Dữ liệu mẫu (để sử dụng biến 'orders')
  const orders = [
    {
      id: "DH001",
      customer: "Công ty TNHH ABC",
      phone: "0901234567",
      product: "Hộp carton chèn đôi 120x40mm",
      quantity: "1000",
      total: "5,500,000 ₫",
      status: "Đang xử lý",
      date: "25/10/2024",
      deadline: "30/10/2024",
    },
    {
      id: "DH002",
      customer: "Nguyễn Văn B",
      phone: "0912345678",
      product: "Sticker decal trong",
      quantity: "500",
      total: "1,200,000 ₫",
      status: "Đã hoàn thành",
      date: "24/10/2024",
      deadline: "26/10/2024",
    },
    {
      id: "DH003",
      customer: "Shop Hoa Tươi XYZ",
      phone: "0987654321",
      product: "In Card visit 2 mặt",
      quantity: "5",
      total: "250,000 ₫",
      status: "Đã hủy",
      date: "23/10/2024",
      deadline: "25/10/2024",
    },
  ];

  // Hàm helper để lấy màu badge dựa trên status
  const getBadgeVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case "đã hoàn thành":
        return "default"; // 'default' thường là màu primary (xanh)
      case "đang xử lý":
        return "secondary"; // Màu xám
      case "đã hủy":
        return "destructive"; // Màu đỏ
      default:
        return "outline"; // Viền xám
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quản lý đơn hàng
          </h1>
          <p className="text-gray-600">
            Theo dõi và quản lý tất cả các đơn hàng in ấn
          </p>
        </div>

        {/* --- Thêm JSX để sử dụng component --- */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Tất cả đơn hàng</CardTitle>
            {/* Thanh tìm kiếm và bộ lọc */}
            <div className="flex items-center gap-4 mt-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Tìm kiếm đơn hàng (theo mã, SĐT, tên...)"
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                Lọc đơn hàng
              </Button>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                Xuất file
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Bảng dữ liệu */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã ĐH</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hạn chót</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>{order.customer}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      {/* Sử dụng Badge */}
                      <Badge variant={getBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.deadline}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {/* Sử dụng Button và Icons */}
                      <Button variant="ghost" size="icon" title="Xem chi tiết">
                        <Eye size={18} />
                      </Button>
                      <Button variant="ghost" size="icon" title="Xác nhận">
                        <Check size={18} className="text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Hủy đơn">
                        <X size={18} className="text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
