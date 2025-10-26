// frontend/src/pages/printer/ProductManagement.tsx (FULLY UPDATED)

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/lib/axios";
import { toast } from "sonner";
import { PrinterProduct } from "@/types/product";
import { AddProductForm } from "@/components/printer/AddProductForm";
import { EditProductModal } from "@/components/printer/EditProductModal";

export function ProductManagement() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<PrinterProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete Confirmation State
  const [deletingProduct, setDeletingProduct] = useState<PrinterProduct | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // ==================== FETCH PRODUCTS ====================
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products/my-products");
      setProducts(res.data.products);
    } catch (err: any) {
      console.error("Fetch My Products Error:", err);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==================== DELETE PRODUCT ====================
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      await api.delete(`/products/${deletingProduct._id}`);
      toast.success("✅ Đã xóa sản phẩm");

      // Remove from local state
      setProducts((prev) => prev.filter((p) => p._id !== deletingProduct._id));

      setShowDeleteDialog(false);
      setDeletingProduct(null);
    } catch (err: any) {
      console.error("❌ Delete Product Error:", err);
      toast.error(err.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

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

  // ==================== RENDER ====================
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
          {!showAddForm && (
            <Button
              className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={20} className="mr-2" />
              Thêm sản phẩm mới
            </Button>
          )}
        </div>

        {/* Conditional Render */}
        {showAddForm ? (
          <AddProductForm
            onFormClose={() => setShowAddForm(false)}
            onProductAdded={() => {
              fetchProducts();
              setShowAddForm(false);
            }}
          />
        ) : (
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
                    <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <Box size={48} className="text-gray-300 mb-4" />
                      <h3 className="font-semibold text-gray-700">
                        Không tìm thấy sản phẩm
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Bạn chưa có sản phẩm nào. Hãy nhấn "Thêm sản phẩm mới".
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Chất liệu</TableHead>
                          <TableHead>Kích thước</TableHead>
                          <TableHead>Giá (tham khảo)</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">
                            Hành động
                          </TableHead>
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
                                variant="ghost"
                                size="icon"
                                title="Sửa"
                                onClick={() => {
                                  setEditingProduct(product);
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit size={18} className="text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Xóa"
                                onClick={() => {
                                  setDeletingProduct(product);
                                  setShowDeleteDialog(true);
                                }}
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
        )}
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            fetchProducts();
            setShowEditModal(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm{" "}
              <strong>{deletingProduct?.name}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingProduct(null);
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
