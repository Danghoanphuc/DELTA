// src/features/organization/pages/TeamPage.tsx
// ✅ SOLID Refactored - B2B Organization Team Management

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
import { useAuthStore } from "@/stores/useAuthStore";
import { useTeamMembers } from "../hooks";

const ROLE_LABELS: Record<string, string> = {
  owner: "Chủ sở hữu",
  admin: "Quản trị viên",
  member: "Thành viên",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-[#FFF5F3] text-[#C63321]",
  admin: "bg-blue-100 text-blue-700",
  member: "bg-[#F7F6F2] text-[#44403C]",
};

export function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const { pendingInvites, teamMembers, isSubmitting, sendInvites, formatDate } =
    useTeamMembers();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [emails, setEmails] = useState<string[]>([""]);

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

  // Handle send invites
  const handleSendInvites = async () => {
    const success = await sendInvites(emails);
    if (success) {
      setShowInviteModal(false);
      setEmails([""]);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">
              Thành viên
            </h1>
            <p className="text-[#57534E]">
              Quản lý thành viên trong tổ chức của bạn
            </p>
          </div>
          <Button
            className="bg-[#C63321] hover:bg-[#A82A1A]"
            onClick={() => setShowInviteModal(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Mời thành viên
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-serif font-bold text-[#1C1917]">
                {teamMembers.length + 1}
              </p>
              <p className="text-sm text-[#78716C]">Thành viên</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {pendingInvites.filter((i) => i.status === "pending").length}
              </p>
              <p className="text-sm text-[#78716C]">Đang chờ</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {pendingInvites.filter((i) => i.status === "accepted").length}
              </p>
              <p className="text-sm text-[#78716C]">Đã chấp nhận</p>
            </CardContent>
          </Card>
        </div>

        {/* Current User (Owner) */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#C63321]" />
              Quản trị viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-[#FFF5F3] rounded-lg">
              <div className="w-12 h-12 rounded-full bg-[#C63321] flex items-center justify-center text-white font-bold text-lg">
                {user?.displayName?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#1C1917]">
                  {user?.displayName}
                </p>
                <p className="text-sm text-[#78716C]">{user?.email}</p>
              </div>
              <Badge className={ROLE_COLORS.owner}>{ROLE_LABELS.owner}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-6">
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
                    className="flex items-center justify-between p-4 bg-[#FAFAF8] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {member.user?.displayName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-[#1C1917]">
                          {member.user?.displayName || "Unknown"}
                        </p>
                        <p className="text-sm text-[#78716C]">
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
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-6">
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
                        <p className="font-medium text-[#1C1917]">
                          {invite.email}
                        </p>
                        <p className="text-sm text-[#78716C] flex items-center gap-1">
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
          <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-[#E5E3DC]" />
              <p className="text-lg font-medium mb-2 text-[#1C1917]">
                Chưa có thành viên nào
              </p>
              <p className="text-sm text-[#78716C] mb-6">
                Mời đồng nghiệp để cùng quản lý đơn hàng
              </p>
              <Button
                className="bg-[#C63321] hover:bg-[#A82A1A]"
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
            <p className="text-sm text-[#78716C]">
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
              className="bg-[#C63321] hover:bg-[#A82A1A]"
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
