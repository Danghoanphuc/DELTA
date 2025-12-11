# PhotoUploadService Usage Guide

## Overview

The `PhotoUploadService` handles all photo upload operations for the delivery check-in system. It provides:

- Image compression (max 2MB)
- Thumbnail generation (300x300)
- EXIF data extraction
- Cloud storage upload (Cloudinary)
- Parallel photo processing

## Basic Usage

### Single Photo Upload

```javascript
import { PhotoUploadService } from "./photo-upload.service.js";

const photoService = new PhotoUploadService();

// Upload a single photo
const fileBuffer = req.file.buffer; // From multer
const metadata = {
  userId: req.user._id,
  filename: req.file.originalname,
  mimetype: req.file.mimetype,
};

const result = await photoService.uploadPhoto(fileBuffer, metadata);

console.log(result);
// {
//   url: 'https://res.cloudinary.com/...',
//   thumbnailUrl: 'https://res.cloudinary.com/...',
//   publicId: 'checkin-user123-1234567890-123456789-main',
//   thumbnailPublicId: 'checkin-user123-1234567890-123456789-thumb',
//   filename: 'photo.jpg',
//   size: 1048576, // bytes
//   mimeType: 'image/jpeg',
//   width: 1920,
//   height: 1080,
//   exifData: { hasExif: true, orientation: 1 }
// }
```

### Multiple Photos Upload (Parallel)

```javascript
const photoService = new PhotoUploadService();

// Upload multiple photos in parallel
const fileBuffers = req.files.map((file) => file.buffer);
const metadataArray = req.files.map((file) => ({
  userId: req.user._id,
  filename: file.originalname,
  mimetype: file.mimetype,
}));

const results = await photoService.uploadMultiplePhotos(
  fileBuffers,
  metadataArray
);

console.log(`Uploaded ${results.length} photos`);
```

### Image Compression Only

```javascript
const photoService = new PhotoUploadService();

// Compress image to max 2MB
const compressedBuffer = await photoService.compressImage(fileBuffer);

// Compress to custom size (1MB)
const customCompressed = await photoService.compressImage(
  fileBuffer,
  1024 * 1024
);
```

### Thumbnail Generation Only

```javascript
const photoService = new PhotoUploadService();

// Generate 300x300 thumbnail
const thumbnail = await photoService.generateThumbnail(fileBuffer);

// Generate custom size thumbnail (150x150)
const smallThumbnail = await photoService.generateThumbnail(fileBuffer, 150);
```

### EXIF Data Extraction

```javascript
const photoService = new PhotoUploadService();

// Extract EXIF data (including GPS if available)
const exifData = await photoService.extractEXIFData(fileBuffer);

console.log(exifData);
// { hasExif: true, orientation: 1 }
```

### Delete Photo

```javascript
const photoService = new PhotoUploadService();

// Delete photo from Cloudinary
const result = await photoService.deletePhoto(
  "checkin-user123-1234567890-123456789-main"
);
```

## Integration with Delivery Check-in

### In DeliveryCheckinService

```javascript
import { PhotoUploadService } from "../services/photo-upload.service.js";

export class DeliveryCheckinService {
  constructor() {
    this.photoService = new PhotoUploadService();
  }

  async createCheckin(shipperId, data) {
    // ... validation logic

    // Upload photos
    const photoResults = await this.photoService.uploadMultiplePhotos(
      data.photoBuffers,
      data.photoBuffers.map((_, index) => ({
        userId: shipperId,
        filename: `checkin-photo-${index + 1}.jpg`,
        mimetype: "image/jpeg",
      }))
    );

    // Create check-in with photo URLs
    const checkin = await this.repository.create({
      shipperId,
      orderId: data.orderId,
      photos: photoResults.map((photo) => ({
        url: photo.url,
        thumbnailUrl: photo.thumbnailUrl,
        filename: photo.filename,
        size: photo.size,
        mimeType: photo.mimeType,
        width: photo.width,
        height: photo.height,
      })),
      // ... other fields
    });

    return checkin;
  }
}
```

### With Multer Middleware

```javascript
import multer from "multer";
import { PhotoUploadService } from "../services/photo-upload.service.js";

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max before compression
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Route handler
router.post("/checkins", upload.array("photos", 5), async (req, res, next) => {
  try {
    const photoService = new PhotoUploadService();

    // Process uploaded files
    const photoResults = await photoService.uploadMultiplePhotos(
      req.files.map((file) => file.buffer),
      req.files.map((file) => ({
        userId: req.user._id,
        filename: file.originalname,
        mimetype: file.mimetype,
      }))
    );

    // Continue with check-in creation...
    res.json({ success: true, photos: photoResults });
  } catch (error) {
    next(error);
  }
});
```

## Configuration

The service uses environment variables from `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Constants

- `MAX_FILE_SIZE`: 2MB (2 _ 1024 _ 1024 bytes)
- `THUMBNAIL_SIZE`: 300x300 pixels
- `SIGNED_URL_EXPIRATION`: 1 year (365 _ 24 _ 60 \* 60 seconds)
- `FOLDER_PATH`: 'printz/delivery-checkins'

## Error Handling

The service throws `BaseException` with status code 500 for:

- Failed photo uploads
- Failed multiple photo uploads
- Failed photo deletion

Other errors (compression, thumbnail generation) are re-thrown to be handled by the caller.

## Performance Considerations

1. **Parallel Processing**: Use `uploadMultiplePhotos()` for multiple photos to process them in parallel
2. **Compression**: Images are automatically compressed to max 2MB while maintaining quality
3. **Thumbnail Generation**: Thumbnails are generated in parallel with main image upload
4. **Cloud Storage**: Uses Cloudinary CDN for fast delivery

## Testing

Run tests with:

```bash
npm test -- photo-upload.service.test.js
```

## Future Enhancements

1. Add support for more EXIF data extraction (GPS coordinates)
2. Add support for other cloud storage providers (AWS S3)
3. Add image format conversion (WebP, AVIF)
4. Add watermarking support
5. Add image optimization based on device type
