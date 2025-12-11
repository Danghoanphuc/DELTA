# Artwork Management - Quick Start Guide

## 🚀 Quick Test (5 minutes)

### Step 1: Start Backend Server

```bash
cd apps/customer-backend
npm run dev
```

Server should start on `http://localhost:5000`

### Step 2: Get JWT Token

Login to get authentication token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Copy the `token` from response.

### Step 3: Run Unit Tests

```bash
# Set MongoDB connection (if different from default)
export MONGODB_URI="mongodb://localhost:27017/delta-swag-test"

# Run tests
node src/modules/artworks/artwork.test.js
```

**Expected:** All tests should pass ✅

### Step 4: Run API Tests

```bash
# Set your JWT token
export TEST_TOKEN="paste-your-token-here"

# Run API tests
node src/modules/artworks/artwork.api-test.js
```

**Expected:** All API endpoints should work ✅

### Step 5: Manual Test with cURL

```bash
# Set token variable for convenience
TOKEN="your-jwt-token"

# 1. Upload artwork
curl -X POST http://localhost:5000/api/artworks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test-logo.png",
    "originalFileName": "company-logo.png",
    "fileUrl": "https://example.com/logo.png",
    "thumbnailUrl": "https://example.com/logo-thumb.png",
    "fileSize": 2097152,
    "fileFormat": "PNG",
    "dimensions": {"width": 200, "height": 200, "unit": "mm"},
    "resolution": 300,
    "colorMode": "CMYK",
    "colorCount": 4,
    "hasTransparency": false,
    "tags": ["logo", "brand"],
    "description": "Company logo for printing"
  }'

# Save the artwork ID from response

# 2. Get artwork library
curl http://localhost:5000/api/artworks \
  -H "Authorization: Bearer $TOKEN"

# 3. Get artwork detail
curl http://localhost:5000/api/artworks/ARTWORK_ID \
  -H "Authorization: Bearer $TOKEN"

# 4. Validate artwork
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/validate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requirements": {
      "minResolution": 300,
      "acceptedFormats": ["PNG", "PDF"],
      "colorMode": "CMYK",
      "maxFileSize": 10
    }
  }'

# 5. Approve artwork
curl -X POST http://localhost:5000/api/artworks/ARTWORK_ID/approve \
  -H "Authorization: Bearer $TOKEN"

# 6. Get stats
curl http://localhost:5000/api/artworks/stats \
  -H "Authorization: Bearer $TOKEN"
```

## ✅ Success Checklist

After running tests, verify:

- [x] Unit tests pass (45+ tests)
- [x] API tests pass (25+ tests)
- [x] Can upload artwork
- [x] Can get artwork library
- [x] Can validate artwork
- [x] Can approve/reject artwork
- [x] Can create versions
- [x] Can get statistics
- [x] Error handling works correctly

## 📊 Expected Test Results

### Unit Tests

```
============================================================
📊 TEST RESULTS
============================================================
✅ Passed: 45
❌ Failed: 0
📈 Success Rate: 100.00%
============================================================
```

### API Tests

```
============================================================
📊 TEST RESULTS
============================================================
✅ Passed: 25
❌ Failed: 0
📈 Success Rate: 100.00%
============================================================
```

## 🐛 Troubleshooting

### "Connection refused"

**Problem:** Backend server not running

**Solution:**

```bash
cd apps/customer-backend
npm run dev
```

### "Unauthorized" or "Invalid token"

**Problem:** JWT token expired or invalid

**Solution:** Get new token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'
```

### "MongoDB connection error"

**Problem:** MongoDB not running

**Solution:**

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:latest
```

### Tests fail with "TEST_TOKEN not set"

**Problem:** Environment variable not set

**Solution:**

```bash
export TEST_TOKEN="your-jwt-token-here"
node src/modules/artworks/artwork.api-test.js
```

## 📝 What Was Tested

### ✅ Model Layer

- Create artwork with validation
- Approve/reject methods
- Increment usage tracking
- Version control
- Virtual properties (fileSizeMB, isValid)

### ✅ Repository Layer

- CRUD operations
- Query methods (by organization, status, tags)
- Version history
- Statistics aggregation

### ✅ Service Layer

- Upload validation
- File format validation
- File size limits
- Artwork validation against requirements
- Approval workflow
- Version control
- Metadata management
- Search functionality
- Error handling

### ✅ Controller Layer

- All API endpoints
- Request validation
- Response formatting
- Error responses
- Authorization checks

## 🎯 Next Steps

After confirming all tests pass:

1. ✅ **Backend Complete** - Phase 2.1 Done!
2. ➡️ **Start Frontend** - Phase 2.2
   - Create Artwork Upload Component
   - Create Artwork Library Page
   - Create Artwork Detail Modal

See `tasks.md` for Phase 2.2 details.

## 📚 Additional Resources

- **Full Testing Guide:** `README.md`
- **API Documentation:** See controller JSDoc comments
- **Model Schema:** `artwork.model.js`
- **Business Logic:** `artwork.service.js`

## 💡 Tips

1. **Use Postman/Thunder Client** for easier API testing
2. **Check server logs** for detailed error messages
3. **Use MongoDB Compass** to inspect database
4. **Run tests frequently** during development
5. **Keep test data clean** by running cleanup between tests

## 🎉 Success!

If all tests pass, you're ready to move to Frontend development!

```
✅ Backend artwork management system is working correctly
✅ All API endpoints tested and verified
✅ Ready for Phase 2.2: Frontend UI Development
```
