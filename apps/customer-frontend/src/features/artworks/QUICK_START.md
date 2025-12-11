# Artwork Management - Quick Start Guide

## 🚀 Setup (5 phút)

### 1. Install Dependencies

```bash
cd apps/customer-frontend

# Install required packages
pnpm install react-dropzone date-fns sonner lucide-react

# Add shadcn/ui components
npx shadcn-ui@latest add dialog button input textarea select badge card tabs label dropdown-menu
```

### 2. Add Route

**File:** `apps/customer-frontend/src/App.tsx`

```tsx
import { ArtworkLibraryPage } from "@/features/artworks";

// Add route
<Route path="/artworks" element={<ArtworkLibraryPage />} />;
```

### 3. Add Navigation

**File:** `apps/customer-frontend/src/components/AppNavigationMenu.tsx`

```tsx
import { ImageIcon } from "lucide-react";

// Add menu item
<NavLink to="/artworks">
  <ImageIcon className="w-5 h-5" />
  <span>Artwork Library</span>
</NavLink>;
```

### 4. Start Servers

```bash
# Terminal 1: Backend
cd apps/customer-backend
pnpm dev

# Terminal 2: Frontend
cd apps/customer-frontend
pnpm dev
```

### 5. Test

1. Navigate to `http://localhost:5173/artworks`
2. Click "Upload Artwork"
3. Drag & drop a PNG/JPEG file
4. Add description và tags
5. Click "Upload"
6. View artwork in library

---

## 📖 Usage Examples

### Basic Upload

```tsx
import { ArtworkUploadModal } from "@/features/artworks";

function MyComponent() {
  const [open, setOpen] = useState(false);
  const { uploadArtwork } = useArtworks();

  return (
    <>
      <Button onClick={() => setOpen(true)}>Upload Artwork</Button>

      <ArtworkUploadModal
        open={open}
        onClose={() => setOpen(false)}
        onUpload={uploadArtwork}
      />
    </>
  );
}
```

### Fetch Artworks

```tsx
import { useArtworks } from "@/features/artworks";

function MyComponent() {
  const { artworks, isLoading, fetchArtworks } = useArtworks();

  useEffect(() => {
    fetchArtworks({ status: "approved" });
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {artworks.map((artwork) => (
        <div key={artwork._id}>{artwork.fileName}</div>
      ))}
    </div>
  );
}
```

### View Detail

```tsx
import { ArtworkDetailModal } from "@/features/artworks";

function MyComponent() {
  const [selected, setSelected] = useState(null);
  const { updateMetadata } = useArtworks();

  return (
    <>
      <Button onClick={() => setSelected(artwork)}>View Detail</Button>

      <ArtworkDetailModal
        artwork={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdate={updateMetadata}
      />
    </>
  );
}
```

---

## 🧪 Testing

### Manual Test Flow

1. **Upload:**

   - Drag PNG file → Should show preview
   - Try PDF file → Should accept
   - Try 100MB file → Should show error
   - Add description "Logo design"
   - Add tags "logo", "brand"
   - Click Upload → Should show success toast

2. **Library:**

   - Should see uploaded artwork in grid
   - Search "logo" → Should filter
   - Filter "Approved" → Should filter
   - Click artwork → Should open detail modal

3. **Detail:**
   - Should show 3 tabs
   - Edit description → Should save
   - Add tag → Should update
   - View Technical tab → Should show specs
   - View History tab → Should show versions

### API Testing

```bash
# Upload artwork
curl -X POST http://localhost:3000/api/artworks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@logo.png" \
  -F "description=Logo design" \
  -F "tags=[\"logo\",\"brand\"]"

# Get artworks
curl http://localhost:3000/api/artworks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get artwork detail
curl http://localhost:3000/api/artworks/ARTWORK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/shared/components/ui/dialog'"

**Solution:** Install shadcn/ui components

```bash
npx shadcn-ui@latest add dialog button input textarea select badge card tabs label dropdown-menu
```

### Issue: "react-dropzone not found"

**Solution:** Install dependencies

```bash
pnpm install react-dropzone date-fns sonner lucide-react
```

### Issue: Upload fails with 401

**Solution:** Check authentication

```tsx
// Ensure user is authenticated
const token = localStorage.getItem("token");
if (!token) {
  // Redirect to login
}
```

### Issue: File upload returns 400

**Solution:** Check file validation

- File format: PNG, JPEG, PDF, SVG only
- File size: Max 50MB
- Check backend logs for specific error

### Issue: Images not displaying

**Solution:** Check CORS and S3 configuration

```javascript
// Backend: Enable CORS for S3 URLs
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

---

## 📚 API Reference

### Upload Artwork

```
POST /api/artworks
Content-Type: multipart/form-data

Body:
- file: File (required)
- description: string (optional)
- tags: string[] (optional)

Response:
{
  success: true,
  data: {
    artwork: { ... }
  }
}
```

### Get Artworks

```
GET /api/artworks?status=approved&search=logo&page=1&limit=20

Response:
{
  success: true,
  data: {
    artworks: [...],
    pagination: {
      page: 1,
      limit: 20,
      total: 50,
      pages: 3
    }
  }
}
```

### Get Artwork Detail

```
GET /api/artworks/:id

Response:
{
  success: true,
  data: {
    artwork: { ... }
  }
}
```

### Update Metadata

```
PUT /api/artworks/:id/metadata
Content-Type: application/json

Body:
{
  "description": "Updated description",
  "tags": ["logo", "brand", "new-tag"]
}

Response:
{
  success: true,
  data: {
    artwork: { ... }
  }
}
```

### Delete Artwork

```
DELETE /api/artworks/:id

Response:
{
  success: true,
  message: "Artwork deleted successfully"
}
```

---

## 🎯 Next Steps

1. ✅ Setup complete
2. ✅ Test upload flow
3. ✅ Test library page
4. ✅ Test detail modal
5. ⏭️ Move to Phase 3: Enhanced Product Catalog

---

## 💡 Tips

- Use Chrome DevTools Network tab to debug API calls
- Check browser console for errors
- Use React DevTools to inspect component state
- Test with different file types and sizes
- Test on mobile devices

---

## 📞 Support

- Backend docs: `apps/customer-backend/src/modules/artworks/README.md`
- Design spec: `.kiro/specs/pod-catalog-optimization/design.md`
- Tasks: `.kiro/specs/pod-catalog-optimization/tasks.md`

---

**Happy coding! 🚀**
