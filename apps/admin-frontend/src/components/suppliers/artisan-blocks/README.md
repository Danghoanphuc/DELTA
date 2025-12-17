# THE ARTISAN BLOCK System

Hệ thống CMS block-based cho bài viết Magazine.

## Cấu trúc Block

Mỗi bài viết được lắp ghép từ các "khối Lego":

### 1. Text Block

- Tối đa 300 ký tự
- Cảnh báo đỏ nếu quá 5 dòng
- Bot Summary (ẩn/hiện) cho AI/SEO

### 2. Media Block

Chọn 1 trong 3 loại:

- **Ảnh Macro**: Zoom chi tiết sản phẩm
- **Audio**: File .mp3 tiếng gõ, chất liệu
- **Video Loop**: GIF 5s xoay sản phẩm

### 3. Curator Note (Box vàng)

- Góc nhìn cá nhân của tác giả
- Tối đa 500 ký tự
- Hiển thị nổi bật với nền vàng

### 4. Comparison Table

- Tối đa 3 cột (mobile-first)
- Tối đa 10 hàng
- Không merge cells

## Data Structure

```typescript
interface ArtisanBlock {
  id: string;
  type: "text" | "media" | "curator_note" | "comparison_table";
  order: number;
  content: {
    // Varies by type
  };
}

// Post with blocks
interface Post {
  title: string;
  blocks: ArtisanBlock[];
  // ... other fields
}
```

## Usage

### Admin Frontend (Editor)

```tsx
import { CreateArtisanPostModal } from "@/components/suppliers";

<CreateArtisanPostModal
  isOpen={isOpen}
  onClose={onClose}
  onSubmit={handleSubmit}
  supplierInfo={supplier}
/>;
```

### Customer Frontend (Renderer)

```tsx
import {
  BlockRenderer,
  isBlockBasedPost,
} from "@/features/magazine/components/BlockRenderer";

{
  isBlockBasedPost(post) ? (
    <BlockRenderer blocks={post.blocks} />
  ) : (
    <div dangerouslySetInnerHTML={{ __html: post.content }} />
  );
}
```

## Features

- ✅ Drag & Drop sắp xếp blocks
- ✅ Realtime Split-view Preview
- ✅ Mobile-first table design
- ✅ Legacy HTML support (backward compatible)
- ✅ AI metadata generation on submit
- ✅ Pending media upload (upload on submit)

## Files

```
artisan-blocks/
├── ArtisanBlockEditor.tsx   # Main editor with DnD + preview
├── ArtisanBlockItem.tsx     # Single block wrapper
├── BlockPreview.tsx         # Realtime preview panel
├── TextBlockEditor.tsx      # Text block editor
├── MediaBlockEditor.tsx     # Media block editor
├── CuratorNoteEditor.tsx    # Curator note editor
├── ComparisonTableEditor.tsx # Table editor
└── index.ts                 # Exports
```
