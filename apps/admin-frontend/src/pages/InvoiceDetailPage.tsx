// apps/admin-frontend/src/pages/InvoiceDetailPage.tsx
// ✅ Invoice Detail Page - Phase 7.2.2
// Display invoice info, line items, payment status, credit notes

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInvoiceDetail } from "@/hooks/useDocuments";
import { formatCurrency, formatDate } from "@/lib/utils";

// ============================================
// INVOICE DETAIL PAGE
// ============================================

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { invoice, isLoading, fetchInvoice, markAsPaid, generateCreditNote } =
    useInvoiceDetail(invoiceId!);

  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Invoice không tồn tại</div>
      </div>
    );
  }

  /**
   * Get status badge color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Get payment status badge color
   */
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "partially_paid":
        return "bg-orange-100 text-orange-800";
      case "refunded":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  /**
   * Calculate remaining balance
   */
  const remainingBalance =
    invoice.total -
    invoice.paidAmount -
    invoice.creditNotes.reduce((sum, cn) => sum + cn.amount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/invoices")}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-600 mt-1">Order: {invoice.swagOrderNumber}</p>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(
              invoice.status
            )}`}
          >
            {invoice.status}
          </span>
          <span
            className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getPaymentStatusColor(
              invoice.paymentStatus
            )}`}
          >
            {invoice.paymentStatus}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-2">
        {invoice.paymentStatus !== "paid" && (
          <button
            onClick={() => setShowMarkPaidModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Đánh dấu đã thanh toán
          </button>
        )}
        {invoice.paymentStatus === "paid" && remainingBalance > 0 && (
          <button
            onClick={() => setShowCreditNoteModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Tạo Credit Note
          </button>
        )}
        {invoice.pdfUrl && (
          <a
            href={invoice.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tải PDF
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Billing Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin khách hàng
            </h2>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Tên doanh nghiệp:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {invoice.billingInfo.businessName}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Mã số thuế:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {invoice.billingInfo.taxCode}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {invoice.billingInfo.email}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Điện thoại:</span>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {invoice.billingInfo.phone}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Địa chỉ:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {invoice.billingInfo.address}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết hóa đơn
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mô tả
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thành tiền
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-sm text-right text-gray-600"
                  >
                    Tạm tính:
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(invoice.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-sm text-right text-gray-600"
                  >
                    VAT (10%):
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(invoice.taxAmount)}
                  </td>
                </tr>
                {invoice.discountAmount > 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-sm text-right text-gray-600"
                    >
                      Giảm giá:
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                      -{formatCurrency(invoice.discountAmount)}
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 border-gray-300">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-base text-right font-semibold text-gray-900"
                  >
                    Tổng cộng:
                  </td>
                  <td className="px-4 py-3 text-base text-right font-bold text-gray-900">
                    {formatCurrency(invoice.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Credit Notes */}
          {invoice.creditNotes.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Credit Notes
              </h2>
              <div className="space-y-3">
                {invoice.creditNotes.map((cn, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">
                          {cn.creditNoteNumber}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {cn.reason}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(cn.issuedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          -{formatCurrency(cn.amount)}
                        </div>
                        {cn.pdfUrl && (
                          <a
                            href={cn.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 mt-1 inline-block"
                          >
                            Tải PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thanh toán
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tổng hóa đơn:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Đã thanh toán:</span>
                <span className="text-sm font-medium text-green-600">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              {invoice.creditNotes.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Credit notes:</span>
                  <span className="text-sm font-medium text-purple-600">
                    -
                    {formatCurrency(
                      invoice.creditNotes.reduce(
                        (sum, cn) => sum + cn.amount,
                        0
                      )
                    )}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between">
                <span className="text-base font-semibold text-gray-900">
                  Còn lại:
                </span>
                <span className="text-base font-bold text-red-600">
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin ngày
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Ngày phát hành:</span>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(invoice.issueDate)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Hạn thanh toán:</span>
                <div className="text-sm font-medium text-gray-900 mt-1">
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
              {invoice.paidAt && (
                <div>
                  <span className="text-sm text-gray-600">
                    Ngày thanh toán:
                  </span>
                  <div className="text-sm font-medium text-green-600 mt-1">
                    {formatDate(invoice.paidAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          {invoice.paymentMethod && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="text-sm text-gray-900">
                {invoice.paymentMethod}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && (
        <MarkAsPaidModal
          invoice={invoice}
          onClose={() => setShowMarkPaidModal(false)}
          onConfirm={markAsPaid}
        />
      )}

      {/* Credit Note Modal */}
      {showCreditNoteModal && (
        <CreditNoteModal
          invoice={invoice}
          maxAmount={remainingBalance}
          onClose={() => setShowCreditNoteModal(false)}
          onConfirm={generateCreditNote}
        />
      )}
    </div>
  );
}

// ============================================
// MARK AS PAID MODAL
// ============================================

interface MarkAsPaidModalProps {
  invoice: any;
  onClose: () => void;
  onConfirm: (paymentMethod: string, amount?: number) => Promise<any>;
}

function MarkAsPaidModal({
  invoice,
  onClose,
  onConfirm,
}: MarkAsPaidModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [amount, setAmount] = useState(invoice.total.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(paymentMethod, parseFloat(amount));
      onClose();
    } catch (error) {
      console.error("Error marking as paid:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Đánh dấu đã thanh toán
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="bank_transfer">Chuyển khoản</option>
                <option value="cash">Tiền mặt</option>
                <option value="credit_card">Thẻ tín dụng</option>
                <option value="vnpay">VNPay</option>
                <option value="momo">MoMo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền thanh toán
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                step="1000"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// CREDIT NOTE MODAL
// ============================================

interface CreditNoteModalProps {
  invoice: any;
  maxAmount: number;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => Promise<any>;
}

function CreditNoteModal({
  invoice,
  maxAmount,
  onClose,
  onConfirm,
}: CreditNoteModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(parseFloat(amount), reason);
      onClose();
    } catch (error) {
      console.error("Error generating credit note:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Tạo Credit Note
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số tiền hoàn trả
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0"
                max={maxAmount}
                step="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tối đa: {formatCurrency(maxAmount)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
                placeholder="Nhập lý do hoàn tiền..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Tạo Credit Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
