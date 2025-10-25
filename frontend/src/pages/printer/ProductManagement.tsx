// src/pages/printer/ProductManagement.tsx (ĐÃ SỬA)
// Sửa lỗi TS6133, TS6192: Bằng cách thêm JSX để sử dụng các import
import { useState } from "react";
import { Plus, Search, Edit, Trash2, Box } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Thêm import Table (Giả sử bạn đã có component này từ shadcn/ui)
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductManagement() {
  // SỬA LỖI: Sử dụng các state đã khai báo
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dữ liệu mẫu
  const products = [
    {
      id: "P001",
      name: "Hộp carton 3 lớp",
      category: "Bao bì",
      price: "5,000 ₫",
      stock: 1500,
    },
    {
      id: "P002",
      name: "Sticker decal nhựa",
      category: "Sticker",
      price: "1,500 ₫",
      stock: 10000,
    },
    {
      id: "P003",
      name: "Áo thun đồng phục",
      category: "Thời trang",
      price: "120,000 ₫",
      stock: 500,
    },
  ];

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
          <Button className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600">
            <Plus size={20} className="mr-2" />
            Thêm sản phẩm mới
          </Button>
        </div>

        {/* --- Thêm JSX để sử dụng component --- */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <Tabs
              defaultValue="all"
              value={selectedTab}
              onValueChange={setSelectedTab} // 👈 Sử dụng state
            >
              <div className="flex items-center justify-between mb-4">
                {/* Sử dụng TabsList, TabsTrigger */}
                <TabsList>
                  <TabsTrigger value="all">Tất cả sản phẩm</TabsTrigger>
                  <TabsTrigger value="packaging">Bao bì</TabsTrigger>
                  <TabsTrigger value="fashion">Thời trang</TabsTrigger>
                  <TabsTrigger value="sticker">Sticker</TabsTrigger>
                </TabsList>
                {/* Sử dụng Input và Search icon */}
                <div className="relative w-full max-w-sm">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Tìm kiếm sản phẩm..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // 👈 Sử dụng state
                  />
                </div>
              </div>

              {/* Sử dụng TabsContent */}
              <TabsContent value="all">
                <ProductTable
                  products={products}
                  EditIcon={Edit}
                  TrashIcon={Trash2}
                  BoxIcon={Box}
                />
              </TabsContent>
              <TabsContent value="packaging">
                <ProductTable
                  products={products.filter((p) => p.category === "Bao bì")}
                  EditIcon={Edit}
                  TrashIcon={Trash2}
                  BoxIcon={Box}
                />
              </TabsContent>
              {/* (Thêm các TabsContent khác nếu cần) */}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component phụ để render bảng (giúp sử dụng các icon)
function ProductTable({
  products,
  EditIcon,
  TrashIcon,
  BoxIcon,
}: {
  products: any[];
  EditIcon: any;
  TrashIcon: any;
  BoxIcon: any;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
        <BoxIcon size={48} className="text-gray-300 mb-4" /> {/* Sử dụng Box */}
        <h3 className="font-semibold text-gray-700">Không tìm thấy sản phẩm</h3>
        <p className="text-gray-500 text-sm">
          Chưa có sản phẩm nào trong danh mục này.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã SP</TableHead>
          <TableHead>Tên sản phẩm</TableHead>
          <TableHead>Danh mục</TableHead>
          <TableHead>Giá (tham khảo)</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead className="text-right">Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.id}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>{product.price}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="icon" title="Sửa">
                <EditIcon size={18} /> {/* Sử dụng EditIcon */}
              </Button>
              <Button variant="ghost" size="icon" title="Xóa">
                <TrashIcon size={18} className="text-red-600" />{" "}
                {/* Sử dụng TrashIcon */}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
