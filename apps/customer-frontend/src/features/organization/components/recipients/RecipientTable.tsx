// src/features/organization/components/recipients/RecipientTable.tsx
// ✅ SOLID: Single Responsibility - Table display only

import React from "react";
import {
  Users,
  MoreHorizontal,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Recipient } from "../../services/recipient.service";

interface RecipientTableProps {
  recipients: Recipient[];
  isLoading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (id: string) => void;
  onEdit?: (recipient: Recipient) => void;
  onSendGift?: (recipient: Recipient) => void;
  onShowEmpty: () => React.ReactNode;
}

export function RecipientTable({
  recipients,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  onEdit,
  onSendGift,
  onShowEmpty,
}: RecipientTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">Chưa có người nhận nào</p>
        <p className="text-sm mb-6">Thêm người nhận hoặc import từ CSV</p>
        <div className="flex gap-3 justify-center">{onShowEmpty()}</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 text-left">
              <button onClick={onToggleSelectAll}>
                {selectedIds.length === recipients.length ? (
                  <CheckSquare className="w-5 h-5 text-orange-500" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Họ tên
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Email
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Phòng ban
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Tags
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-600">
              Quà đã gửi
            </th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient) => (
            <tr key={recipient._id} className="border-b hover:bg-gray-50">
              <td className="p-4">
                <button onClick={() => onToggleSelect(recipient._id)}>
                  {selectedIds.includes(recipient._id) ? (
                    <CheckSquare className="w-5 h-5 text-orange-500" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </td>
              <td className="p-4">
                <div className="font-medium text-gray-900">
                  {recipient.firstName} {recipient.lastName}
                </div>
                {recipient.customFields?.jobTitle && (
                  <div className="text-sm text-gray-500">
                    {recipient.customFields.jobTitle}
                  </div>
                )}
              </td>
              <td className="p-4 text-gray-600">{recipient.email}</td>
              <td className="p-4 text-gray-600">
                {recipient.customFields?.department || "-"}
              </td>
              <td className="p-4">
                <div className="flex gap-1 flex-wrap">
                  {recipient.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {recipient.tags?.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{recipient.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="p-4 text-gray-600">{recipient.totalGiftsSent}</td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit?.(recipient)}>
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSendGift?.(recipient)}>
                      Gửi quà
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(recipient._id)}
                    >
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
