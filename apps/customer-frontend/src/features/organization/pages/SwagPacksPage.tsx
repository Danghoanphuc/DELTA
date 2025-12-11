// src/features/organization/pages/SwagPacksPage.tsx
// ✅ Swag Packs Management Page (SwagUp-style)

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Archive,
  Trash2,
  Eye,
  Edit,
  Loader2,
  Gift,
  Users,
  DollarSign,
  Sparkles,
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
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "@/shared/utils/toast";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import api from "@/shared/lib/axios";

interface SwagPack {
  _id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  items: Array<{
    _id: string;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
  }>;
  pricing: {
    subtotal: number;
    unitPrice: number;
  };
  totalOrdered: number;
  createdAt: string;
}

interface PackTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  suggestedItems: string[];
  estimatedPrice: number;
}

const PACK_TYPES = [
  { value: "welcome_kit", label: "Welcome Kit" },
  { value: "event_swag", label: "Event Swag" },
  { value: "client_gift", label: "Client Gift" },
  { value: "holiday_gift", label: "Holiday Gift" },
  { value: "custom", label: "Custom" },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-[#F7F6F2] text-[#44403C]",
  active: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-700",
};

// Import Pack Builder
import PackBuilderPage from "./PackBuilderPage";

export function SwagPacksPage() {
  const [packs, setPacks] = useState<SwagPack[]>([]);
  const [templates, setTemplates] = useState<PackTemplate[]>([]);
  const [stats, setStats] = useState({
    totalPacks: 0,
    activePacks: 0,
    draftPacks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pack Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPackId, setEditingPackId] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "custom",
  });

  // Fetch packs
  const fetchPacks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get(`/swag-packs?${params}`);
      setPacks(res.data?.data?.packs || []);
    } catch (error) {
      console.error("Error fetching packs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, statusFilter]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await api.get("/swag-packs/templates");
      setTemplates(res.data?.data?.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/swag-packs/stats");
      setStats(
        res.data?.data || { totalPacks: 0, activePacks: 0, draftPacks: 0 }
      );
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchPacks();
    fetchTemplates();
    fetchStats();
  }, [fetchPacks, fetchTemplates, fetchStats]);

  // Search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPacks();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchPacks]);

  // Open pack builder
  const openPackBuilder = (packId?: string) => {
    setEditingPackId(packId || null);
    setShowBuilder(true);
  };

  // Close pack builder
  const closePackBuilder = () => {
    setShowBuilder(false);
    setEditingPackId(null);
    fetchPacks();
    fetchStats();
  };

  // Create pack - now opens builder directly
  const handleCreatePack = async () => {
    setShowCreateModal(false);
    openPackBuilder();
  };

  // Create from template
  const handleCreateFromTemplate = async (template: PackTemplate) => {
    setIsSubmitting(true);
    try {
      const res = await api.post("/swag-packs", {
        name: template.name,
        description: template.description,
        type: template.type,
        items: [], // Will add items in builder
      });
      toast.success("Đã tạo bộ quà từ template!");
      setShowTemplatesModal(false);
      fetchPacks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate pack
  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/swag-packs/${id}/duplicate`);
      toast.success("Đã nhân bản bộ quà!");
      fetchPacks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Archive pack
  const handleArchive = async (id: string) => {
    try {
      await api.post(`/swag-packs/${id}/archive`);
      toast.success("Đã lưu trữ bộ quà!");
      fetchPacks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Delete pack
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa bộ quà này?")) return;

    try {
      await api.delete(`/swag-packs/${id}`);
      toast.success("Đã xóa bộ quà!");
      fetchPacks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Publish pack
  const handlePublish = async (id: string) => {
    try {
      await api.post(`/swag-packs/${id}/publish`);
      toast.success("Đã kích hoạt bộ quà!");
      fetchPacks();
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Show Pack Builder if active
  if (showBuilder) {
    return (
      <PackBuilderPage
        packId={editingPackId || undefined}
        onBack={closePackBuilder}
      />
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">
              Bộ quà sẵn có
            </h1>
            <p className="text-[#57534E]">Tạo và quản lý các bộ quà tặng</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-2 border-[#1C1917] text-[#1C1917] hover:bg-[#1C1917] hover:text-[#F7F6F2]"
              onClick={() => setShowTemplatesModal(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Từ Template
            </Button>
            <Button
              className="bg-[#C63321] hover:bg-[#A82A1A] text-[#F7F6F2] shadow-[0_2px_8px_rgba(198,51,33,0.2)]"
              onClick={() => openPackBuilder()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo bộ quà
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#FFF5F3]">
                <Package className="w-6 h-6 text-[#C63321]" />
              </div>
              <div>
                <p className="text-sm text-[#57534E]">Tổng bộ quà</p>
                <h3 className="text-2xl font-bold">{stats.totalPacks}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-100">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#57534E]">Đang hoạt động</p>
                <h3 className="text-2xl font-bold">{stats.activePacks}</h3>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-[#F7F6F2]">
                <Edit className="w-6 h-6 text-[#57534E]" />
              </div>
              <div>
                <p className="text-sm text-[#57534E]">Bản nháp</p>
                <h3 className="text-2xl font-bold">{stats.draftPacks}</h3>
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
                  placeholder="Tìm bộ quà..."
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
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="archived">Đã lưu trữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Packs Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#C63321]" />
          </div>
        ) : packs.length === 0 ? (
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-[#E5E3DC]" />
              <p className="text-lg font-medium mb-2 text-[#1C1917]">
                Chưa có bộ quà nào
              </p>
              <p className="text-sm text-[#78716C] mb-6">
                Tạo bộ quà đầu tiên hoặc chọn từ template có sẵn
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowTemplatesModal(true)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Chọn Template
                </Button>
                <Button
                  className="bg-[#C63321] hover:bg-[#A82A1A]"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo mới
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <Card
                key={pack._id}
                className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  {/* Pack Image/Preview */}
                  <div className="h-40 bg-gradient-to-br from-orange-100 to-orange-50 rounded-t-lg flex items-center justify-center">
                    {pack.items.length > 0 ? (
                      <div className="flex -space-x-4">
                        {pack.items.slice(0, 3).map((item, i) => (
                          <div
                            key={item._id}
                            className="w-16 h-16 rounded-lg bg-[#F7F6F2] shadow-md flex items-center justify-center overflow-hidden"
                          >
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-[#A8A29E]" />
                            )}
                          </div>
                        ))}
                        {pack.items.length > 3 && (
                          <div className="w-16 h-16 rounded-lg bg-[#C63321] shadow-md flex items-center justify-center text-white font-bold">
                            +{pack.items.length - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Package className="w-16 h-16 text-orange-300" />
                    )}
                  </div>

                  {/* Pack Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-[#1C1917]">
                          {pack.name}
                        </h3>
                        <p className="text-sm text-[#78716C]">
                          {pack.items.length} sản phẩm
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[pack.status]}>
                        {pack.status === "active"
                          ? "Hoạt động"
                          : pack.status === "draft"
                          ? "Nháp"
                          : "Lưu trữ"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[#57534E] mb-4">
                      <span>
                        {formatCurrency(pack.pricing?.unitPrice || 0)}/bộ
                      </span>
                      <span>{pack.totalOrdered} đã đặt</span>
                    </div>

                    <div className="flex gap-2">
                      {pack.status === "draft" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-[#C63321] hover:bg-[#A82A1A]"
                          onClick={() => handlePublish(pack._id)}
                        >
                          Kích hoạt
                        </Button>
                      )}
                      {pack.status === "active" && (
                        <Button
                          size="sm"
                          className="flex-1 bg-[#C63321] hover:bg-[#A82A1A]"
                        >
                          Gửi quà
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(pack._id)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Nhân bản
                          </DropdownMenuItem>
                          {pack.status !== "archived" && (
                            <DropdownMenuItem
                              onClick={() => handleArchive(pack._id)}
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Lưu trữ
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(pack._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Pack Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo bộ quà mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Tên bộ quà *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Welcome Kit 2024"
              />
            </div>
            <div>
              <Label>Loại</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PACK_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả ngắn về bộ quà..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#C63321] hover:bg-[#A82A1A]"
              onClick={handleCreatePack}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Tạo bộ quà"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Modal */}
      <Dialog open={showTemplatesModal} onOpenChange={setShowTemplatesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chọn Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-96 overflow-y-auto">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleCreateFromTemplate(template)}
                disabled={isSubmitting}
                className="p-4 border rounded-lg text-left hover:border-[#C63321] hover:bg-[#FFF5F3] transition-all"
              >
                <h3 className="font-semibold text-[#1C1917] mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-[#78716C] mb-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {template.suggestedItems.slice(0, 3).map((item) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {template.suggestedItems.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.suggestedItems.length - 3}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-[#C63321]">
                  ~{formatCurrency(template.estimatedPrice)}
                </p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SwagPacksPage;
