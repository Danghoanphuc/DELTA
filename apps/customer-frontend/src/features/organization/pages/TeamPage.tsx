// src/features/organization/pages/TeamPage.tsx
// ✅ B2B Organization Team Management (Real API)

import { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreHorizontal,
  Trash2,
  Loader2,
  Clock,
  CheckCircle,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
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
import { Label } from "@/shared/components/ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";

interface PendingInvite {
  email: string;
  invitedAt?: string;
  status: string;
}

interface TeamMember {
  userId: string;
  role: string;
  joinedAt: string;
  user?: {
    displayName: string;
    email: string;
    avatarUrl?: string;
  };
}

const ROLE_LABELS: Record<string, string> = {
  owner: "Chủ sở hữu",
  admin: "Quản trị viên",
  member: "Thành viên",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-orange-100 text-orange-700",
  admin: "bg-blue-100 text-blue-700",
  member: "bg-gray-100 text-gray-700",
};

export function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.activeOrganizationProfile);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);

  const pendingInvites: PendingInvite[] = profile?.pendingInvites || [];
  const teamMembers: TeamMember[] = profile?.teamMembers || [];

  // Add email field
  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  // Update email
  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  // Remove email field
  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  // Send invites
  const handleSendInvites = async () => {
    const validEmails = emails.filter(
      (email) => email.trim() && email.includes("@")
    );

    if (validEmails.length === 0) {
      toast.error("Vui lòng nhập ít nhất 1 email hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/organizations/invite-members", { emails: validEmails });
      toast.success(`Đã gửi lời mời đến ${validEmails.length} người!`);
      setShowInviteModal(false);
      setEmails([""]);
      // Refresh profile to get updated pending invites
      await fetchMe(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gửi lời mời thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Thành viên
            </h1>
            <p className="text-gray-600">
              Quản lý thành viên trong tổ chức của bạn
            </p>
          </div>
          <Button
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Mời thành viên
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.length + 1}
              </p>
              <p className="text-sm text-gray-500">Thành viên</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {pendingInvites.filter((i) => i.status === "pending").length}
              </p>
              <p className="text-sm text-gray-500">Đang chờ</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {pendingInvites.filter((i) => i.status === "accepted").length}
              </p>
              <p className="text-sm text-gray-500">Đã chấp nhận</p>
            </CardContent>
          </Card>
        </div>

        {/* Current User (Owner) */}
        <Card className="border-none shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Quản trị viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                {user?.displayName?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <Badge className={ROLE_COLORS.owner}>{ROLE_LABELS.owner}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <Card className="border-none shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Thành viên ({teamMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {member.user?.displayName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.user?.displayName || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.user?.email || ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={ROLE_COLORS[member.role]}>
                        {ROLE_LABELS[member.role]}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Đổi vai trò</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Xóa khỏi team
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <Card className="border-none shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-yellow-500" />
                Lời mời đang chờ ({pendingInvites.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInvites.map((invite, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {invite.email}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {invite.invitedAt
                            ? `Gửi lúc ${formatDate(invite.invitedAt)}`
                            : "Đang chờ"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite.status === "pending" ? (
                        <Badge className="bg-yellow-100 text-yellow-700">
                          Đang chờ
                        </Badge>
                      ) : invite.status === "accepted" ? (
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Đã chấp nhận
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          Hết hạn
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {teamMembers.length === 0 && pendingInvites.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2 text-gray-900">
                Chưa có thành viên nào
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Mời đồng nghiệp để cùng quản lý đơn hàng
              </p>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setShowInviteModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Mời thành viên đầu tiên
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invite Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mời thành viên mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Nhập email của đồng nghiệp để mời họ tham gia tổ chức
            </p>
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@company.com"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                />
                {emails.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEmailField(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addEmailField}
              className="w-full"
            >
              + Thêm email khác
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Hủy
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleSendInvites}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi lời mời
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamPage;
