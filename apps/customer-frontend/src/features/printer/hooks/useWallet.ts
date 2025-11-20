// apps/customer-frontend/src/features/printer/hooks/useWallet.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/shared/lib/axios";
import { toast } from "sonner";

interface WalletSummary {
  availableBalance: number;
  pendingBalance: number;
  totalRevenue: number;
  lastPayoutDate: string | null;
  nextPayoutEligible: boolean;
}

interface Transaction {
  _id: string;
  amount: number;
  transactionType: "SALE" | "PAYOUT" | "REFUND" | "ADJUSTMENT";
  status: "UNPAID" | "PAID" | "PENDING" | "CANCELLED";
  masterOrder?: {
    _id: string;
    orderNumber: string;
  };
  notes?: string;
  createdAt: string;
  paidAt?: string;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

interface PayoutRequest {
  amount: number;
  bankAccountNumber: string;
  bankName: string;
}

interface PayoutResponse {
  transactionId: string;
  amount: number;
  status: string;
  estimatedProcessingTime: string;
  createdAt: string;
}

/**
 * Hook để lấy tóm tắt ví
 */
export function useWalletSummary() {
  return useQuery<WalletSummary>({
    queryKey: ["wallet", "summary"],
    queryFn: async () => {
      const response = await api.get("/wallet/summary");
      return response.data.data;
    },
  });
}

/**
 * Hook để lấy danh sách giao dịch
 */
export function useTransactions(
  page: number = 1,
  limit: number = 20,
  type: string = "all",
  startDate?: string,
  endDate?: string
) {
  return useQuery<TransactionsResponse>({
    queryKey: ["wallet", "transactions", page, limit, type, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        type,
      });

      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get(`/wallet/transactions?${params.toString()}`);
      return response.data.data;
    },
  });
}

/**
 * Hook để tạo yêu cầu rút tiền
 */
export function usePayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation<PayoutResponse, Error, PayoutRequest>({
    mutationFn: async (data: PayoutRequest) => {
      const response = await api.post("/wallet/payout-request", data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate queries để refresh data
      queryClient.invalidateQueries({ queryKey: ["wallet", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      
      toast.success("Yêu cầu rút tiền đã được gửi thành công!", {
        description: "Chúng tôi sẽ xử lý trong 1-3 ngày làm việc",
      });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo yêu cầu rút tiền";
      toast.error("Rút tiền thất bại", {
        description: message,
      });
    },
  });
}

