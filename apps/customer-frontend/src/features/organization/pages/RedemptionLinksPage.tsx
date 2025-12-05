// src/features/organization/pages/RedemptionLinksPage.tsx
// ✅ Redemption Links Management Page (SwagUp-style)

import { useState, useEffect } from "react";
import {
  Link2,
  Plus,
  Copy,
  ExternalLink,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Users,
  BarChart3,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  redemptionService,
  RedemptionLink,
  CreateLinkData,
} from "@/features/redemption/services/redemption.service";
import { toast } from "sonner";

const STATUS_CONFIG = {
  pending: {
    label: "Đang hoạt động",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle,
  },
  redeemed: {
    label: "Đã sử dụng",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: Users,
  },
  expired: {
    label: "Hết hạn",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: Clock,
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: XCircle,
  },
};

export default function RedemptionLinksPage() {
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<RedemptionLink[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLink, setNewLink] = useState<Partial<CreateLinkData>>({
    name: "",
    description: "",
    type: "single",
    maxRedemptions: 1,
    generateShortCode: true,
    branding: {
      welcomeTitle: "Bạn có quà!",
      thankYouTitle: "Cảm ơn bạn!",
    },
    settings: {
      requirePhone: true,
      requireAddress: true,
      autoCreateOrder: true,
    },
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [linksData, statsData] = await Promise.all([
        redemptionService.getLinks({
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        redemptionService.getStats(),
      ]);
      setLinks(linksData.links);
      setStats(statsData);
    } catch (err) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newLink.name?.trim()) {
      toast.error("Vui lòng nhập tên link");
      return;
    }

    try {
      setCreating(true);
      const created = await redemptionService.createLink(
        newLink as CreateLinkData
      );
      setLinks([created, ...links]);
      setShowCreateModal(false);
      setNewLink({
        name: "",
        description: "",
        type: "single",
        maxRedemptions: 1,
        generateShortCode: true,
      });
      toast.success("Đã tạo link thành công");
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo link");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = (link: RedemptionLink) => {
    const url = `${window.location.origin}/redeem/${link.token}`;
    navigator.clipboard.writeText(url);
    toast.success("Đã copy link");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa link này?")) return;

    try {
      await redemptionService.deleteLink(id);
      setLinks(links.filter((l) => l.id !== id));
      toast.success("Đã xóa link");
    } catch (err) {
      toast.error("Không thể xóa link");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await redemptionService.duplicateLink(id);
      setLinks([duplicated, ...links]);
      toast.success("Đã nhân bản link");
    } catch (err) {
      toast.error("Không thể nhân bản link");
    }
  };

  const filteredLinks = links.filter((link) =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="w-6 h-6" />
            Redemption Links
          </h1>
          <p className="text-gray-500 mt-1">
            Tạo link để người nhận tự chọn size/màu và điền địa chỉ
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo link mới
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalLinks}</div>
              <div className="text-sm text-gray-500">Tổng số link</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.activeLinks}
              </div>
              <div className="text-sm text-gray-500">Đang hoạt động</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <div className="text-sm text-gray-500">Lượt xem</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalRedemptions}
              </div>
              <div className="text-sm text-gray-500">Đã redeem</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm link..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Đang hoạt động</SelectItem>
            <SelectItem value="redeemed">Đã sử dụng</SelectItem>
            <SelectItem value="expired">Hết hạn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Links List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredLinks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có redemption link nào</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo link đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => {
            const statusConfig =
              STATUS_CONFIG[link.status as keyof typeof STATUS_CONFIG] ||
              STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{link.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${statusConfig.bg} ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>

                      {link.description && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">
                          {link.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {link.stats.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {link.currentRedemptions}/{link.maxRedemptions}{" "}
                          redeemed
                        </span>
                        <span>
                          {link.type === "single"
                            ? "1 lần"
                            : link.type === "bulk"
                            ? `${link.maxRedemptions} lần`
                            : "Không giới hạn"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(link)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(`/redeem/${link.token}`, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(link.id)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Nhân bản
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(link.id)}
                            className="text-red-600"
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
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo Redemption Link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Tên link *</Label>
              <Input
                value={newLink.name}
                onChange={(e) =>
                  setNewLink({ ...newLink, name: e.target.value })
                }
                placeholder="VD: Welcome Kit Q1 2024"
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={newLink.description}
                onChange={(e) =>
                  setNewLink({ ...newLink, description: e.target.value })
                }
                placeholder="Mô tả ngắn về link này..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại link</Label>
                <Select
                  value={newLink.type}
                  onValueChange={(v) =>
                    setNewLink({
                      ...newLink,
                      type: v as "single" | "bulk" | "unlimited",
                      maxRedemptions:
                        v === "single" ? 1 : newLink.maxRedemptions,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">1 lần dùng</SelectItem>
                    <SelectItem value="bulk">Nhiều lần</SelectItem>
                    <SelectItem value="unlimited">Không giới hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newLink.type === "bulk" && (
                <div>
                  <Label>Số lần tối đa</Label>
                  <Input
                    type="number"
                    min={1}
                    value={newLink.maxRedemptions}
                    onChange={(e) =>
                      setNewLink({
                        ...newLink,
                        maxRedemptions: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Campaign (tùy chọn)</Label>
              <Input
                value={newLink.campaign || ""}
                onChange={(e) =>
                  setNewLink({ ...newLink, campaign: e.target.value })
                }
                placeholder="VD: onboarding-2024"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo link"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
