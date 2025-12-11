// src/hooks/usePrinterVetting.ts
// ✅ SOLID: Single Responsibility - State management cho Printer Vetting

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingPrinters,
  verifyPrinter,
} from "@/services/admin.printer.service";
import { useToast } from "./use-toast";

export function usePrinterVetting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Fetch pending printers
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["pendingPrinters", page],
    queryFn: () => getPendingPrinters(page),
  });

  // Verify printer mutation
  const verifyMutation = useMutation({
    mutationFn: verifyPrinter,
    onSuccess: (data, variables) => {
      const action = variables.action === "approve" ? "chấp thuận" : "từ chối";
      toast({
        title: "Thành công",
        description: `Đã ${action} nhà in ${data.businessName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["pendingPrinters"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Lỗi",
        description: `Lỗi: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  // Approve printer
  const approvePrinter = (printerId: string) => {
    if (!window.confirm("Bạn có chắc muốn CHẤP THUẬN nhà in này?")) return;
    verifyMutation.mutate({ printerId, action: "approve" });
  };

  // Reject printer
  const rejectPrinter = (printerId: string) => {
    const reason = window.prompt(
      "Vui lòng nhập LÝ DO TỪ CHỐI (Bắt buộc). Lý do này sẽ được gửi email cho nhà in."
    );

    if (!reason || reason.trim().length === 0) {
      toast({
        title: "Lỗi",
        description: "Hủy bỏ hành động. Lý do từ chối là bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate({
      printerId,
      action: "reject",
      reason: reason.trim(),
    });
  };

  return {
    printers: data?.data || [],
    pagination: {
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
    },
    isLoading,
    isError,
    error,
    isProcessing: verifyMutation.isPending,
    page,
    setPage,
    approvePrinter,
    rejectPrinter,
  };
}
