// src/components/printer/ProductTable.tsx
import { useState } from "react";
import { Search, Edit, Trash2, Brush, MoreHorizontal, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { PrinterProduct } from "@/types/product";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Helper: Get Price
  const getDisplayPrice = (product: PrinterProduct) => {
    if (!product.pricing || product.pricing.length === 0) return "Chưa có giá";
    const firstPrice = product.pricing[0];
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(firstPrice.pricePerUnit);
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-100 bg-white flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
           {/* Filter Dropdown */}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="gap-2 w-full sm:w-auto bg-white">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-gray-700">Lọc: {filterCategory === 'all' ? 'Tất cả' : filterCategory}</span>
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuLabel>Danh mục</DropdownMenuLabel>
                 <DropdownMenuItem onClick={() => setFilterCategory("all")}>Tất cả</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setFilterCategory("business-card")}>Danh thiếp</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setFilterCategory("flyer")}>Tờ rơi</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setFilterCategory("sticker")}>Sticker</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setFilterCategory("t-shirt")}>Áo thun</DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Sản phẩm</TableHead>
              <TableHead>Thông số</TableHead>
              <TableHead>Giá khởi điểm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               // Loading Skeleton
               [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                     <TableCell><div className="h-4 w-32 bg-gray-100 rounded animate-pulse" /></TableCell>
                     <TableCell><div className="h-4 w-20 bg-gray-100 rounded animate-pulse" /></TableCell>
                     <TableCell><div className="h-4 w-16 bg-gray-100 rounded animate-pulse" /></TableCell>
                     <TableCell><div className="h-4 w-12 bg-gray-100 rounded animate-pulse" /></TableCell>
                     <TableCell><div className="h-8 w-8 bg-gray-100 rounded animate-pulse ml-auto" /></TableCell>
                  </TableRow>
               ))
            ) : filteredProducts.length === 0 ? (
               // Empty State
               <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                     <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                           <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="font-medium">Không tìm thấy sản phẩm nào</p>
                        <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                     </div>
                  </TableCell>
               </TableRow>
            ) : (
               filteredProducts.map((product) => (
                <TableRow key={product._id} className="group hover:bg-blue-50/30 transition-colors">
                  <TableCell>
                    <div>
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 capitalize">{product.category.replace('-', ' ')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 space-y-1">
                       <p><span className="text-gray-400 text-xs">Chất liệu:</span> {product.specifications?.material || "N/A"}</p>
                       <p><span className="text-gray-400 text-xs">Kích thước:</span> {product.specifications?.size || "N/A"}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">
                     {getDisplayPrice(product)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                       variant="outline"
                       className={cn(
                          "font-normal border-0",
                          product.isActive 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-gray-100 text-gray-600"
                       )}
                    >
                      {product.isActive ? "Đang bán" : "Ẩn"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick Action: Studio */}
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full" title="Thiết kế mẫu">
                        <Link to={`/printer/studio/${product._id}`}>
                          <Brush size={16} />
                        </Link>
                      </Button>
                      
                      {/* More Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700 rounded-full">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => onEdit(product)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa sản phẩm
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}