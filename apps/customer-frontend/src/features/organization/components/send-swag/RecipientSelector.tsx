// src/features/organization/components/send-swag/RecipientSelector.tsx
// ✅ SOLID: Single Responsibility - Recipient selection only

import { useState } from "react";
import { Search, Users, CheckSquare, Square, Loader2 } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Recipient } from "../../services/swag-order.service";

interface RecipientSelectorProps {
  recipients: Recipient[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (filteredIds: string[]) => void;
  isLoading: boolean;
}

export function RecipientSelector({
  recipients,
  selectedIds,
  onToggle,
  onToggleAll,
  isLoading,
}: RecipientSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredRecipients = recipients.filter((r) =>
    `${r.firstName} ${r.lastName} ${r.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredIds = filteredRecipients.map((r) => r._id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chọn người nhận</h2>
        <Badge variant="secondary">{selectedIds.length} đã chọn</Badge>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => onToggleAll(filteredIds)}>
          {selectedIds.length === filteredIds.length
            ? "Bỏ chọn tất cả"
            : "Chọn tất cả"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : filteredRecipients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Chưa có người nhận nào. Hãy thêm người nhận trước.</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {filteredRecipients.map((recipient) => (
            <button
              key={recipient._id}
              onClick={() => onToggle(recipient._id)}
              className={`w-full p-3 flex items-center gap-3 border-b last:border-b-0 hover:bg-gray-50 ${
                selectedIds.includes(recipient._id) ? "bg-orange-50" : ""
              }`}
            >
              {selectedIds.includes(recipient._id) ? (
                <CheckSquare className="w-5 h-5 text-orange-500 flex-shrink-0" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">
                  {recipient.firstName} {recipient.lastName}
                </p>
                <p className="text-sm text-gray-500">{recipient.email}</p>
              </div>
              {recipient.customFields?.department && (
                <Badge variant="secondary" className="text-xs">
                  {recipient.customFields.department}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
