// src/features/organization/components/team/MemberList.tsx
// ✅ Component for displaying team members

import { useState } from "react";
import {
  Users,
  Shield,
  MoreHorizontal,
  Trash2,
  Crown,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { OrganizationMember } from "../../services/organization-member.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface MemberListProps {
  members: OrganizationMember[];
  currentUserId: string;
  onUpdateRole: (userId: string, role: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
  onTransferOwnership?: (userId: string) => Promise<void>;
}

export function MemberList({
  members,
  currentUserId,
  onUpdateRole,
  onRemove,
  onTransferOwnership,
}: MemberListProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      owner: { color: "bg-purple-100 text-purple-700", icon: Crown },
      admin: { color: "bg-blue-100 text-blue-700", icon: Shield },
      member: { color: "bg-gray-100 text-gray-700", icon: Users },
      viewer: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    };

    const variant = variants[role] || variants.member;
    const Icon = variant.icon;

    return (
      <Badge className={variant.color}>
        <Icon className="mr-1 h-3 w-3" />
        {role === "owner" && "Owner"}
        {role === "admin" && "Admin"}
        {role === "member" && "Member"}
        {role === "viewer" && "Viewer"}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status === "invited") {
      return (
        <Badge variant="outline" className="text-orange-600">
          <Clock className="mr-1 h-3 w-3" />
          Đang chờ
        </Badge>
      );
    }
    return null;
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      await onUpdateRole(userId, newRole);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa thành viên này? Họ sẽ mất quyền truy cập vào tổ chức."
      )
    ) {
      return;
    }

    await onRemove(userId);
  };

  const handleTransferOwnership = async (userId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn chuyển quyền sở hữu? Bạn sẽ trở thành Admin và không thể hoàn tác."
      )
    ) {
      return;
    }

    if (onTransferOwnership) {
      await onTransferOwnership(userId);
    }
  };

  return (
    <div className="space-y-4">
      {members.map((member) => {
        const isCurrentUser = member.userId._id === currentUserId;
        const isOwner = member.role === "owner";
        const isInvited = member.status === "invited";

        return (
          <div
            key={member._id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                {member.userId.avatarUrl ? (
                  <img
                    src={member.userId.avatarUrl}
                    alt={member.userId.displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {member.userId.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                {!isInvited && member.userId.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Info */}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {member.userId.displayName}
                    {isCurrentUser && (
                      <span className="ml-2 text-sm text-gray-500">(Bạn)</span>
                    )}
                  </p>
                  {getRoleBadge(member.role)}
                  {getStatusBadge(member.status)}
                </div>
                <p className="text-sm text-gray-500">{member.userId.email}</p>
                {!isInvited && member.userId.lastSeen && (
                  <p className="text-xs text-gray-400">
                    Hoạt động{" "}
                    {formatDistanceToNow(new Date(member.userId.lastSeen), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                )}
                {isInvited && member.invitedAt && (
                  <p className="text-xs text-gray-400">
                    Đã mời{" "}
                    {formatDistanceToNow(new Date(member.invitedAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            {!isOwner && !isInvited && (
              <div className="flex items-center gap-2">
                {/* Role selector */}
                <Select
                  value={member.role}
                  onValueChange={(value) =>
                    handleRoleChange(member.userId._id, value)
                  }
                  disabled={updatingUserId === member.userId._id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                {/* More actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onTransferOwnership && !isCurrentUser && (
                      <>
                        <DropdownMenuItem
                          onClick={() =>
                            handleTransferOwnership(member.userId._id)
                          }
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          Chuyển quyền sở hữu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleRemove(member.userId._id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa thành viên
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {isOwner && (
              <Badge variant="outline" className="text-purple-600">
                <Crown className="mr-1 h-3 w-3" />
                Chủ sở hữu
              </Badge>
            )}

            {isInvited && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(member.userId._id)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
