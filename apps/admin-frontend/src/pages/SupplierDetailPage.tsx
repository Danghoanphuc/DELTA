// apps/admin-frontend/src/pages/SupplierDetailPage.tsx
// ✅ SOLID: Single Responsibility - UI rendering only
// Layout với tabs: Giới thiệu | Bài viết | Tác phẩm | Hiệu suất

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  Package,
  BarChart3,
  User,
  Plus,
} from "lucide-react";
import {
  supplierApi,
  Supplier,
  SupplierPerformanceMetrics,
  LeadTimeRecord,
} from "@/services/catalog.service";
import { toast } from "sonner";

// Components
import { SupplierInfoCard } from "@/components/suppliers/SupplierInfoCard";
import { SupplierPostsList } from "@/components/suppliers/SupplierPostsList";
import { SupplierProductsList } from "@/components/suppliers/SupplierProductsList";
import { SupplierPerformanceCard } from "@/components/suppliers/SupplierPerformanceCard";
import { SupplierProfileEditor } from "@/components/suppliers/SupplierProfileEditor";
import { PostEditorSelector } from "@/components/suppliers/PostEditorSelector";

type TabType = "intro" | "profile" | "posts" | "products" | "performance";

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "intro", label: "Giới thiệu", icon: User },
  { id: "profile", label: "Profile Công khai", icon: User },
  { id: "posts", label: "Bài viết", icon: FileText },
  { id: "products", label: "Tác phẩm", icon: Package },
  { id: "performance", label: "Hiệu suất", icon: BarChart3 },
];

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [performance, setPerformance] =
    useState<SupplierPerformanceMetrics | null>(null);
  const [leadTimeHistory, setLeadTimeHistory] = useState<LeadTimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("intro");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshPosts, setRefreshPosts] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSupplierData();
    }
  }, [id]);

  const fetchSupplierData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [supplierData, performanceData, leadTimeData] = await Promise.all([
        supplierApi.getById(id),
        supplierApi.getPerformance(id).catch(() => null),
        supplierApi.getLeadTimeHistory(id).catch(() => []),
      ]);

      setSupplier(supplierData);
      setPerformance(performanceData);
      setLeadTimeHistory(leadTimeData || []);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải thông tin nhà cung cấp"
      );
      console.error("Error fetching supplier data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupplierUpdate = (updated: Supplier) => {
    setSupplier(updated);
  };

  const handleCreatePost = async (data: any) => {
    if (!id) return;

    try {
      await supplierApi.createPost(id, data);
      toast.success("Đã đăng bài thành công!");
      setRefreshPosts((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đăng bài");
      throw error;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Not found state
  if (!supplier) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Không tìm thấy nhà cung cấp</p>
          <button
            onClick={() => navigate("/catalog/suppliers")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/catalog/suppliers")}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {supplier.name}
                </h1>
                <p className="text-sm text-gray-500">{supplier.code}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Link to public profile */}
              <a
                href={`${import.meta.env.VITE_CUSTOMER_URL || ""}/artisans/${
                  supplier.code
                }`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                title="Xem trang công khai"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Xem public
              </a>
              {activeTab === "posts" && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4" />
                  Đăng bài
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab: Giới thiệu */}
        {activeTab === "intro" && (
          <div className="space-y-6">
            <SupplierInfoCard
              supplier={supplier}
              onUpdate={handleSupplierUpdate}
            />

            {/* Quick Stats */}
            {performance && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {performance.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {(performance.onTimeDeliveryRate || 0).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500">Giao đúng hạn</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {(performance.qualityScore || 0).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-500">Chất lượng</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {(performance.averageLeadTime || 0).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">Lead time (ngày)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Profile Công khai */}
        {activeTab === "profile" && (
          <SupplierProfileEditor
            supplier={supplier}
            onUpdate={handleSupplierUpdate}
          />
        )}

        {/* Tab: Bài viết */}
        {activeTab === "posts" && (
          <div>
            <SupplierPostsList supplierId={id!} key={refreshPosts} />
          </div>
        )}

        {/* Tab: Tác phẩm (Products) */}
        {activeTab === "products" && (
          <SupplierProductsList supplierId={id!} supplierName={supplier.name} />
        )}

        {/* Tab: Hiệu suất */}
        {activeTab === "performance" && performance && (
          <SupplierPerformanceCard
            performance={performance}
            leadTimeHistory={leadTimeHistory}
          />
        )}

        {activeTab === "performance" && !performance && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có dữ liệu hiệu suất
            </h3>
            <p className="text-gray-500">
              Dữ liệu hiệu suất sẽ được cập nhật khi có đơn hàng sản xuất.
            </p>
          </div>
        )}
      </div>

      {/* Create Post Modal - with mode selector */}
      <PostEditorSelector
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
        supplierInfo={
          supplier
            ? {
                name: supplier.name,
                email: supplier.contactInfo?.email,
                type: supplier.type,
              }
            : undefined
        }
      />
    </div>
  );
}
