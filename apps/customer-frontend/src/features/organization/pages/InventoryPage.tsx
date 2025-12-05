// src/features/organization/pages/InventoryPage.tsx
// ✅ B2B Organization Inventory Management (Real API)

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Search,
  Plus,
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
import { toast } from "@/shared/utils/toast";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import api from "@/shared/lib/axios";

interface InventoryItem {
  _id: string;
  product: string;
  productName: string;
  productSku?: string;
  productImage?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  unitCost: number;
  totalValue: number;
  status: string;
  lowStockThreshold: number;
  warehouseLocation: string;
  lastRestockedAt?: string;
  lastShippedAt?: string;
}

interface InventoryStats {
  totalSkus: number;
  totalQuantity: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

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
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [quantityUpdate, setQuantityUpdate] = useState({
    quantity: 0,
    operation: "add",
  });

  // Fetch inventory
  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get(`/inventory?${params}`);
      setItems(res.data?.data?.items || []);
      setStats(res.data?.data?.stats || null);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchInventory]);

  // Update quantity
  const handleUpdateQuantity = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      await api.put(`/inventory/items/${selectedItem._id}/quantity`, {
        quantity: quantityUpdate.quantity,
        operation: quantityUpdate.operation,
      });
      toast.success("Đã cập nhật số lượng!");
      setShowUpdateModal(false);
      setSelectedItem(null);
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này khỏi kho?")) return;

    try {
      await api.delete(`/inventory/items/${itemId}`);
      toast.success("Đã xóa khỏi kho!");
      fetchInventory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Open update modal
  const openUpdateModal = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantityUpdate({ quantity: 0, operation: "add" });
    setShowUpdateModal(true);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tồn kho</h1>
            <p className="text-gray-600">Quản lý hàng hóa lưu kho tại Printz</p>
          </div>
          <Button onClick={fetchInventory} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tổng SKU</p>
                <h3 className="text-xl font-bold">{stats?.totalSkus || 0}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Warehouse className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tổng số lượng</p>
                <h3 className="text-xl font-bold">
                  {stats?.totalQuantity || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Giá trị</p>
                <h3 className="text-xl font-bold">
                  {formatCurrency(stats?.totalValue || 0)}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <TrendingDown className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sắp hết</p>
                <h3 className="text-xl font-bold">
                  {stats?.lowStockCount || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hết hàng</p>
                <h3 className="text-xl font-bold">
                  {stats?.outOfStockCount || 0}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Danh sách hàng hóa</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">Chưa có hàng hóa nào</p>
                <p className="text-sm mb-6">
                  Đặt hàng với dịch vụ lưu kho để bắt đầu quản lý tồn kho
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Tìm hiểu dịch vụ lưu kho
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-gray-600">
                        Sản phẩm
                      </th>
                      <th className="p-4 text-left text-sm font-medium text-gray-600">
                        SKU
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-gray-600">
                        Số lượng
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-gray-600">
                        Khả dụng
                      </th>
                      <th className="p-4 text-right text-sm font-medium text-gray-600">
                        Giá trị
                      </th>
                      <th className="p-4 text-center text-sm font-medium text-gray-600">
                        Trạng thái
                      </th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <span className="font-medium text-gray-900">
                              {item.productName}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          {item.productSku || "-"}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {item.quantity}
                        </td>
                        <td className="p-4 text-right text-gray-600">
                          {item.availableQuantity}
                        </td>
                        <td className="p-4 text-right text-gray-600">
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
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium">{selectedItem.productName}</p>
                  <p className="text-sm text-gray-500">
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
              className="bg-orange-500 hover:bg-orange-600"
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
