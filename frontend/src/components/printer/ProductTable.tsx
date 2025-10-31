// src/components/printer/ProductTable.tsx (COMPONENT MỚI)
import { useState } from "react";
import { Search, Edit, Trash2, Brush } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { PrinterProduct } from "@/types/product";
import { ProductEmptyState } from "./ProductEmptyState";

interface ProductTableProps {
  products: PrinterProduct[];
  loading: boolean;
  onEdit: (product: PrinterProduct) => void;
  onDelete: (product: PrinterProduct) => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ==================== FILTER PRODUCTS ====================
  const filteredProducts = products.filter((p) => {
    const matchesTab = selectedTab === "all" || p.category === selectedTab;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specifications?.material
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // ==================== HELPERS ====================
  const getDisplayPrice = (product: PrinterProduct) => {
    if (!product.pricing || product.pricing.length === 0) {
      return "Chưa set giá";
    }
    const firstPrice = product.pricing[0];
    return `${firstPrice.pricePerUnit.toLocaleString("vi-VN")} ₫ / ${
      firstPrice.minQuantity
    }+`;
  };

  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
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

          <TabsContent value={selectedTab}>
            {loading ? (
              <div className="text-center p-12">Đang tải sản phẩm...</div>
            ) : filteredProducts.length === 0 ? (
              <ProductEmptyState />
            ) : (
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
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        {product.specifications?.material || "N/A"}
                      </TableCell>
                      <TableCell>
                        {product.specifications?.size || "N/A"}
                      </TableCell>
                      <TableCell>{getDisplayPrice(product)}</TableCell>
                      <TableCell>
                        {product.isActive ? (
                          <span className="text-green-600 text-sm">
                            ✓ Đang bán
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            ✗ Ngừng bán
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          title="Tạo mẫu thiết kế từ phôi này"
                        >
                          <Link to={`/printer/studio/${product._id}`}>
                            <Brush size={16} className="text-blue-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Sửa"
                          onClick={() => onEdit(product)}
                        >
                          <Edit size={18} className="text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xóa"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
