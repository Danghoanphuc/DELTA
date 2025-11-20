// apps/customer-frontend/src/features/printer/pages/WalletPage.tsx
import { useState } from "react";
import {
  useWalletSummary,
  useTransactions,
  usePayoutRequest,
} from "@/features/printer/hooks/useWallet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Wallet,
  ArrowUpRight,
  History,
  Loader2,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function WalletPage() {
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");

  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: transactionsData, isLoading: transactionsLoading } =
    useTransactions(currentPage, 20, filterType);
  const payoutMutation = usePayoutRequest();

  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);

    if (!amount || amount <= 0) {
      return;
    }

    if (!bankAccountNumber || !bankName) {
      return;
    }

    payoutMutation.mutate(
      {
        amount,
        bankAccountNumber,
        bankName,
      },
      {
        onSuccess: () => {
          setShowPayoutDialog(false);
          setPayoutAmount("");
          setBankAccountNumber("");
          setBankName("");
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PAID: "default",
      PENDING: "secondary",
      UNPAID: "outline",
      CANCELLED: "destructive",
    };

    const labels: Record<string, string> = {
      PAID: "Đã thanh toán",
      PENDING: "Đang xử lý",
      UNPAID: "Chưa thanh toán",
      CANCELLED: "Đã hủy",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SALE: "Doanh thu",
      PAYOUT: "Rút tiền",
      REFUND: "Hoàn tiền",
      ADJUSTMENT: "Điều chỉnh",
    };
    return labels[type] || type;
  };

  if (summaryLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ví của tôi</h1>
          <p className="text-gray-600">
            Quản lý số dư và lịch sử giao dịch của bạn
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance */}
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số dư khả dụng</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {formatCurrency(summary?.availableBalance || 0)}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowPayoutDialog(true)}
                    disabled={!summary?.nextPayoutEligible}
                    className="mt-2"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Rút tiền
                  </Button>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                  <Wallet className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Balance */}
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang chờ xử lý</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary?.pendingBalance || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng doanh thu</p>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary?.totalRevenue || 0)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-gray-600" />
                <CardTitle>Lịch sử giao dịch</CardTitle>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="SALE">Doanh thu</SelectItem>
                  <SelectItem value="PAYOUT">Rút tiền</SelectItem>
                  <SelectItem value="REFUND">Hoàn tiền</SelectItem>
                  <SelectItem value="ADJUSTMENT">Điều chỉnh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : transactionsData?.transactions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có giao dịch nào</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData?.transactions.map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">
                          {format(
                            new Date(transaction.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.notes ||
                            (transaction.masterOrder
                              ? `Đơn hàng #${transaction.masterOrder.orderNumber}`
                              : "Không có mô tả")}
                        </TableCell>
                        <TableCell>
                          {getTransactionTypeLabel(transaction.transactionType)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            transaction.amount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.amount >= 0 ? "+" : ""}
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {transactionsData && transactionsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-600">
                      Trang {transactionsData.pagination.currentPage} /{" "}
                      {transactionsData.pagination.totalPages} (
                      {transactionsData.pagination.totalItems} giao dịch)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={
                          currentPage === transactionsData.pagination.totalPages
                        }
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Nhập thông tin tài khoản ngân hàng để rút tiền. Thời gian xử lý:
              1-3 ngày làm việc.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền rút</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Nhập số tiền"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="100000"
                max={summary?.availableBalance}
              />
              <p className="text-xs text-gray-500">
                Số dư khả dụng: {formatCurrency(summary?.availableBalance || 0)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Ngân hàng</Label>
              <Input
                id="bankName"
                placeholder="Ví dụ: Vietcombank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccount">Số tài khoản</Label>
              <Input
                id="bankAccount"
                placeholder="Nhập số tài khoản"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPayoutDialog(false)}
              disabled={payoutMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePayoutRequest}
              disabled={
                payoutMutation.isPending ||
                !payoutAmount ||
                !bankAccountNumber ||
                !bankName
              }
            >
              {payoutMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Xác nhận rút tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

