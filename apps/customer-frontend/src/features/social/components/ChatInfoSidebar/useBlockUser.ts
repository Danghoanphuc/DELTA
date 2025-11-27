// apps/customer-frontend/src/features/social/components/ChatInfoSidebar/useBlockUser.ts
// ✅ Custom hook cho block/unblock user logic

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { blockUser, unblockUser, getConnectionStatus } from "@/services/api/connection.api.service";
import { toast } from "@/shared/utils/toast";

export function useBlockUser(partnerId: string | undefined, isGroup: boolean) {
  const [isBlocked, setIsBlocked] = useState(false);

  // Fetch initial block status
  useEffect(() => {
    if (partnerId && !isGroup) {
      getConnectionStatus(partnerId).then((res) => {
        if (res.data?.status === "blocked") {
          setIsBlocked(true);
        }
      });
    }
  }, [partnerId, isGroup]);

  const mutation = useMutation({
    mutationFn: ({ userId, isBlocking }: { userId: string; isBlocking: boolean }) =>
      isBlocking ? blockUser(userId) : unblockUser(userId),
    onSuccess: (_, variables) => {
      setIsBlocked(variables.isBlocking);
      toast.success(variables.isBlocking ? "Đã chặn người dùng" : "Đã bỏ chặn người dùng");
    },
    onError: () => {
      toast.error("Không thể thực hiện thao tác");
    },
  });

  const toggleBlock = (userId: string) => {
    if (isBlocked) {
      // Unblock
      mutation.mutate({ userId, isBlocking: false });
    } else {
      // Return true để show confirm dialog
      return true;
    }
    return false;
  };

  const confirmBlock = (userId: string) => {
    mutation.mutate({ userId, isBlocking: true });
  };

  return {
    isBlocked,
    toggleBlock,
    confirmBlock,
    isPending: mutation.isPending,
  };
}

