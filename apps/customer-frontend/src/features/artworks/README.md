# Artwork Management Feature

## Overview

Frontend UI cho Artwork Management System - cho phép users upload, quản lý, và tổ chức artwork files.

## Structure

```
features/artworks/
├── services/
│   └── artwork.service.ts      # API communication
├── hooks/
│   └── useArtworks.ts          # State management hooks
├── components/
│   ├── ArtworkUploadModal.tsx  # Upload component với drag & drop
│   └── ArtworkDetailModal.tsx  # Detail modal với tabs
├── pages/
│   └── ArtworkLibraryPage.tsx  # Main library page
├── index.ts                     # Barrel exports
└── README.md                    # This file
```

## Components

### 1. ArtworkUploadModal

**Purpose**: Upload artwork với drag & drop interface

**Features**:

- ✅ Drag & drop file upload
- ✅ File validation (format, size)
- ✅ Image preview
- ✅ Description và tags
- ✅ Real-time validation errors

**Usage**:

```tsx
import { ArtworkUploadModal } from "@/features/artworks";

<ArtworkUploadModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onUpload={async (data) => {
    await artworkService.uploadArtwork(data);
  }}
/>;
```

### 2. ArtworkLibraryPage

**Purpose**: Main page hiển thị artwork library

**Features**:

- ✅ Grid layout với thumbnails
- ✅ Search và filters (status)
- ✅ Statistics cards
- ✅ Quick actions (view, download, delete)
- ✅ Pagination

**Usage**:

```tsx
import { ArtworkLibraryPage } from "@/features/artworks";

// In router
<Route path="/artworks" element={<ArtworkLibraryPage />} />;
```

### 3. ArtworkDetailModal

**Purpose**: Chi tiết artwork với tabs

**Features**:

- ✅ 3 tabs: Info, Technical, History
- ✅ Edit metadata (description, tags)
- ✅ Technical specs display
- ✅ Version history
- ✅ Download original file

**Usage**:

```tsx
import { ArtworkDetailModal } from "@/features/artworks";

<ArtworkDetailModal
  artwork={selectedArtwork}
  open={!!selectedArtwork}
  onClose={() => setSelectedArtwork(null)}
  onUpdate={async (id, data) => {
    await artworkService.updateMetadata(id, data);
  }}
/>;
```

## Hooks

### useArtworks()

**Purpose**: Manage artwork list state

**Returns**:

```typescript
{
  artworks: Artwork[];
  isLoading: boolean;
  pagination: PaginationInfo;
  fetchArtworks: (filters?: ArtworkFilters) => Promise<void>;
  uploadArtwork: (data: UploadArtworkData) => Promise<Artwork>;
  deleteArtwork: (id: string) => Promise<void>;
  updateMetadata: (id: string, data: any) => Promise<Artwork>;
}
```

**Usage**:

```tsx
const { artworks, isLoading, fetchArtworks, uploadArtwork } = useArtworks();

useEffect(() => {
  fetchArtworks({ status: "approved" });
}, []);
```

### useArtworkDetail(artworkId)

**Purpose**: Manage single artwork detail state

**Returns**:

```typescript
{
  artwork: Artwork | null;
  isLoading: boolean;
  versionHistory: Artwork[];
  fetchArtwork: () => Promise<void>;
  fetchVersionHistory: () => Promise<void>;
  createVersion: (file: File) => Promise<Artwork>;
}
```

## Service

### artworkService

**Methods**:

- `uploadArtwork(data)` - Upload new artwork
- `getArtworks(filters)` - Get artwork list
- `getArtworkDetail(id)` - Get artwork detail
- `validateArtwork(id, requirements)` - Validate artwork
- `createVersion(id, file)` - Create new version
- `getVersionHistory(id)` - Get version history
- `updateMetadata(id, data)` - Update metadata
- `deleteArtwork(id)` - Delete artwork
- `getAllTags()` - Get all unique tags
- `getStatistics()` - Get statistics

## Integration

### Add to Router

```tsx
// In App.tsx or router config
import { ArtworkLibraryPage } from "@/features/artworks";

<Route path="/artworks" element={<ArtworkLibraryPage />} />;
```

### Add to Navigation

```tsx
// In navigation menu
<NavLink to="/artworks">
  <ImageIcon className="w-5 h-5" />
  <span>Artwork Library</span>
</NavLink>
```

## Dependencies

**Required UI Components** (from shadcn/ui):

- Dialog
- Button
- Input
- Textarea
- Select
- Badge
- Card
- Tabs
- Label
- DropdownMenu

**Required Libraries**:

- `react-dropzone` - File upload
- `date-fns` - Date formatting
- `sonner` - Toast notifications
- `lucide-react` - Icons

## Validation Rules

**File Upload**:

- Accepted formats: PNG, JPEG, PDF, SVG
- Max file size: 50MB
- Min resolution: 300 DPI (recommended)

**Metadata**:

- Description: Optional, max 500 characters
- Tags: Optional, lowercase, no duplicates

## API Endpoints

```
POST   /api/artworks              - Upload artwork
GET    /api/artworks              - Get artwork list
GET    /api/artworks/:id          - Get artwork detail
POST   /api/artworks/:id/validate - Validate artwork
POST   /api/artworks/:id/version  - Create new version
GET    /api/artworks/:id/versions - Get version history
PUT    /api/artworks/:id/metadata - Update metadata
DELETE /api/artworks/:id          - Delete artwork
GET    /api/artworks/tags         - Get all tags
GET    /api/artworks/stats        - Get statistics
```

## Testing

**Manual Testing Checklist**:

- [ ] Upload artwork với drag & drop
- [ ] Upload artwork với file picker
- [ ] Validate file format errors
- [ ] Validate file size errors
- [ ] Search artworks
- [ ] Filter by status
- [ ] View artwork detail
- [ ] Edit metadata
- [ ] Add/remove tags
- [ ] View version history
- [ ] Download artwork
- [ ] Delete artwork

## Future Enhancements

- [ ] Bulk upload
- [ ] Bulk delete
- [ ] Advanced filters (by tags, date range)
- [ ] Sort options
- [ ] Grid/List view toggle
- [ ] Artwork comparison
- [ ] Share artwork link
- [ ] Export artwork list

## Notes

- All API calls go through `artwork.service.ts`
- State management handled by custom hooks
- Toast notifications for user feedback
- Error handling at hook level
- Follow architecture standards (Service → Hook → Component)

## Related

- Backend: `apps/customer-backend/src/modules/artworks/`
- Design: `.kiro/specs/pod-catalog-optimization/design.md`
- Tasks: `.kiro/specs/pod-catalog-optimization/tasks.md`
