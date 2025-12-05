// src/features/organization/pages/CompanyStoreManagePage.tsx
// ✅ SOLID Refactored - Compose components only

import { useState } from "react";
import {
  Store,
  Settings,
  Eye,
  EyeOff,
  ExternalLink,
  Palette,
  Package,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { toast } from "sonner";

import { useCompanyStore } from "../hooks/useCompanyStore";
import {
  CreateStoreForm,
  StoreGeneralSettings,
  StoreBrandingSettings,
  StoreProductsList,
  AddProductModal,
} from "../components/store";

export default function CompanyStoreManagePage() {
  const {
    loading,
    saving,
    store,
    hasStore,
    createStore,
    saveStore,
    publishStore,
    unpublishStore,
    addProduct,
    removeProduct,
    updateStore,
    updateBranding,
    updateSettings,
    updateAccess,
  } = useCompanyStore();

  const [showAddProduct, setShowAddProduct] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!hasStore) {
    return <CreateStoreForm onCreate={createStore} />;
  }

  if (!store) return null;

  const isPublished = store.status === "active";

  const handlePublish = async () => {
    try {
      await publishStore();
    } catch (err: any) {
      toast.error(err.message || "Không thể publish");
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishStore();
    } catch (err: any) {
      toast.error(err.message || "Không thể tạm dừng");
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await removeProduct(productId);
    } catch {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="w-6 h-6" />
            Company Store
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý store riêng cho tổ chức của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(`/store/${store.slug}`, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Xem Store
          </Button>
          {isPublished ? (
            <Button variant="outline" onClick={handleUnpublish}>
              <EyeOff className="w-4 h-4 mr-2" />
              Tạm dừng
            </Button>
          ) : (
            <Button onClick={handlePublish}>
              <Eye className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
          <Button onClick={saveStore} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Lưu
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg ${
          isPublished
            ? "bg-green-50 text-green-700"
            : "bg-yellow-50 text-yellow-700"
        }`}
      >
        <div className="flex items-center gap-2">
          {isPublished ? (
            <>
              <Eye className="w-5 h-5" />
              <span>Store đang hoạt động tại:</span>
              <a
                href={`/store/${store.slug}`}
                target="_blank"
                className="font-medium underline"
              >
                printz.vn/store/{store.slug}
              </a>
            </>
          ) : (
            <>
              <EyeOff className="w-5 h-5" />
              <span>
                Store đang ở chế độ nháp. Publish để mọi người có thể truy cập.
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt chung
          </TabsTrigger>
          <TabsTrigger value="branding">
            <Palette className="w-4 h-4 mr-2" />
            Thương hiệu
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            Sản phẩm ({store.products?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <StoreGeneralSettings
            store={store}
            onUpdateStore={updateStore}
            onUpdateSettings={updateSettings}
            onUpdateAccess={updateAccess}
          />
        </TabsContent>

        <TabsContent value="branding">
          <StoreBrandingSettings
            branding={store.branding}
            onUpdate={updateBranding}
          />
        </TabsContent>

        <TabsContent value="products">
          <StoreProductsList
            products={store.products || []}
            onAddProduct={() => setShowAddProduct(true)}
            onRemoveProduct={handleRemoveProduct}
          />
        </TabsContent>
      </Tabs>

      {/* Add Product Modal */}
      <AddProductModal
        open={showAddProduct}
        onOpenChange={setShowAddProduct}
        onAdd={addProduct}
      />
    </div>
  );
}
