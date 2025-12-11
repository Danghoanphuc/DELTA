# Template Feature - Quick Start Guide

## Overview

The Template feature allows customers to:

- ✅ Save completed orders as reusable templates
- ✅ View and manage template library
- ✅ Reorder from templates with smart availability checking
- ✅ Handle discontinued products with substitute suggestions

## File Structure

```
features/templates/
├── services/
│   └── template.service.ts       # API calls
├── hooks/
│   └── useTemplates.ts            # State management hooks
├── pages/
│   ├── TemplateLibraryPage.tsx   # Template list view
│   └── TemplateReorderPage.tsx   # Reorder flow
├── components/
│   └── SaveAsTemplateModal.tsx   # Create template modal
├── index.ts                       # Exports
└── QUICK_START.md                 # This file
```

## Components

### 1. TemplateLibraryPage

**Purpose**: Display all templates with filtering and actions

**Features**:

- Grid view of templates
- Filter by type (welcome_kit, event_swag, etc.)
- Usage statistics display
- Quick actions (reorder, edit, delete)

**Usage**:

```tsx
import { TemplateLibraryPage } from "@/features/templates";

// In your router
<Route path="/templates" element={<TemplateLibraryPage />} />;
```

### 2. SaveAsTemplateModal

**Purpose**: Create template from completed order

**Features**:

- Template name and description
- Type selection
- Public/private toggle
- Form validation

**Usage**:

```tsx
import { SaveAsTemplateModal } from "@/features/templates";

function OrderDetailPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button onClick={() => setShowModal(true)}>Lưu làm Template</button>

      <SaveAsTemplateModal
        orderId={order._id}
        orderName={order.name}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          // Handle success
          navigate("/templates");
        }}
      />
    </>
  );
}
```

### 3. TemplateReorderPage

**Purpose**: Reorder from template with substitution handling

**Features**:

- Load template with availability check
- Display unavailable products
- Show substitute suggestions
- Quantity adjustment
- Proceed to order creation

**Usage**:

```tsx
import { TemplateReorderPage } from "@/features/templates";

// In your router
<Route
  path="/templates/:templateId/reorder"
  element={<TemplateReorderPage />}
/>;
```

## Hooks

### useTemplates()

**Purpose**: Manage template CRUD operations

**Returns**:

```typescript
{
  templates: ProductTemplate[];
  isLoading: boolean;
  error: string | null;
  fetchTemplates: (filters?) => Promise<void>;
  createFromOrder: (orderId, data) => Promise<ProductTemplate>;
  updateTemplate: (id, data) => Promise<ProductTemplate>;
  deleteTemplate: (id) => Promise<void>;
}
```

**Example**:

```tsx
function TemplateList() {
  const { templates, isLoading, fetchTemplates } = useTemplates();

  useEffect(() => {
    fetchTemplates({ type: "welcome_kit", isActive: true });
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div>
      {templates.map((template) => (
        <TemplateCard key={template._id} template={template} />
      ))}
    </div>
  );
}
```

### useTemplateReorder()

**Purpose**: Handle template reorder flow

**Returns**:

```typescript
{
  templateData: LoadTemplateResult | null;
  substitutes: Record<string, SubstituteProduct[]>;
  isLoading: boolean;
  error: string | null;
  loadTemplate: (templateId) => Promise<LoadTemplateResult>;
  updateSubstitutes: (templateId, productId, substituteIds) => Promise<void>;
}
```

**Example**:

```tsx
function ReorderFlow() {
  const { templateData, substitutes, loadTemplate } = useTemplateReorder();

  useEffect(() => {
    loadTemplate(templateId);
  }, [templateId]);

  if (!templateData) return <Loading />;

  const { template, availability } = templateData;

  return (
    <div>
      {!availability.allAvailable && (
        <Alert>Some products are unavailable</Alert>
      )}
      {/* Render template items and substitutes */}
    </div>
  );
}
```

## Service Methods

### templateService.createFromOrder()

```typescript
const template = await templateService.createFromOrder(orderId, {
  name: "Welcome Kit 2024",
  description: "Standard welcome kit",
  type: "welcome_kit",
  isPublic: false,
});
```

### templateService.loadForReorder()

```typescript
const result = await templateService.loadForReorder(templateId);

// result = {
//   template: {...},
//   availability: {
//     allAvailable: false,
//     unavailableProducts: [...]
//   },
//   needsUpdate: true
// }
```

### templateService.getSuggestedSubstitutes()

```typescript
const substitutes = await templateService.getSuggestedSubstitutes(
  templateId,
  productId
);

// substitutes = [
//   {
//     productId: "...",
//     productName: "Alternative Product",
//     reason: "Similar price and quality",
//     priceDifference: 5000,
//     isInStock: true
//   }
// ]
```

## User Flows

### Flow 1: Save Order as Template

1. User completes an order
2. User clicks "Lưu làm Template" button
3. SaveAsTemplateModal opens
4. User fills in template details
5. User clicks "Lưu Template"
6. Template is created
7. User is redirected to template library

### Flow 2: Reorder from Template

1. User navigates to template library
2. User clicks "Đặt lại đơn hàng" on a template
3. System loads template and checks availability
4. If products unavailable:
   - System shows substitute suggestions
   - User selects substitutes
5. User adjusts quantities if needed
6. User clicks "Tiếp tục đặt hàng"
7. User is redirected to order creation with template data

### Flow 3: Manage Templates

1. User navigates to template library
2. User can:
   - Filter by type
   - View usage statistics
   - Edit template details
   - Delete templates
   - Reorder from templates

## Integration with Order Flow

### Creating Order from Template

```tsx
// In order creation page
function CreateOrderPage() {
  const location = useLocation();
  const fromTemplate = location.state?.fromTemplate;

  useEffect(() => {
    if (fromTemplate) {
      // Pre-fill order form with template data
      const { templateId, substitutes, quantities } = fromTemplate;

      // Load template items
      // Apply substitutes
      // Set quantities
      // Pre-fill customization
    }
  }, [fromTemplate]);

  // ... rest of order creation logic
}
```

## Styling

All components use Tailwind CSS with consistent design:

- Primary color: Blue (blue-600)
- Success: Green
- Warning: Yellow
- Error: Red
- Neutral: Gray

## Error Handling

All API calls use toast notifications:

```typescript
try {
  await templateService.createFromOrder(orderId, data);
  toast.success("Đã tạo template thành công!");
} catch (err) {
  toast.error(err.response?.data?.message || "Không thể tạo template");
}
```

## Best Practices

1. **Always check availability** before proceeding with reorder
2. **Show clear warnings** for unavailable products
3. **Provide substitute options** with reasons
4. **Allow quantity adjustment** during reorder
5. **Maintain template usage stats** for analytics
6. **Use loading states** for better UX
7. **Handle errors gracefully** with user-friendly messages

## Testing

### Component Tests

```typescript
describe("TemplateLibraryPage", () => {
  it("should display templates", () => {
    render(<TemplateLibraryPage />);
    expect(screen.getByText("Template Library")).toBeInTheDocument();
  });

  it("should filter by type", () => {
    // Test filtering logic
  });
});
```

### Hook Tests

```typescript
describe("useTemplates", () => {
  it("should fetch templates", async () => {
    const { result } = renderHook(() => useTemplates());
    await act(async () => {
      await result.current.fetchTemplates();
    });
    expect(result.current.templates).toHaveLength(3);
  });
});
```

## Next Steps

- [ ] Add template sharing between organizations
- [ ] Implement template versioning
- [ ] Add template analytics dashboard
- [ ] Support bulk template operations
- [ ] Add template export/import

## Summary

The Template feature provides a complete UI for:

- Creating reusable templates from orders
- Managing template library
- Smart reordering with availability checking
- Handling discontinued products with substitutes

All components follow existing patterns and integrate seamlessly with the order flow.
