# Document Management UI - Quick Start Guide

## Overview

Phase 7.2 Frontend UI cho Document Management đã hoàn thành. Hệ thống cho phép admin quản lý invoices, credit notes, và documents liên quan đến orders.

## Files Created

### Services

- `src/services/admin.document.service.ts` - API service cho document operations
  - generateInvoice()
  - generateCreditNote()
  - generateDeliveryNote()
  - generatePackingSlip()
  - getOrderDocuments()
  - getInvoice()
  - getInvoices()
  - markInvoiceAsPaid()

### Hooks

- `src/hooks/useDocuments.ts` - Custom hooks cho document management
  - useInvoices() - Quản lý danh sách invoices
  - useInvoiceDetail() - Quản lý chi tiết invoice
  - useOrderDocuments() - Quản lý documents của order

### Pages

- `src/pages/InvoiceListPage.tsx` - Danh sách invoices với filtering
- `src/pages/InvoiceDetailPage.tsx` - Chi tiết invoice với actions

### Utilities

- `src/lib/utils.ts` - Common utility functions
  - formatCurrency()
  - formatDate()
  - formatDateTime()
  - isOverdue()
  - getDaysUntilDue()
  - và nhiều helpers khác

## Features Implemented

### Invoice List Page

**Requirements: 10.1**

- Display invoices với status badges
- Filter by:
  - Status (draft, sent, paid, overdue, cancelled)
  - Payment status (unpaid, paid, partially_paid, refunded)
  - Date range (start date, end date)
- Summary statistics:
  - Tổng invoices
  - Tổng tiền
  - Đã thanh toán
  - Chưa thanh toán
- Actions:
  - View invoice detail
  - Download PDF

### Invoice Detail Page

**Requirements: 10.2, 10.3**

- Display invoice information:
  - Invoice number, order number
  - Billing info (business name, tax code, address, email, phone)
  - Line items với quantities, prices, amounts
  - Subtotal, tax, discount, total
  - Payment status và payment method
  - Issue date, due date, paid date
- Payment summary:
  - Tổng hóa đơn
  - Đã thanh toán
  - Credit notes
  - Còn lại
- Actions:
  - Mark as paid (nếu chưa thanh toán)
  - Generate credit note (nếu đã thanh toán)
  - Download PDF
- Credit notes display:
  - Credit note number
  - Amount
  - Reason
  - Issue date
  - Download PDF

### Modals

- **Mark as Paid Modal**:
  - Select payment method
  - Enter amount
  - Confirm payment
- **Credit Note Modal**:
  - Enter refund amount (max = remaining balance)
  - Enter reason
  - Generate credit note

## API Integration

### Endpoints Used

```typescript
// Get invoices
GET /api/admin/documents/invoices?organizationId=&status=&paymentStatus=&startDate=&endDate=

// Get invoice detail
GET /api/admin/documents/invoice/:invoiceId

// Generate invoice
POST /api/admin/documents/invoice/:orderId
Body: { dueInDays?: number }

// Mark as paid
POST /api/admin/documents/invoice/:invoiceId/mark-paid
Body: { paymentMethod: string, amount?: number }

// Generate credit note
POST /api/admin/documents/credit-note/:invoiceId
Body: { amount: number, reason: string }

// Get order documents
GET /api/admin/documents/:orderId
```

## Usage Examples

### 1. View Invoice List

```typescript
import InvoiceListPage from "@/pages/InvoiceListPage";

// In router
<Route path="/invoices" element={<InvoiceListPage />} />;
```

### 2. View Invoice Detail

```typescript
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";

// In router
<Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />;
```

### 3. Use Invoice Hook

```typescript
import { useInvoices } from "@/hooks/useDocuments";

function MyComponent() {
  const { invoices, isLoading, filters, setFilters, fetchInvoices } =
    useInvoices();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <div>
      {invoices.map((invoice) => (
        <div key={invoice._id}>{invoice.invoiceNumber}</div>
      ))}
    </div>
  );
}
```

### 4. Generate Invoice

```typescript
import { useInvoices } from "@/hooks/useDocuments";

function OrderDetailPage() {
  const { generateInvoice } = useInvoices();

  const handleGenerateInvoice = async () => {
    try {
      const invoice = await generateInvoice(orderId, 30); // 30 days due
      console.log("Invoice created:", invoice);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleGenerateInvoice}>Generate Invoice</button>;
}
```

### 5. Mark Invoice as Paid

```typescript
import { useInvoiceDetail } from "@/hooks/useDocuments";

function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  const { markAsPaid } = useInvoiceDetail(invoiceId);

  const handleMarkAsPaid = async () => {
    try {
      await markAsPaid("bank_transfer", 1000000);
      console.log("Marked as paid");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleMarkAsPaid}>Mark as Paid</button>;
}
```

### 6. Generate Credit Note

```typescript
import { useInvoiceDetail } from "@/hooks/useDocuments";

function CreditNoteButton({ invoiceId }: { invoiceId: string }) {
  const { generateCreditNote } = useInvoiceDetail(invoiceId);

  const handleGenerateCreditNote = async () => {
    try {
      await generateCreditNote(500000, "Refund for damaged items");
      console.log("Credit note created");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return <button onClick={handleGenerateCreditNote}>Create Credit Note</button>;
}
```

## Styling

Components sử dụng Tailwind CSS với design system nhất quán:

- **Colors**:
  - Primary: blue-600
  - Success: green-600
  - Warning: yellow-600
  - Danger: red-600
  - Purple: purple-600 (cho credit notes)
- **Status Badges**:
  - Paid: green-100/green-800
  - Unpaid: yellow-100/yellow-800
  - Overdue: red-100/red-800
  - Draft: gray-100/gray-800
- **Typography**:
  - Headings: font-bold text-gray-900
  - Body: text-gray-600
  - Labels: text-sm font-medium text-gray-700

## Error Handling

Tất cả operations đều có error handling với toast notifications:

```typescript
try {
  await documentService.generateInvoice(orderId);
  toast.success("Đã tạo invoice thành công!");
} catch (error: any) {
  toast.error(error.response?.data?.message || "Không thể tạo invoice");
  console.error("Error:", error);
}
```

## Next Steps

### Integration với Router

Thêm routes vào admin router:

```typescript
// In admin router
import InvoiceListPage from "@/pages/InvoiceListPage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";

<Route path="/invoices" element={<InvoiceListPage />} />
<Route path="/invoices/:invoiceId" element={<InvoiceDetailPage />} />
```

### Add to Navigation

Thêm link vào sidebar navigation:

```typescript
<NavLink to="/invoices">
  <FileText className="w-5 h-5" />
  <span>Invoices</span>
</NavLink>
```

### PDF Generation (Future)

Backend cần implement PDF generation:

- Sử dụng library như `pdfkit` hoặc `puppeteer`
- Generate PDF từ invoice data
- Upload to S3
- Return PDF URL

### Email Sending (Future)

Backend cần implement email sending:

- Send invoice email to customer
- Include PDF attachment
- Track email status

## Testing

### Manual Testing Checklist

- [ ] View invoice list
- [ ] Filter invoices by status
- [ ] Filter invoices by payment status
- [ ] Filter invoices by date range
- [ ] View invoice detail
- [ ] Mark invoice as paid
- [ ] Generate credit note
- [ ] Download PDF (khi có)
- [ ] View credit notes
- [ ] Check payment summary calculations
- [ ] Check remaining balance calculations

### Test Data

Sử dụng existing swag orders để generate invoices:

```bash
# Generate invoice for order
POST /api/admin/documents/invoice/:orderId
```

## Troubleshooting

### Invoice không hiển thị

- Check API response trong Network tab
- Verify organizationId filter
- Check invoice status

### Mark as paid không work

- Verify invoice chưa paid
- Check payment method valid
- Check amount > 0

### Credit note không tạo được

- Verify invoice đã paid
- Check amount <= remaining balance
- Verify reason không empty

## Requirements Coverage

- ✅ **10.1**: Invoice list với filtering và display
- ✅ **10.2**: Invoice detail với payment status và mark as paid
- ✅ **10.3**: Credit note generation với reason
- ✅ **8.4**: Packing slip generation (via useOrderDocuments hook)

## Summary

Phase 7.2 Frontend UI đã hoàn thành với:

- 2 pages (Invoice List, Invoice Detail)
- 1 service (DocumentService)
- 3 custom hooks (useInvoices, useInvoiceDetail, useOrderDocuments)
- 2 modals (Mark as Paid, Credit Note)
- 1 utility file (utils.ts)
- Full error handling và loading states
- Responsive design với Tailwind CSS
- Toast notifications cho user feedback

Hệ thống sẵn sàng để integrate với router và navigation!
