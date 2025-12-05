// src/features/organization/pages/ApprovalsPage.tsx
// ✅ Approval Workflow Page - Quản lý duyệt đơn

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Settings,
  Loader2,
  Gift,
  Users,
  DollarSign,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Switch } from "@/shared/components/ui/switch";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { toast } from "@/shared/utils/toast";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import api from "@/shared/lib/axios";

interface ApprovalRequest {
  _id: string;
  type: string;
  status: string;
  summary: {
    title: string;
    description?: string;
    amount?: number;
    itemCount?: number;
    recipientCount?: number;
  };
  requestedBy: {
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
  requestedAt: string;
  dueDate?: string;
  reviewedBy?: {
    displayName: string;
  };
  reviewedAt?: string;
  reviewNote?: string;
}

interface ApprovalSettings {
  enabled: boolean;
  rules: {
    swag_order: {
      enabled: boolean;
      autoApproveThreshold: number;
      autoApproveMaxRecipients: number;
      dueDurationHours: number;
    };
  };
  notifications: {
    zaloOnNewRequest: boolean;
    emailOnNewRequest: boolean;
  };
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> =
  {
    swag_order: { label: "Đơn gửi quà", icon: Gift, color: "text-orange-600" },
    budget: { label: "Ngân sách", icon: DollarSign, color: "text-green-600" },
    team_member: { label: "Thành viên", icon: Users, color: "text-blue-600" },
  };

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Đã duyệt", color: "bg-green-100 text-green-700" },
  rejected: { label: "Từ chối", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Đã hủy", color: "bg-gray-100 text-gray-700" },
};

export function ApprovalsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [settings, setSettings] = useState<ApprovalSettings | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Modals
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<ApprovalRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [requestsRes, statsRes, settingsRes] = await Promise.allSettled([
        api.get("/approvals/pending"),
        api.get("/approvals/stats"),
        api.get("/approvals/settings"),
      ]);

      if (requestsRes.status === "fulfilled") {
        setRequests(requestsRes.value.data?.data?.requests || []);
      }
      if (statsRes.status === "fulfilled") {
        setStats(
          statsRes.value.data?.data || { pending: 0, approved: 0, rejected: 0 }
        );
      }
      if (settingsRes.status === "fulfilled") {
        setSettings(settingsRes.value.data?.data?.settings);
      }
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Approve request
  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      await api.post(`/approvals/${selectedRequest._id}/approve`, {
        note: reviewNote,
      });
      toast.success("Đã duyệt yêu cầu!");
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewNote("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reject request
  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!reviewNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/approvals/${selectedRequest._id}/reject`, {
        note: reviewNote,
      });
      toast.success("Đã từ chối yêu cầu!");
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewNote("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update settings
  const handleUpdateSettings = async () => {
    if (!settings) return;

    setIsSubmitting(true);
    try {
      await api.put("/approvals/settings", settings);
      toast.success("Đã lưu cài đặt!");
      setShowSettingsModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open review modal
  const openReviewModal = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setReviewNote("");
    setShowReviewModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if overdue
  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Duyệt đơn</h1>
            <p className="text-gray-600">Quản lý các yêu cầu cần duyệt</p>
          </div>
          <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
                <p className="text-sm text-gray-500">Chờ duyệt</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.approved}
                </p>
                <p className="text-sm text-gray-500">Đã duyệt</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
                <p className="text-sm text-gray-500">Từ chối</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Status Banner */}
        {!settings?.enabled && (
          <Card className="border-none shadow-sm mb-6 bg-blue-50 border-l-4 border-l-blue-500">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Quy trình duyệt đang tắt
                  </p>
                  <p className="text-sm text-gray-500">
                    Bật quy trình duyệt để kiểm soát các đơn gửi quà
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowSettingsModal(true)}>
                Bật ngay
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Yêu cầu chờ duyệt ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-300" />
                <p className="text-lg font-medium mb-2">Không có yêu cầu nào</p>
                <p className="text-sm">Tất cả yêu cầu đã được xử lý</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => {
                  const typeConfig =
                    TYPE_CONFIG[request.type] || TYPE_CONFIG.swag_order;
                  const TypeIcon = typeConfig.icon;
                  const overdue = isOverdue(request.dueDate);

                  return (
                    <div
                      key={request._id}
                      className={`p-4 border rounded-lg hover:border-orange-300 transition-all cursor-pointer ${
                        overdue ? "border-red-200 bg-red-50" : ""
                      }`}
                      onClick={() => openReviewModal(request)}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg bg-gray-100 ${typeConfig.color}`}
                        >
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 truncate">
                              {request.summary.title}
                            </h3>
                            <Badge
                              className={STATUS_CONFIG[request.status].color}
                            >
                              {STATUS_CONFIG[request.status].label}
                            </Badge>
                            {overdue && (
                              <Badge className="bg-red-100 text-red-700">
                                Quá hạn
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Bởi {request.requestedBy.displayName}</span>
                            <span>•</span>
                            <span>{formatDate(request.requestedAt)}</span>
                            {request.summary.amount && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-orange-600">
                                  {formatCurrency(request.summary.amount)}
                                </span>
                              </>
                            )}
                            {request.summary.recipientCount && (
                              <>
                                <span>•</span>
                                <span>
                                  {request.summary.recipientCount} người nhận
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xem xét yêu cầu</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              {/* Request Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {selectedRequest.summary.title}
                </h3>
                {selectedRequest.summary.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedRequest.summary.description}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Người yêu cầu:</span>
                    <p className="font-medium">
                      {selectedRequest.requestedBy.displayName}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Thời gian:</span>
                    <p className="font-medium">
                      {formatDate(selectedRequest.requestedAt)}
                    </p>
                  </div>
                  {selectedRequest.summary.amount && (
                    <div>
                      <span className="text-gray-500">Số tiền:</span>
                      <p className="font-medium text-orange-600">
                        {formatCurrency(selectedRequest.summary.amount)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.summary.recipientCount && (
                    <div>
                      <span className="text-gray-500">Người nhận:</span>
                      <p className="font-medium">
                        {selectedRequest.summary.recipientCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Note */}
              <div>
                <Label>Ghi chú (bắt buộc khi từ chối)</Label>
                <Textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={isSubmitting}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Từ chối
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cài đặt quy trình duyệt</DialogTitle>
          </DialogHeader>
          {settings && (
            <div className="space-y-6 py-4">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label>Bật quy trình duyệt</Label>
                  <p className="text-sm text-gray-500">
                    Yêu cầu duyệt trước khi gửi quà
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enabled: checked })
                  }
                />
              </div>

              {settings.enabled && (
                <>
                  {/* Swag Order Rules */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Đơn gửi quà</h3>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Yêu cầu duyệt đơn gửi quà</Label>
                      </div>
                      <Switch
                        checked={settings.rules.swag_order.enabled}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            rules: {
                              ...settings.rules,
                              swag_order: {
                                ...settings.rules.swag_order,
                                enabled: checked,
                              },
                            },
                          })
                        }
                      />
                    </div>

                    {settings.rules.swag_order.enabled && (
                      <>
                        <div>
                          <Label>Tự động duyệt nếu dưới (VNĐ)</Label>
                          <Input
                            type="number"
                            value={
                              settings.rules.swag_order.autoApproveThreshold
                            }
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                rules: {
                                  ...settings.rules,
                                  swag_order: {
                                    ...settings.rules.swag_order,
                                    autoApproveThreshold:
                                      parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            placeholder="0 = luôn cần duyệt"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Đơn dưới số tiền này sẽ tự động được duyệt
                          </p>
                        </div>

                        <div>
                          <Label>Tự động duyệt nếu ≤ số người nhận</Label>
                          <Input
                            type="number"
                            value={
                              settings.rules.swag_order.autoApproveMaxRecipients
                            }
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                rules: {
                                  ...settings.rules,
                                  swag_order: {
                                    ...settings.rules.swag_order,
                                    autoApproveMaxRecipients:
                                      parseInt(e.target.value) || 0,
                                  },
                                },
                              })
                            }
                            placeholder="0 = luôn cần duyệt"
                          />
                        </div>

                        <div>
                          <Label>Thời hạn duyệt (giờ)</Label>
                          <Input
                            type="number"
                            value={settings.rules.swag_order.dueDurationHours}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                rules: {
                                  ...settings.rules,
                                  swag_order: {
                                    ...settings.rules.swag_order,
                                    dueDurationHours:
                                      parseInt(e.target.value) || 24,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Thông báo</h3>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Gửi Zalo khi có yêu cầu mới</Label>
                      </div>
                      <Switch
                        checked={settings.notifications.zaloOnNewRequest}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              zaloOnNewRequest: checked,
                            },
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label>Gửi Email khi có yêu cầu mới</Label>
                      </div>
                      <Switch
                        checked={settings.notifications.emailOnNewRequest}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              emailOnNewRequest: checked,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleUpdateSettings}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Lưu"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApprovalsPage;
