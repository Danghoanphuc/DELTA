# Artwork Management System - Testing Guide

## Overview

Artwork Management System cung cấp đầy đủ chức năng để quản lý artwork files cho POD customization, bao gồm:

- ✅ Upload và validation artwork
- ✅ Version control
- ✅ Approval workflow
- ✅ Metadata management
- ✅ Search và filtering
- ✅ Usage tracking
- ✅ Statistics

## Architecture

```
artwork.model.js       # Mongoose model với schemas, methods, statics
artwork.repository.js  # Data access layer
artwork.service.js     # Business logic layer
artwork.controller.js  # HTTP request handlers
artwork.routes.js      # API route definitions
```

## API Endpoints

### Upload & CRUD

- `POST /api/artworks` - Upload new artwork
- `GET /api/artworks` - Get artwork library (with filters)
- `GET /api/artworks/:id` - Get artwork detail
- `PATCH /api/artworks/:id` - Update metadata
- `DELETE /api/artworks/:id` - Delete artwork (soft delete)

### Validation & Approval

- `POST /api/artworks/:id/validate` - Validate against requirements
- `POST /api/artworks/:id/approve` - Approve artwork
- `POST /api/artworks/:id/reject` - Reject artwork with errors

### Version Control

- `POST /api/artworks/:id/version` - Create new version
- `GET /api/artworks/:id/versions` - Get version history

### Search & Stats

- `GET /api/artworks/tags` - Get all unique tags
- `GET /api/artworks/stats` - Get statistics
- `GET /api/artworks/most-used` - Get most used artworks

## Testing

### 1. Unit & Integration Tests (artwork.test.js)

Tests model methods, service logic, và business rules.

**Run tests:**

```bash
# Set MongoDB connection
export MONGODB_URI="mongodb://localhost:27017/delta-swag-test"

# Run tests
node src/modules/artworks/artwork.test.js
```

**What it tests:**

- ✅ Model methods (approve, reject, incrementUsage, createNewVersion)
- ✅ Virtual properties (fileSizeMB, isValid)
- ✅ Service upload logic
- ✅ Validation against requirements
- ✅ Approval workflow
- ✅ Version control
- ✅ Metadata updates
- ✅ Search functionality
- ✅ Statistics
- ✅ Error handling

**Expected output:**

```
🧪 ===== ARTWORK MANAGEMENT SYSTEM TEST SUITE =====

✅ Connected to test database
🧹 Cleaned up test data

📦 Testing Model Methods...

✅ Create artwork with valid data
✅ Approve artwork
✅ Reject artwork
✅ Increment usage count
✅ Virtual properties work correctly

📤 Testing Service Upload...

✅ Upload artwork with valid data
✅ Reject upload with missing fileName
✅ Reject upload with invalid file format
✅ Reject upload with file size > 50MB

... (more tests)

============================================================
📊 TEST RESULTS
============================================================
✅ Passed: 45
❌ Failed: 0
📈 Success Rate: 100.00%
============================================================
```

### 2. API Endpoint Tests (artwork.api-test.js)

Tests HTTP endpoints như Postman.

**Setup:**

1. Start backend server:

```bash
cd apps/customer-backend
npm run dev
```

2. Get JWT token:

   - Login via `/api/auth/login`
   - Copy the JWT token from response

3. Set token environment variable:

```bash
export TEST_TOKEN="your-jwt-token-here"
```

**Run tests:**

```bash
# With default URL (http://localhost:5000/api)
node src/modules/artworks/artwork.api-test.js

# With custom URL
API_URL="http://localhost:3000/api" TEST_TOKEN="your-token" node src/modules/artworks/artwork.api-test.js
```

**What it tests:**

- ✅ POST /artworks - Upload artwork
- ✅ GET /artworks - Get library with filters
- ✅ GET /artworks/:id - Get detail
- ✅ POST /artworks/:id/validate - Validation
- ✅ POST /artworks/:id/approve - Approval
- ✅ POST /artworks/:id/reject - Rejection
- ✅ POST /artworks/:id/version - Version control
- ✅ GET /artworks/:id/versions - Version history
- ✅ PATCH /artworks/:id - Update metadata
- ✅ GET /artworks/tags - Search tags
- ✅ GET /artworks/stats - Statistics
- ✅ GET /artworks/most-used - Most used
- ✅ DELETE /artworks/:id - Delete

**Expected output:**

```
🧪 ===== ARTWORK API ENDPOINT TESTS =====

📤 Testing Upload Endpoint

✅ POST /artworks - Upload artwork
   Created artwork ID: 507f1f77bcf86cd799439011
✅ POST /artworks - Reject missing fileName
✅ POST /artworks - Reject invalid file format

📚 Testing Get Library Endpoint

✅ GET /artworks - Get artwork library
   Found 5 artworks
✅ GET /artworks?status=pending - Filter by status
   Found 3 pending artworks

... (more tests)

============================================================
📊 TEST RESULTS
============================================================
✅ Passed: 25
❌ Failed: 0
📈 Success Rate: 100.00%
============================================================
```

## Manual Testing with Postman/Thunder Client

### 1. Upload Artwork

```http
POST http://localhost:5000/api/artworks
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fileName": "company-logo.png",
  "originalFileName": "logo.png",
  "fileUrl": "https://s3.amazonaws.com/bucket/logo.png",
  "thumbnailUrl": "https://s3.amazonaws.com/bucket/logo-thumb.png",
  "fileSize": 2097152,
  "fileFormat": "PNG",
  "dimensions": {
    "width": 200,
    "height": 200,
    "unit": "mm"
  },
  "resolution": 300,
  "colorMode": "CMYK",
  "colorCount": 4,
  "hasTransparency": false,
  "tags": ["logo", "brand"],
  "description": "Company logo for t-shirt printing"
}
```

### 2. Get Artwork Library

```http
GET http://localhost:5000/api/artworks?status=pending&tags=logo
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. Validate Artwork

```http
POST http://localhost:5000/api/artworks/ARTWORK_ID/validate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "requirements": {
    "minResolution": 300,
    "acceptedFormats": ["PNG", "PDF", "AI"],
    "colorMode": "CMYK",
    "maxFileSize": 10,
    "maxWidth": 300,
    "maxHeight": 300
  }
}
```

### 4. Approve Artwork

```http
POST http://localhost:5000/api/artworks/ARTWORK_ID/approve
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Reject Artwork

```http
POST http://localhost:5000/api/artworks/ARTWORK_ID/reject
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "errors": [
    "Resolution too low (150dpi, minimum 300dpi required)",
    "Color mode is RGB, should be CMYK"
  ]
}
```

### 6. Create New Version

```http
POST http://localhost:5000/api/artworks/ARTWORK_ID/version
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fileName": "company-logo-v2.png",
  "originalFileName": "logo-v2.png",
  "fileUrl": "https://s3.amazonaws.com/bucket/logo-v2.png",
  "fileSize": 3145728,
  "fileFormat": "PNG",
  "resolution": 600
}
```

### 7. Get Statistics

```http
GET http://localhost:5000/api/artworks/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

### 8. Get Most Used Artworks

```http
GET http://localhost:5000/api/artworks/most-used?limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

## Common Test Scenarios

### Scenario 1: Upload → Validate → Approve

```bash
# 1. Upload artwork
curl -X POST http://localhost:5000/api/artworks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.png","fileUrl":"https://...","fileSize":1024,"fileFormat":"PNG"}'

# 2. Validate
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requirements":{"minResolution":300}}'

# 3. Approve
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/approve \
  -H "Authorization: Bearer $TOKEN"
```

### Scenario 2: Upload → Validate (Fail) → Reject

```bash
# 1. Upload low-res artwork
curl -X POST http://localhost:5000/api/artworks \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fileName":"low-res.png","resolution":150,...}'

# 2. Validate (will fail)
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/validate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"requirements":{"minResolution":300}}'

# 3. Reject with errors
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/reject \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"errors":["Resolution too low"]}'
```

### Scenario 3: Version Control

```bash
# 1. Upload v1
curl -X POST http://localhost:5000/api/artworks \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fileName":"logo-v1.png",...}'

# 2. Create v2
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/version \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fileName":"logo-v2.png","resolution":600,...}'

# 3. Get version history
curl http://localhost:5000/api/artworks/ARTWORK_ID/versions \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Test fails with "TEST_TOKEN not set"

**Solution:** Set JWT token environment variable:

```bash
export TEST_TOKEN="your-jwt-token"
```

### Test fails with "Connection refused"

**Solution:** Make sure backend server is running:

```bash
cd apps/customer-backend
npm run dev
```

### Test fails with "Unauthorized"

**Solution:** Token might be expired. Get a new token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

### Database connection error

**Solution:** Check MongoDB is running:

```bash
# Check MongoDB status
mongosh

# Or start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

## Next Steps

After testing backend:

1. ✅ Verify all tests pass
2. ✅ Check API responses match expected format
3. ✅ Test error handling scenarios
4. ➡️ **Proceed to Phase 2.2: Frontend UI Development**

## Phase 2.2 Preview

Frontend components to build:

- `ArtworkUploadModal` - Upload artwork với drag & drop
- `ArtworkLibraryPage` - Display artwork grid
- `ArtworkDetailModal` - View artwork details
- `ArtworkValidationPanel` - Validate artwork
- `ArtworkApprovalPanel` - Approve/reject workflow

See `.kiro/specs/pod-catalog-optimization/tasks.md` for details.
