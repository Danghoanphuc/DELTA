# Design Document - Delivery Check-in System

## Overview

Delivery Check-in System là một hệ thống cho phép shipper (nhân viên giao hàng) tạo check-in tại địa điểm giao hàng với ảnh chứng minh, GPS location, và ghi chú. Hệ thống tích hợp với threaded-chat system hiện có để tạo delivery threads (giống Facebook check-in posts), cho phép customer theo dõi lịch sử giao hàng trên bản đồ interactive trong dashboard.

### Key Features

1. **Shipper Check-in**: Mobile-optimized interface cho shipper tạo check-in với photos + GPS
2. **Thread Integration**: Mỗi check-in tự động tạo delivery thread với format social feed
3. **GPS Verification**: Sử dụng Goong.io Geocoding API để verify và format địa chỉ
4. **Customer Map Dashboard**: Interactive map hiển thị tất cả check-ins với timeline
5. **Email Notifications**: Tự động gửi email cho customer khi có check-in mới
6. **Photo Management**: Upload, compress, và serve delivery photos qua CDN
7. **Offline Support**: Queue check-ins khi offline, sync khi có network

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Shipper App (Mobile)          Customer Dashboard (Web)     │
│  - Check-in Form               - Map View Component         │
│  - Camera Integration          - Timeline Filter            │
│  - GPS Capture                 - Thread Integration         │
│  - Offline Queue               - Photo Gallery              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                       │
├─────────────────────────────────────────────────────────────┤
│  /api/delivery-checkins                                     │
│  - POST /                    (Create check-in)              │
│  - GET /                     (List check-ins)               │
│  - GET /:id                  (Get check-in detail)          │
│  - DELETE /:id               (Delete check-in)              │
│  - GET /order/:orderId       (Get check-ins by order)       │
│  - GET /shipper/:shipperId   (Get shipper history)          │
│  - GET /customer/:customerId (Get customer check-ins)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
├─────────────────────────────────────────────────────────────┤
│  DeliveryCheckinService                                     │
│  - createCheckin()           - getCheckinsByOrder()         │
│  - getCheckin()              - getCheckinsByShipper()       │
│  - deleteCheckin()           - getCheckinsByCustomer()      │
│                                                              │
│  ThreadIntegrationService                                   │
│  - createDeliveryThread()    - formatThreadMessage()        │
│  - attachPhotosToThread()    - addParticipantsToThread()    │
│                                                              │
│  GoongGeocodingService                                      │
│  - reverseGeocode()          - validateCoordinates()        │
│  - formatAddress()           - getAccuracy()                │
│                                                              │
│  PhotoUploadService                                         │
│  - uploadPhoto()             - compressImage()              │
│  - generateThumbnail()       - getSignedUrl()               │
│                                                              │
│  EmailNotificationService                                   │
│  - sendCheckinNotification() - formatEmailTemplate()        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Repository Layer                          │
├─────────────────────────────────────────────────────────────┤
│  DeliveryCheckinRepository                                  │
│  - create()                  - findByOrder()                │
│  - findById()                - findByShipper()              │
│  - delete()                  - findByCustomer()             │
│  - findWithinBounds()        - updateOrderStatus()          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Collections:                                        │
│  - delivery_checkins         - threads (existing)           │
│  - users (existing)          - orders (existing)            │
│                                                              │
│  Cloud Storage (AWS S3 / Cloudinary):                       │
│  - delivery-photos/          - thumbnails/                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────────────────────────────────────────────────┤
│  Goong.io API                Email Service (SendGrid)       │
│  - Geocoding API             - Transactional Emails         │
│  - Map Tiles API             - Email Templates              │
└─────────────────────────────────────────────────────────────┘
```

### Layered Architecture

```
Controller → Service → Repository → Model
     ↓          ↓          ↓
  HTTP      Business    Data
 Handling    Logic     Access
```

## Components and Interfaces

### 1. Data Models

#### DeliveryCheckin Model

```javascript
// delivery-checkin.model.js

export const CHECKIN_STATUS = {
  PENDING: "pending", // Đang xử lý upload
  COMPLETED: "completed", // Hoàn tất
  FAILED: "failed", // Upload thất bại
};

const deliveryCheckinSchema = new mongoose.Schema(
  {
    // Order Reference
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    // Shipper Info
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shipperName: {
      type: String,
      required: true,
    },

    // Customer Info (denormalized for quick access)
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },

    // Location Data
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere", // Geospatial index
      },
    },

    // Address (from Goong.io)
    address: {
      formatted: {
        type: String,
        required: true,
      },
      street: String,
      ward: String,
      district: String,
      city: String,
      country: {
        type: String,
        default: "Vietnam",
      },
    },

    // GPS Metadata
    gpsMetadata: {
      accuracy: Number, // meters
      altitude: Number, // meters
      heading: Number, // degrees
      speed: Number, // m/s
      timestamp: Date, // GPS timestamp
      source: {
        type: String,
        enum: ["device", "browser", "manual"],
        default: "device",
      },
    },

    // Photos
    photos: [
      {
        url: {
          type: String,
          required: true,
        },
        thumbnailUrl: {
          type: String,
          required: true,
        },
        filename: String,
        size: Number, // bytes
        mimeType: String,
        width: Number,
        height: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Notes
    notes: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // Thread Integration
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      index: true,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(CHECKIN_STATUS),
      default: CHECKIN_STATUS.PENDING,
      index: true,
    },

    // Timestamps
    checkinAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Notification Status
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
deliveryCheckinSchema.index({ orderId: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ shipperId: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ customerId: 1, checkinAt: -1 });
deliveryCheckinSchema.index({ location: "2dsphere" });
deliveryCheckinSchema.index({ status: 1, checkinAt: -1 });

// Virtual: Get primary photo
deliveryCheckinSchema.virtual("primaryPhoto").get(function () {
  return this.photos && this.photos.length > 0 ? this.photos[0] : null;
});

// Instance Methods
deliveryCheckinSchema.methods.canDelete = function (userId) {
  return this.shipperId.toString() === userId.toString();
};

// Static Methods
deliveryCheckinSchema.statics.findByOrder = function (orderId) {
  return this.find({ orderId, isDeleted: false })
    .sort({ checkinAt: -1 })
    .lean();
};

deliveryCheckinSchema.statics.findByShipper = function (
  shipperId,
  options = {}
) {
  const query = { shipperId, isDeleted: false };
  return this.find(query)
    .sort({ checkinAt: -1 })
    .limit(options.limit || 50)
    .lean();
};

deliveryCheckinSchema.statics.findByCustomer = function (
  customerId,
  options = {}
) {
  const query = { customerId, isDeleted: false };
  return this.find(query)
    .sort({ checkinAt: -1 })
    .limit(options.limit || 100)
    .lean();
};

deliveryCheckinSchema.statics.findWithinBounds = function (bounds) {
  // bounds: { minLng, minLat, maxLng, maxLat }
  return this.find({
    location: {
      $geoWithin: {
        $box: [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
      },
    },
    isDeleted: false,
  }).lean();
};

export const DeliveryCheckin = mongoose.model(
  "DeliveryCheckin",
  deliveryCheckinSchema
);
```

#### User Model Extension (Shipper Role)

```javascript
// Extend existing User model with shipper-specific fields

// Add to User schema:
{
  role: {
    type: String,
    enum: ['customer', 'printer', 'admin', 'shipper'], // Add 'shipper'
    default: 'customer',
  },

  // Shipper-specific fields
  shipperProfile: {
    vehicleType: {
      type: String,
      enum: ['motorbike', 'car', 'bicycle', 'walking'],
    },
    vehiclePlate: String,
    phoneNumber: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    totalDeliveries: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
  },
}
```

### 2. Service Layer Interfaces

#### DeliveryCheckinService

```javascript
export class DeliveryCheckinService {
  /**
   * Create a new delivery check-in
   * @param {ObjectId} shipperId - Shipper user ID
   * @param {Object} data - Check-in data
   * @returns {Promise<DeliveryCheckin>}
   */
  async createCheckin(shipperId, data) {
    // 1. Validate shipper has access to order
    // 2. Validate GPS coordinates
    // 3. Reverse geocode using Goong.io
    // 4. Upload photos to cloud storage
    // 5. Create check-in record
    // 6. Create delivery thread
    // 7. Update order status
    // 8. Send email notification
    // 9. Return check-in
  }

  /**
   * Get check-in by ID
   * @param {ObjectId} userId - Requesting user ID
   * @param {ObjectId} checkinId - Check-in ID
   * @returns {Promise<DeliveryCheckin>}
   */
  async getCheckin(userId, checkinId) {
    // 1. Fetch check-in
    // 2. Verify user has access (shipper, customer, or admin)
    // 3. Return check-in with populated data
  }

  /**
   * Get check-ins by order
   * @param {ObjectId} userId - Requesting user ID
   * @param {ObjectId} orderId - Order ID
   * @returns {Promise<DeliveryCheckin[]>}
   */
  async getCheckinsByOrder(userId, orderId) {
    // 1. Verify user has access to order
    // 2. Fetch check-ins for order
    // 3. Return sorted by checkinAt desc
  }

  /**
   * Get check-ins by shipper (history)
   * @param {ObjectId} shipperId - Shipper ID
   * @param {Object} options - Query options
   * @returns {Promise<{checkins: DeliveryCheckin[], pagination}>}
   */
  async getCheckinsByShipper(shipperId, options = {}) {
    // 1. Fetch shipper's check-ins
    // 2. Apply filters (date range, status)
    // 3. Paginate results
    // 4. Return with pagination metadata
  }

  /**
   * Get check-ins by customer (for map view)
   * @param {ObjectId} customerId - Customer ID
   * @param {Object} options - Query options
   * @returns {Promise<DeliveryCheckin[]>}
   */
  async getCheckinsByCustomer(customerId, options = {}) {
    // 1. Fetch customer's check-ins
    // 2. Apply filters (date range, bounds)
    // 3. Return for map rendering
  }

  /**
   * Delete check-in (soft delete)
   * @param {ObjectId} shipperId - Shipper ID
   * @param {ObjectId} checkinId - Check-in ID
   * @returns {Promise<void>}
   */
  async deleteCheckin(shipperId, checkinId) {
    // 1. Fetch check-in
    // 2. Verify shipper owns check-in
    // 3. Soft delete check-in
    // 4. Revert order status if needed
    // 5. Archive thread
  }
}
```

#### ThreadIntegrationService

```javascript
export class ThreadIntegrationService {
  /**
   * Create delivery thread for check-in
   * @param {DeliveryCheckin} checkin - Check-in data
   * @returns {Promise<Thread>}
   */
  async createDeliveryThread(checkin) {
    // 1. Format thread title and message
    // 2. Prepare thread data with type 'delivery_checkin'
    // 3. Add shipper and customer as participants
    // 4. Attach photos as thread attachments
    // 5. Embed GPS coordinates in metadata
    // 6. Create thread via ThreadService
    // 7. Return thread
  }

  /**
   * Format thread message for check-in
   * @param {DeliveryCheckin} checkin - Check-in data
   * @returns {string}
   */
  formatThreadMessage(checkin) {
    // Format: "Shipper [Name] đã check-in tại [Address] - Giao hàng cho đơn [OrderNumber]"
    // Include timestamp and notes if available
  }

  /**
   * Attach photos to thread
   * @param {ObjectId} threadId - Thread ID
   * @param {Array} photos - Photo URLs
   * @returns {Promise<void>}
   */
  async attachPhotosToThread(threadId, photos) {
    // 1. Create message with photo attachments
    // 2. Post to thread via MessageService
  }
}
```

#### GoongGeocodingService

```javascript
export class GoongGeocodingService {
  /**
   * Reverse geocode coordinates to address
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Address object
   */
  async reverseGeocode(lat, lng) {
    // 1. Call Goong.io Geocoding API
    // 2. Parse response
    // 3. Format address components
    // 4. Return structured address
  }

  /**
   * Validate coordinates accuracy
   * @param {Object} gpsData - GPS metadata
   * @returns {boolean}
   */
  validateCoordinates(gpsData) {
    // 1. Check accuracy threshold (< 50m = good)
    // 2. Validate lat/lng ranges
    // 3. Return validation result
  }

  /**
   * Format address for display
   * @param {Object} addressComponents - Address parts
   * @returns {string}
   */
  formatAddress(addressComponents) {
    // Format: "Street, Ward, District, City"
  }
}
```

#### PhotoUploadService

```javascript
export class PhotoUploadService {
  /**
   * Upload photo to cloud storage
   * @param {Buffer} fileBuffer - Image buffer
   * @param {Object} metadata - File metadata
   * @returns {Promise<Object>} URLs and metadata
   */
  async uploadPhoto(fileBuffer, metadata) {
    // 1. Compress image to max 2MB
    // 2. Generate thumbnail (300x300)
    // 3. Upload both to S3/Cloudinary
    // 4. Generate signed URLs
    // 5. Return URLs and metadata
  }

  /**
   * Compress image
   * @param {Buffer} buffer - Original image
   * @param {number} maxSize - Max size in bytes
   * @returns {Promise<Buffer>}
   */
  async compressImage(buffer, maxSize = 2 * 1024 * 1024) {
    // Use sharp library to compress
  }

  /**
   * Generate thumbnail
   * @param {Buffer} buffer - Original image
   * @param {number} size - Thumbnail size
   * @returns {Promise<Buffer>}
   */
  async generateThumbnail(buffer, size = 300) {
    // Use sharp to create square thumbnail
  }
}
```

#### EmailNotificationService

```javascript
export class EmailNotificationService {
  /**
   * Send check-in notification to customer
   * @param {DeliveryCheckin} checkin - Check-in data
   * @returns {Promise<void>}
   */
  async sendCheckinNotification(checkin) {
    // 1. Load email template
    // 2. Populate template with check-in data
    // 3. Send via SendGrid
    // 4. Update checkin.emailSent status
    // 5. Retry on failure (max 3 times)
  }

  /**
   * Format email template
   * @param {DeliveryCheckin} checkin - Check-in data
   * @returns {string} HTML email
   */
  formatEmailTemplate(checkin) {
    // Template includes:
    // - Shipper name and photo
    // - Delivery address
    // - Timestamp
    // - First photo thumbnail
    // - Link to view on map
  }
}
```

### 3. Repository Layer

#### DeliveryCheckinRepository

```javascript
export class DeliveryCheckinRepository {
  async create(data) {
    const checkin = new DeliveryCheckin(data);
    return await checkin.save();
  }

  async findById(id) {
    return await DeliveryCheckin.findById(id)
      .populate("shipperId", "displayName avatarUrl")
      .populate("orderId", "orderNumber status")
      .lean();
  }

  async findByOrder(orderId) {
    return await DeliveryCheckin.findByOrder(orderId);
  }

  async findByShipper(shipperId, options = {}) {
    return await DeliveryCheckin.findByShipper(shipperId, options);
  }

  async findByCustomer(customerId, options = {}) {
    return await DeliveryCheckin.findByCustomer(customerId, options);
  }

  async findWithinBounds(bounds) {
    return await DeliveryCheckin.findWithinBounds(bounds);
  }

  async delete(id, userId) {
    return await DeliveryCheckin.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
    });
  }

  async updateStatus(id, status) {
    return await DeliveryCheckin.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }
}
```

### 4. API Endpoints

```
POST   /api/delivery-checkins
GET    /api/delivery-checkins
GET    /api/delivery-checkins/:id
DELETE /api/delivery-checkins/:id
GET    /api/delivery-checkins/order/:orderId
GET    /api/delivery-checkins/shipper/:shipperId
GET    /api/delivery-checkins/customer/:customerId
GET    /api/delivery-checkins/map/bounds
```

### 5. Frontend Components

#### Shipper Mobile App

```typescript
// CheckinForm.tsx
interface CheckinFormProps {
  orderId: string;
  onSuccess: (checkin: DeliveryCheckin) => void;
}

export function CheckinForm({ orderId, onSuccess }: CheckinFormProps) {
  // - Camera integration
  // - GPS capture with accuracy indicator
  // - Photo preview and management
  // - Notes input
  // - Submit with loading state
  // - Offline queue support
}

// CheckinHistory.tsx
export function CheckinHistory() {
  // - List of shipper's check-ins
  // - Filter by date range
  // - View details
  // - Delete option
}
```

#### Customer Dashboard

```typescript
// DeliveryMapView.tsx
interface DeliveryMapViewProps {
  customerId: string;
}

export function DeliveryMapView({ customerId }: DeliveryMapViewProps) {
  // - Goong.io map integration
  // - Markers for each check-in
  // - Popup with photos and details
  // - Timeline filter
  // - Link to thread
  // - Clustering for many markers
}

// CheckinPopup.tsx
interface CheckinPopupProps {
  checkin: DeliveryCheckin;
  onViewThread: () => void;
}

export function CheckinPopup({ checkin, onViewThread }: CheckinPopupProps) {
  // - Shipper info
  // - Photo gallery
  // - Address and timestamp
  // - Notes
  // - View thread button
}
```

## Data Models

See "Components and Interfaces" section above for detailed model schemas.

## Error Handling

### Custom Exceptions

```javascript
// Use existing exception classes
import {
  ValidationException, // 400 - Invalid input
  UnauthorizedException, // 401 - Not authenticated
  ForbiddenException, // 403 - Not authorized
  NotFoundException, // 404 - Resource not found
  ConflictException, // 409 - Conflict
  InternalServerException, // 500 - Server error
} from "../shared/exceptions/index.js";
```

### Error Scenarios

1. **GPS Unavailable**: Prevent submission, show error
2. **Photo Upload Failed**: Retry with exponential backoff
3. **Goong.io API Down**: Proceed with coordinates only, retry geocoding later
4. **Invalid Order**: Throw NotFoundException
5. **Shipper Not Assigned**: Throw ForbiddenException
6. **Duplicate Check-in**: Throw ConflictException

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Shipper Role Assignment

_For any_ newly created shipper account, the role field SHALL be set to "shipper" and SHALL have check-in operation permissions.

**Validates: Requirements 1.1**

### Property 2: Shipper Authentication Access

_For any_ shipper with valid credentials, authentication SHALL grant access to shipper-specific features, and invalid credentials SHALL deny access.

**Validates: Requirements 1.2**

### Property 3: Shipper Authorization Boundaries

_For any_ shipper attempting to access non-shipper features, the system SHALL deny access and return ForbiddenException.

**Validates: Requirements 1.3**

### Property 4: Shipper Order Filtering

_For any_ shipper viewing orders, the returned list SHALL contain only orders assigned to that shipper.

**Validates: Requirements 1.4**

### Property 5: File Type Validation

_For any_ photo upload, the system SHALL accept files with MIME types image/jpeg, image/png, or image/webp, and SHALL reject all other types with ValidationException.

**Validates: Requirements 2.2**

### Property 6: Check-in Data Completeness

_For any_ successfully created check-in, the record SHALL contain orderId, shipperId, timestamp, GPS coordinates, photos array, and address fields.

**Validates: Requirements 2.3, 7.1**

### Property 7: Optional Notes Storage

_For any_ check-in with notes provided, the notes field SHALL be stored in the check-in record.

**Validates: Requirements 2.5**

### Property 8: Photo Upload Retry

_For any_ failed photo upload, the system SHALL retry the upload operation with exponential backoff up to 3 times.

**Validates: Requirements 2.7**

### Property 9: Thread Creation on Check-in

_For any_ created check-in, the system SHALL automatically create a corresponding thread with type "delivery_checkin" linked to the order.

**Validates: Requirements 3.1, 3.5**

### Property 10: Thread Message Format

_For any_ check-in thread, the message SHALL contain shipper name, address, and order number in the format "Shipper [Name] đã check-in tại [Address] - Giao hàng cho đơn [OrderNumber]".

**Validates: Requirements 3.2**

### Property 11: Thread Photo Attachment

_For any_ check-in with photos, all photos SHALL be attached to the created thread.

**Validates: Requirements 3.3**

### Property 12: Thread GPS Metadata

_For any_ check-in thread, the GPS coordinates SHALL be embedded in the thread's metadata field.

**Validates: Requirements 3.4**

### Property 13: Thread Participants

_For any_ check-in thread, both the customer and shipper SHALL be added as thread participants.

**Validates: Requirements 3.6**

### Property 14: Coordinates and Address Storage

_For any_ check-in with Goong.io geocoding response, both the GPS coordinates and formatted address SHALL be stored in the check-in record.

**Validates: Requirements 4.2**

### Property 15: GPS Accuracy Validation

_For any_ GPS coordinates with accuracy below 50 meters, the system SHALL accept the coordinates as valid.

**Validates: Requirements 4.3**

### Property 16: Customer Check-in Filtering

_For any_ customer accessing dashboard, the displayed check-ins SHALL contain only check-ins for orders owned by that customer.

**Validates: Requirements 5.1**

### Property 17: Date Range Filtering

_For any_ date range filter applied to check-ins, the returned results SHALL contain only check-ins with checkinAt timestamp within the specified range.

**Validates: Requirements 5.6**

### Property 18: Email Notification Trigger

_For any_ created check-in, the system SHALL send an email notification to the customer's registered email address.

**Validates: Requirements 6.1**

### Property 19: Email Content Completeness

_For any_ check-in notification email, the content SHALL include timestamp, address, shipper name, and link to view on map.

**Validates: Requirements 6.2**

### Property 20: Email Photo Thumbnail

_For any_ check-in notification email with photos, the email SHALL include a thumbnail of the first delivery photo.

**Validates: Requirements 6.3**

### Property 21: Email Retry Logic

_For any_ failed email delivery, the system SHALL retry sending up to 3 times with exponential backoff.

**Validates: Requirements 6.4**

### Property 22: Email Opt-out Respect

_For any_ customer with email notifications opted out, the system SHALL NOT send check-in notification emails.

**Validates: Requirements 6.5**

### Property 23: Photo URL Storage

_For any_ uploaded check-in photo, the system SHALL store the cloud storage URL in the database.

**Validates: Requirements 7.2**

### Property 24: Customer Query Sorting

_For any_ customer requesting check-ins, the results SHALL be sorted by timestamp in descending order (newest first).

**Validates: Requirements 7.3**

### Property 25: Related Data Population

_For any_ check-in query result, the returned data SHALL include populated order information and shipper details.

**Validates: Requirements 7.4**

### Property 26: Geospatial Bounds Query

_For any_ geographic bounds query, the returned check-ins SHALL have GPS coordinates within the specified minLng, minLat, maxLng, maxLat bounds.

**Validates: Requirements 7.6**

### Property 27: EXIF GPS Extraction

_For any_ photo with EXIF GPS data, the system SHALL automatically extract and use the GPS coordinates.

**Validates: Requirements 8.3**

### Property 28: Offline Queue

_For any_ check-in created while offline, the system SHALL queue the check-in locally and submit when connection is restored.

**Validates: Requirements 8.4, 14.1**

### Property 29: Shipper History Filtering

_For any_ shipper accessing history, the displayed check-ins SHALL contain only check-ins created by that shipper.

**Validates: Requirements 9.1**

### Property 30: History Data Completeness

_For any_ check-in in history list, the displayed data SHALL include thumbnail, timestamp, address, and order number.

**Validates: Requirements 9.2**

### Property 31: History Date and Status Filtering

_For any_ history filter with date range and order status, the results SHALL match both the date range and status criteria.

**Validates: Requirements 9.3**

### Property 32: History Pagination

_For any_ paginated history request, each page SHALL contain exactly 20 items (or fewer for the last page).

**Validates: Requirements 9.5**

### Property 33: Order Status Update on Check-in

_For any_ check-in created for an order, the order status SHALL be updated to "delivered".

**Validates: Requirements 10.1**

### Property 34: Status Change Timestamp

_For any_ order status update, the system SHALL record the timestamp of the status change.

**Validates: Requirements 10.2**

### Property 35: Multi-recipient Tracking

_For any_ order with multiple recipients, the system SHALL track check-ins separately for each recipient.

**Validates: Requirements 10.3**

### Property 36: Order Completion Logic

_For any_ order where all recipients have check-ins, the order status SHALL be marked as "completed".

**Validates: Requirements 10.4**

### Property 37: Check-in Deletion Reverts Status

_For any_ deleted check-in, if it was the only check-in for the order, the order status SHALL be reverted from "delivered".

**Validates: Requirements 10.5**

### Property 38: Photo Compression

_For any_ uploaded photo, the compressed version SHALL be at most 2MB in size.

**Validates: Requirements 11.1**

### Property 39: Thumbnail Generation

_For any_ uploaded photo, the system SHALL generate a thumbnail with dimensions 300x300 pixels.

**Validates: Requirements 11.2**

### Property 40: Signed URL Expiration

_For any_ generated photo URL, the signed URL SHALL have an expiration time of 1 year from generation.

**Validates: Requirements 11.4**

### Property 41: EXIF Metadata Stripping

_For any_ photo with EXIF data, the system SHALL strip all sensitive metadata except GPS coordinates before storage.

**Validates: Requirements 11.5**

### Property 42: Parallel Photo Processing

_For any_ check-in with multiple photos, the system SHALL process photo uploads in parallel.

**Validates: Requirements 11.6**

### Property 43: Marker Clustering

_For any_ map view with more than 50 markers at zoom level below 12, the system SHALL implement marker clustering.

**Validates: Requirements 12.2**

### Property 44: Viewport Bounds Loading

_For any_ map pan or zoom operation, the system SHALL load only markers within the current viewport bounds.

**Validates: Requirements 12.3**

### Property 45: Photo Access Control

_For any_ unauthenticated request to access check-in photos, the system SHALL deny access with UnauthorizedException.

**Validates: Requirements 13.2**

### Property 46: GPS Coordinate Privacy

_For any_ unauthorized user requesting check-in details, the system SHALL NOT expose exact GPS coordinates.

**Validates: Requirements 13.3**

### Property 47: Shipper Order Assignment Verification

_For any_ shipper accessing check-in for an order, the system SHALL verify the shipper is assigned to that order, otherwise throw ForbiddenException.

**Validates: Requirements 13.4**

### Property 48: Customer Order Ownership Verification

_For any_ customer accessing check-ins, the system SHALL verify the customer owns the orders, otherwise throw ForbiddenException.

**Validates: Requirements 13.5**

### Property 49: Soft Delete with Audit Trail

_For any_ deleted check-in, the record SHALL be soft-deleted (isDeleted=true) and SHALL maintain deletedAt timestamp and deletedBy user reference.

**Validates: Requirements 13.6**

### Property 50: Photo Upload Retry

_For any_ individual photo upload failure, the system SHALL allow retry of that specific photo without re-submitting the entire form.

**Validates: Requirements 14.3**

### Property 51: Server Error Logging

_For any_ server error during check-in operations, the system SHALL log error details including stack trace and context.

**Validates: Requirements 14.5**

## Testing Strategy

### Unit Tests

1. **Service Layer Tests**:

   - DeliveryCheckinService.createCheckin()
   - GoongGeocodingService.reverseGeocode()
   - PhotoUploadService.compressImage()
   - ThreadIntegrationService.createDeliveryThread()

2. **Repository Layer Tests**:

   - CRUD operations
   - Geospatial queries
   - Pagination

3. **Utility Tests**:
   - Address formatting
   - GPS validation
   - Photo compression

### Integration Tests

1. **API Endpoint Tests**:

   - POST /api/delivery-checkins (with file upload)
   - GET /api/delivery-checkins/customer/:id
   - DELETE /api/delivery-checkins/:id

2. **Thread Integration Tests**:

   - Check-in creates thread
   - Photos attached to thread
   - Participants added correctly

3. **External Service Tests**:
   - Goong.io API integration
   - Email sending
   - Cloud storage upload

### End-to-End Tests

1. **Shipper Flow**:

   - Login as shipper
   - Create check-in with photo
   - View history

2. **Customer Flow**:

   - View map with check-ins
   - Click marker to see details
   - Navigate to thread

3. **Offline Flow**:
   - Create check-in offline
   - Verify queued
   - Sync when online

### Property-Based Testing

**Framework**: Use `fast-check` for JavaScript/TypeScript property-based testing.

**Configuration**: Each property test MUST run a minimum of 100 iterations to ensure adequate coverage of the input space.

**Tagging**: Each property-based test MUST be tagged with a comment explicitly referencing the correctness property from the design document using this format: `// Feature: delivery-checkin-system, Property X: [property text]`

**Key Properties to Test**:

1. **Property 4: Shipper Order Filtering** - Generate random shipper IDs and orders, verify filtering
2. **Property 5: File Type Validation** - Generate random file types, verify accept/reject logic
3. **Property 6: Check-in Data Completeness** - Generate random check-in data, verify all required fields present
4. **Property 10: Thread Message Format** - Generate random shipper names, addresses, order numbers, verify format
5. **Property 15: GPS Accuracy Validation** - Generate random GPS accuracy values, verify threshold logic
6. **Property 17: Date Range Filtering** - Generate random date ranges and check-ins, verify filtering
7. **Property 24: Customer Query Sorting** - Generate random check-ins, verify descending timestamp sort
8. **Property 26: Geospatial Bounds Query** - Generate random bounds and coordinates, verify inclusion
9. **Property 32: History Pagination** - Generate random check-in counts, verify page size
10. **Property 38: Photo Compression** - Generate random images, verify compressed size ≤ 2MB
11. **Property 39: Thumbnail Generation** - Generate random images, verify thumbnail dimensions
12. **Property 43: Marker Clustering** - Generate random marker counts, verify clustering at zoom < 12
13. **Property 49: Soft Delete with Audit Trail** - Generate random deletions, verify soft delete fields

### Testing Tools

- **Unit/Integration**: Jest
- **Property-Based**: fast-check
- **E2E**: Playwright or Cypress
- **API Testing**: Supertest
- **Mocking**: jest.mock() for external services
