// src/pages/printer/ProductManagement.tsx (ĐÃ SỬA API ENDPOINT)

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Box } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/axios"; // Giữ nguyên
import { toast } from "sonner";
import { PrinterProduct } from "@/types/product";
import { AddProductForm } from "@/components/printer/AddProductForm";

export function ProductManagement() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<PrinterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Hàm tải sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      // *** SỬA Ở ĐÂY: Bỏ "/api" ***
      const res = await api.get("/products/my-products"); // <-- Sửa từ "/api/products/my-products"
      setProducts(res.data.products);
    } catch (err: any) {
      console.error("Fetch My Products Error:", err); // Log lỗi chi tiết
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // Tải sản phẩm khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // ... (Phần còn lại của component giữ nguyên) ...

  // Lọc sản phẩm (tạm thời ở frontend)
  const filteredProducts = products.filter((p) => {
    const matchesTab = selectedTab === "all" || p.category === selectedTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specifications?.material
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // (HÀM TẠM THỜI) Lấy giá đầu tiên để hiển thị
  const getDisplayPrice = (product: PrinterProduct) => {
    if (!product.pricing || product.pricing.length === 0) {
      return "Chưa set giá";
    }
    const firstPrice = product.pricing[0];
    // Hiển thị dạng 1.000 ₫ / 100+ cái
    return `${firstPrice.pricePerUnit.toLocaleString("vi-VN")} ₫ / ${
      firstPrice.minQuantity
    }+`;
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quản lý sản phẩm
            </h1>
            <p className="text-gray-600">
              Cập nhật và quản lý các sản phẩm in ấn của bạn
            </p>
          </div>
          {/* Nút này sẽ ẩn form và hiện nút "quay lại" nếu form đang mở */}
          {!showAddForm && (
            <Button
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              onClick={() => setShowAddForm(true)} // <-- MỞ FORM
            >
              <Plus size={20} className="mr-2" />
              Thêm sản phẩm mới
            </Button>
          )}
        </div>

        {/* --- HIỂN THỊ CÓ ĐIỀU KIỆN --- */}
        {showAddForm ? (
          // 1. Giao diện THÊM SẢN PHẨM
          <AddProductForm
            onFormClose={() => setShowAddForm(false)}
            onProductAdded={() => {
              fetchProducts(); // Tải lại danh sách
              // (form sẽ tự đóng sau khi thêm thành công)
            }}
          />
        ) : (
          // 2. Giao diện DANH SÁCH SẢN PHẨM
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <TabsList>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                    {/* // TODO: Lấy category động */}
                    <TabsTrigger value="flyer">Tờ rơi</TabsTrigger>
                    <TabsTrigger value="sticker">Sticker</TabsTrigger>
                    <TabsTrigger value="business-card">Danh thiếp</TabsTrigger>
                  </TabsList>
                  <div className="relative w-full max-w-sm">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dùng 1 TabsContent duy nhất, lọc bằng state */}
                <TabsContent value={selectedTab}>
                  <ProductTable
                    products={filteredProducts}
                    loading={loading}
                    getDisplayPrice={getDisplayPrice} // <-- Truyền hàm helper
                    EditIcon={Edit}
                    TrashIcon={Trash2}
                    BoxIcon={Box}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Component phụ để render bảng (CẬP NHẬT Props)
function ProductTable({
  products,
  loading,
  getDisplayPrice,
  EditIcon,
  TrashIcon,
  BoxIcon,
}: {
  products: PrinterProduct[];
  loading: boolean;
  getDisplayPrice: (product: PrinterProduct) => string;
  EditIcon: any;
  TrashIcon: any;
  BoxIcon: any;
}) {
  if (loading) {
    return <div className="text-center p-12">Đang tải sản phẩm...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
        <BoxIcon size={48} className="text-gray-300 mb-4" />
        <h3 className="font-semibold text-gray-700">Không tìm thấy sản phẩm</h3>
        <p className="text-gray-500 text-sm">
          Bạn chưa có sản phẩm nào trong danh mục này. Hãy nhấn "Thêm sản phẩm
          mới".
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên sản phẩm</TableHead>
          <TableHead>Chất liệu</TableHead>
          <TableHead>Kích thước</TableHead>
          <TableHead>Giá (tham khảo)</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product._id}>
            <TableCell className="font-medium">{product.name}</TableCell>
            <TableCell>{product.specifications?.material || "N/A"}</TableCell>
            <TableCell>{product.specifications?.size || "N/A"}</TableCell>
            <TableCell>{getDisplayPrice(product)}</TableCell>
            <TableCell>
              {product.isActive ? (
                <span className="text-green-600">Đang bán</span>
              ) : (
                <span className="text-gray-500">Ngừng bán</span>
              )}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" title="Sửa" disabled>
                <EditIcon size={18} />
              </Button>
              <Button variant="ghost" size="icon" title="Xóa" disabled>
                <TrashIcon size={18} className="text-red-600" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
