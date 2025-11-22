// src/features/printer/pages/WalletPage.tsx
import { useState } from "react";
import {
  useWalletSummary,
  useTransactions,
  usePayoutRequest,
} from "@/features/printer/hooks/useWallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import {
  Wallet, ArrowUpRight, History, Loader2, TrendingUp, Clock, 
  CreditCard, Download, DollarSign, Banknote
} from "lucide-react";
import { formatCurrency } from "@/shared/utils/formatCurrency";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/shared/lib/utils";

export function WalletPage() {
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState("all");

  const { data: summary, isLoading: summaryLoading } = useWalletSummary();
  const { data: transactionsData, isLoading: transactionsLoading } = useTransactions(currentPage, 20, filterType);
  const payoutMutation = usePayoutRequest();

  const handlePayoutRequest = () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0 || !bankAccountNumber || !bankName) return;
    payoutMutation.mutate({ amount, bankAccountNumber, bankName }, {
        onSuccess: () => {
          setShowPayoutDialog(false);
          setPayoutAmount(""); setBankAccountNumber(""); setBankName("");
        },
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAID: "bg-green-100 text-green-700 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      UNPAID: "bg-gray-100 text-gray-700 border-gray-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200",
    };
    return <Badge variant="outline" className={cn("font-medium border capitalize", styles[status])}>{status.toLowerCase()}</Badge>;
  };

  if (summaryLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>;

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
         <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="text-orange-600" /> Ví doanh thu
               </h1>
               <p className="text-sm text-gray-500 mt-1">Quản lý dòng tiền và rút tiền về tài khoản.</p>
            </div>
            <Button variant="outline" className="bg-white border-gray-200 text-gray-700 shadow-sm">
               <Download size={16} className="mr-2" /> Xuất báo cáo
            </Button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
         <div className="max-w-7xl mx-auto space-y-8">
            
            {/* MONEY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* 1. Main Balance (Dark Card) */}
               <div className="md:col-span-1 bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group h-48 flex flex-col justify-between">
                  <div className="absolute right-0 top-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity"><Wallet size={100} /></div>
                  <div>
                     <p className="text-gray-400 text-sm font-medium mb-1 flex items-center gap-2">Số dư khả dụng</p>
                     <h3 className="text-4xl font-bold tracking-tight text-white">{formatCurrency(summary?.availableBalance || 0)}</h3>
                  </div>
                  <Button 
                     onClick={() => setShowPayoutDialog(true)} 
                     disabled={!summary?.nextPayoutEligible}
                     className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold mt-4"
                  >
                     Rút tiền ngay <ArrowUpRight size={16} className="ml-1" />
                  </Button>
               </div>

               {/* 2. Stats Cards */}
               <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all h-48 flex flex-col justify-center">
                     <CardContent className="p-6 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                           <Clock size={28} />
                        </div>
                        <div>
                           <p className="text-sm text-gray-500 font-medium">Đang chờ xử lý</p>
                           <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.pendingBalance || 0)}</h3>
                           <p className="text-xs text-gray-400 mt-1">Sẽ khả dụng sau khi đơn hoàn tất</p>
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all h-48 flex flex-col justify-center">
                     <CardContent className="p-6 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                           <TrendingUp size={28} />
                        </div>
                        <div>
                           <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                           <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(summary?.totalRevenue || 0)}</h3>
                           <p className="text-xs text-gray-400 mt-1">Tính từ lúc bắt đầu</p>
                        </div>
                     </CardContent>
                  </Card>
               </div>
            </div>

            {/* TRANSACTIONS */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                     <History className="text-gray-400" size={20}/> Lịch sử giao dịch
                  </h2>
                  <Select value={filterType} onValueChange={setFilterType}>
                     <SelectTrigger className="w-[160px] h-9 bg-white rounded-lg border-gray-200">
                        <SelectValue placeholder="Loại giao dịch" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="SALE">Doanh thu</SelectItem>
                        <SelectItem value="PAYOUT">Rút tiền</SelectItem>
                        <SelectItem value="REFUND">Hoàn tiền</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden rounded-xl">
                  <CardContent className="p-0">
                     {transactionsLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /></div>
                     ) : transactionsData?.transactions.length === 0 ? (
                        <div className="text-center py-16">
                           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Banknote className="text-gray-300 w-8 h-8" />
                           </div>
                           <p className="text-gray-500">Chưa có giao dịch nào</p>
                        </div>
                     ) : (
                        <Table>
                           <TableHeader className="bg-gray-50/50">
                              <TableRow>
                                 <TableHead>Thời gian</TableHead>
                                 <TableHead>Nội dung</TableHead>
                                 <TableHead>Loại</TableHead>
                                 <TableHead className="text-right">Số tiền</TableHead>
                                 <TableHead className="text-right">Trạng thái</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {transactionsData?.transactions.map((tx) => (
                                 <TableRow key={tx._id} className="hover:bg-gray-50/50">
                                    <TableCell className="text-xs text-gray-500 font-medium">
                                       {format(new Date(tx.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                                    </TableCell>
                                    <TableCell className="font-medium text-gray-900">
                                       {tx.notes || (tx.masterOrder ? `Đơn hàng #${tx.masterOrder.orderNumber}` : "Giao dịch hệ thống")}
                                    </TableCell>
                                    <TableCell>
                                       <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600">{tx.transactionType}</span>
                                    </TableCell>
                                    <TableCell className={cn("text-right font-bold", tx.amount >= 0 ? "text-green-600" : "text-red-600")}>
                                       {tx.amount > 0 ? "+" : ""}{formatCurrency(tx.amount)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                       {getStatusBadge(tx.status)}
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     )}
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>

      {/* Payout Dialog (Giữ nguyên logic cũ) */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Yêu cầu rút tiền</DialogTitle>
            <DialogDescription>Tiền sẽ về tài khoản trong 1-3 ngày làm việc.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Số tiền rút</Label>
              <div className="relative">
                 <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                 <Input id="amount" type="number" className="pl-9" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} />
              </div>
              <p className="text-xs text-gray-500">Tối đa: {formatCurrency(summary?.availableBalance || 0)}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bank">Ngân hàng</Label>
              <Input id="bank" placeholder="VD: Vietcombank" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="account">Số tài khoản</Label>
              <Input id="account" placeholder="Số tài khoản" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Hủy</Button>
            <Button onClick={handlePayoutRequest} disabled={payoutMutation.isPending}>
               {payoutMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}