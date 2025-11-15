// src/features/printer/pages/AssetManagementPage.tsx
// ✅ IMPLEMENT: Asset Management Page với khả năng upload và quản lý file .glb

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AssetWizard } from "@/features/printer/components/AssetWizard";
import { Asset } from "@/types/asset";
import * as assetService from "@/services/assetService";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Plus, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ASSETS_QUERY_KEY = ["printer-assets", "my-assets"];

export default function AssetManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const action = searchParams.get("action");
  const editingAssetId = action === "edit" ? searchParams.get("id") : null;

  // Fetch assets
  const { data, isLoading } = useQuery({
    queryKey: ASSETS_QUERY_KEY,
    queryFn: assetService.getMyAssets,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const privateAssets = data?.privateAssets || [];
  const publicAssets = data?.publicAssets || [];
  const allAssets = [...privateAssets, ...publicAssets];

  // Navigation handlers
  const navigateTo = (newAction?: "new" | "edit", id?: string) => {
    setSearchParams(
      (prevParams) => {
        const newParams = new URLSearchParams(prevParams);
        if (newAction) {
          newParams.set("action", newAction);
          if (id) {
            newParams.set("id", id);
          }
        } else {
          newParams.delete("action");
          newParams.delete("id");
        }
        return newParams;
      },
      { replace: true }
    );
  };

  const openAddForm = () => navigateTo("new");
  const openEditForm = (asset: Asset) => navigateTo("edit", asset._id);
  const closeForm = () => navigateTo();

  const handleSuccess = () => {
    closeForm();
    queryClient.invalidateQueries({ queryKey: ASSETS_QUERY_KEY });
    toast.success("Thao tác thành công!");
  };

  // Render Wizard nếu đang tạo/sửa
  if (action === "new") {
    return (
      <AssetWizard
        onFormClose={closeForm}
        onSuccess={handleSuccess}
      />
    );
  }

  if (action === "edit" && editingAssetId) {
    return (
      <AssetWizard
        productId={editingAssetId}
        onFormClose={closeForm}
        onSuccess={handleSuccess}
      />
    );
  }

  // Render danh sách assets
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Quản lý Phôi</h1>
            <p className="text-gray-600 mt-2">
              Tạo và quản lý các phôi in ấn của bạn (file .glb)
            </p>
          </div>
          <Button onClick={openAddForm} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2" size={18} />
            Thêm phôi mới
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center p-12">
            <Loader2 className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600" />
            <p className="mt-4 text-gray-500">Đang tải phôi...</p>
          </div>
        ) : allAssets.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 mb-4">Chưa có phôi nào.</p>
              <Button onClick={openAddForm} variant="outline">
                <Plus className="mr-2" size={18} />
                Tạo phôi đầu tiên
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Phôi riêng tư */}
            {privateAssets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Phôi riêng tư của tôi</CardTitle>
                  <CardDescription>
                    Các phôi chỉ bạn có thể sử dụng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên phôi</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Số bề mặt</TableHead>
                        <TableHead>File GLB</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {privateAssets.map((asset) => (
                        <TableRow key={asset._id}>
                          <TableCell className="font-medium">
                            {asset.name}
                          </TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{asset.assets.surfaces.length}</TableCell>
                          <TableCell>
                            {asset.assets.modelUrl ? (
                              <span className="text-green-600">✓ Đã tải</span>
                            ) : (
                              <span className="text-red-600">✗ Chưa có</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(asset)}
                            >
                              <Edit size={16} className="mr-1" />
                              Sửa
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Phôi công khai */}
            {publicAssets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Phôi công khai</CardTitle>
                  <CardDescription>
                    Các phôi có thể được sử dụng bởi mọi người
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên phôi</TableHead>
                        <TableHead>Danh mục</TableHead>
                        <TableHead>Số bề mặt</TableHead>
                        <TableHead>File GLB</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {publicAssets.map((asset) => (
                        <TableRow key={asset._id}>
                          <TableCell className="font-medium">
                            {asset.name}
                          </TableCell>
                          <TableCell>{asset.category}</TableCell>
                          <TableCell>{asset.assets.surfaces.length}</TableCell>
                          <TableCell>
                            {asset.assets.modelUrl ? (
                              <span className="text-green-600">✓ Đã tải</span>
                            ) : (
                              <span className="text-red-600">✗ Chưa có</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(asset)}
                            >
                              <Edit size={16} className="mr-1" />
                              Sửa
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
