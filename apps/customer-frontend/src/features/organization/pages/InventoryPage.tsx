// src/features/organization/pages/InventoryPage.tsx
// ✅ SOLID Refactored - B2B Organization Inventory Management

import { useState } from "react";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Warehouse,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { useInventory } from "../hooks";

const STATUS_COLORS: Record<string, string> = {
  in_stock: "bg-green-100 text-green-700",
  low_stock: "bg-yellow-100 text-yellow-700",
  out_of_stock: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  in_stock: "Còn hàng",
  low_stock: "Sắp hết",
  out_of_stock: "Hết hàng",
};

export function InventoryPage() {
  const {
    items,
    stats,
    isLoading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    updateQuantity,
    removeItem,
    refetch,
  } = useInventory();

  // Modal state
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantityUpdate, setQuantityUpdate] = useState({
    quantity: 0,
    operation: "add",
  });

  // Open update modal
  const openUpdateModal = (item: any) => {
    setSelectedItem(item);
    setQuantityUpdate({ quantity: 0, operation: "add" });
    setShowUpdateModal(true);
  };

  // Handle update quantity
  const handleUpdateQuantity = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    const success = await updateQuantity(
      selectedItem._id,
      quantityUpdate.quantity,
      quantityUpdate.operation
    );
    setIsSubmitting(false);

    if (success) {
      setShowUpdateModal(false);
      setSelectedItem(null);
    }
  };

  // Handle remove item
  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi kho?")) return;
    await removeItem(itemId);
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">
              Tồn kho
            </h1>
            <p className="text-[#57534E]">
              Quản lý hàng hóa lưu kho tại Printz
            </p>
          </div>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Tổng SKU</p>
                <h3 className="text-xl font-bold">{stats?.totalSkus || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Warehouse className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Tổng số lượng</p>
                <h3 className="text-xl font-bold">
                  {stats?.totalQuantity || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Giá trị</p>
                <h3 className="text-xl font-bold">
                  {formatCurrency(stats?.totalValue || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Sắp hết</p>
                <h3 className="text-xl font-bold">
                  {stats?.lowStockCount || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-[#78716C]">Hết hàng</p>
                <h3 className="text-xl font-bold">
                  {stats?.outOfStockCount || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <Input
                  placeholder="Tìm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="in_stock">Còn hàng</SelectItem>
                  <SelectItem value="low_stock">Sắp hết</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Inventory List */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
          <CardHeader>
            <CardTitle>Danh sách hàng hóa</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#C63321]" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-[#78716C]">
                <Package className="w-16 h-16 mx-auto mb-4 text-[#E5E3DC]" />
                <p className="text-lg font-medium mb-2">Chưa có hàng hóa nào</p>
                <p className="text-sm mb-6">
                  Đặt hàng với dịch vụ lưu kho để bắt đầu quản lý tồn kho
                </p>
                <Button className="bg-[#C63321] hover:bg-[#A82A1A]">
                  Tìm hiểu dịch vụ lưu kho
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAF8] border-b">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-[#57534E]">
                        Sản phẩm
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-[#57534E]">
                        SKU
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-[#57534E]">
                        Số lượng
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-[#57534E]">
                        Khả dụng
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-[#57534E]">
                        Giá trị
                      </th>
                      <th className="p-4 text-center text-sm font-medium text-[#57534E]">
                        Trạng thái
                      </th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b hover:bg-[#FAFAF8]"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-[#F7F6F2] flex items-center justify-center">
                                <Package className="w-5 h-5 text-[#A8A29E]" />
                              </div>
                            )}
                            <span className="font-medium text-[#1C1917]">
                              {item.productName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-[#57534E]">
                          {item.productSku || "-"}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {item.quantity}
                        </td>
                        <td className="p-4 text-right text-[#57534E]">
                          {item.availableQuantity}
                        </td>
                        <td className="p-4 text-right text-[#57534E]">
                          {formatCurrency(item.totalValue)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge className={STATUS_COLORS[item.status]}>
                            {STATUS_LABELS[item.status]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openUpdateModal(item)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Cập nhật số lượng
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleRemoveItem(item._id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa khỏi kho
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Quantity Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật số lượng</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-[#FAFAF8] rounded-lg">
                <Package className="w-8 h-8 text-[#A8A29E]" />
                <div>
                  <p className="font-medium">{selectedItem.productName}</p>
                  <p className="text-sm text-[#78716C]">
                    Hiện có: {selectedItem.quantity} | Khả dụng:{" "}
                    {selectedItem.availableQuantity}
                  </p>
                </div>
              </div>

              <div>
                <Label>Thao tác</Label>
                <Select
                  value={quantityUpdate.operation}
                  onValueChange={(value) =>
                    setQuantityUpdate({ ...quantityUpdate, operation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Nhập thêm (+)</SelectItem>
                    <SelectItem value="subtract">Xuất kho (-)</SelectItem>
                    <SelectItem value="set">Đặt số lượng mới</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Số lượng</Label>
                <Input
                  type="number"
                  min={0}
                  value={quantityUpdate.quantity}
                  onChange={(e) =>
                    setQuantityUpdate({
                      ...quantityUpdate,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#C63321] hover:bg-[#A82A1A]"
              onClick={handleUpdateQuantity}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryPage;
