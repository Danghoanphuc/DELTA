# Requirements Document - Delivery Check-in System

## Introduction

Hệ thống Delivery Check-in cho phép shipper (nhân viên giao hàng) check-in tại địa điểm giao hàng với ảnh chứng minh, GPS location, và ghi chú. Mỗi check-in sẽ được tạo thành một thread post (giống Facebook check-in) để customer có thể theo dõi trên dashboard dưới dạng bản đồ timeline. Hệ thống tích hợp với threaded-chat system hiện có và sử dụng Goong.io API cho GPS verification.

## Glossary

- **Shipper**: Nhân viên giao hàng, có tài khoản riêng trên hệ thống Printz
- **Check-in**: Hành động shipper xác nhận đã giao hàng tại một địa điểm cụ thể với ảnh và GPS
- **Delivery Thread**: Thread được tạo tự động khi shipper check-in, chứa thông tin giao hàng
- **Check-in Map**: Bản đồ hiển thị các điểm check-in của shipper trên timeline
- **GPS Verification**: Xác thực tọa độ GPS thông qua Goong.io API
- **Delivery Proof**: Bằng chứng giao hàng bao gồm ảnh, GPS, timestamp
- **Customer Dashboard**: Giao diện khách hàng xem lịch sử giao hàng trên bản đồ
- **Goong.io**: Dịch vụ bản đồ và geocoding API của Việt Nam

## Requirements

### Requirement 1: Shipper Authentication and Authorization

**User Story:** As a system administrator, I want shippers to have dedicated accounts with specific permissions, so that they can access delivery check-in features while maintaining security.

#### Acceptance Criteria

1. WHEN a shipper account is created THEN the System SHALL assign role "shipper" with permissions for check-in operations
2. WHEN a shipper logs into Printz platform THEN the System SHALL authenticate credentials and grant access to shipper-specific features
3. WHEN a shipper attempts to access non-shipper features THEN the System SHALL deny access and return authorization error
4. WHEN a shipper views orders THEN the System SHALL display only orders assigned to that shipper
5. WHERE a shipper account is active THEN the System SHALL maintain session state for mobile and web access

### Requirement 2: Delivery Check-in Creation

**User Story:** As a shipper, I want to create a check-in when I deliver an order, so that I can provide proof of delivery with photos and location.

#### Acceptance Criteria

1. WHEN a shipper initiates check-in THEN the System SHALL capture current GPS coordinates using device location API
2. WHEN a shipper uploads delivery photos THEN the System SHALL accept multiple image files and validate file types (JPEG, PNG, WebP)
3. WHEN a shipper submits check-in with required data THEN the System SHALL create a delivery check-in record with timestamp, GPS, photos, and order reference
4. WHEN GPS coordinates are captured THEN the System SHALL verify location accuracy using Goong.io Geocoding API
5. WHEN a shipper adds optional notes THEN the System SHALL store notes with check-in record
6. IF GPS coordinates are unavailable THEN the System SHALL prevent check-in submission and display error message
7. IF photo upload fails THEN the System SHALL retry upload and notify shipper of failure

### Requirement 3: Thread Integration for Check-in Posts

**User Story:** As a shipper, I want my check-in to automatically create a thread post, so that customers can see my delivery updates in a social feed format.

#### Acceptance Criteria

1. WHEN a check-in is created THEN the System SHALL automatically create a new thread linked to the order
2. WHEN a thread is created for check-in THEN the System SHALL format message as "Shipper [Name] đã check-in tại [Address] - Giao hàng cho đơn [OrderNumber]"
3. WHEN a check-in thread is created THEN the System SHALL attach delivery photos as thread attachments
4. WHEN a check-in thread is created THEN the System SHALL embed GPS coordinates as thread metadata
5. WHEN a check-in thread is created THEN the System SHALL set thread type as "delivery_checkin"
6. WHEN a check-in thread is created THEN the System SHALL add customer and shipper as thread participants

### Requirement 4: GPS Verification with Goong.io

**User Story:** As a system, I want to verify GPS coordinates using Goong.io API, so that check-in locations are accurate and trustworthy.

#### Acceptance Criteria

1. WHEN GPS coordinates are captured THEN the System SHALL call Goong.io Geocoding API to reverse geocode coordinates to address
2. WHEN Goong.io returns address THEN the System SHALL store both coordinates and formatted address with check-in
3. WHEN GPS accuracy is below 50 meters THEN the System SHALL accept coordinates as valid
4. IF GPS accuracy exceeds 50 meters THEN the System SHALL warn shipper about low accuracy but allow submission
5. WHEN Goong.io API is unavailable THEN the System SHALL store coordinates without address and retry geocoding later
6. WHEN address is geocoded THEN the System SHALL display address to shipper for confirmation before submission

### Requirement 5: Customer Dashboard Map View

**User Story:** As a customer, I want to view all delivery check-ins on a map in my dashboard, so that I can track delivery history visually.

#### Acceptance Criteria

1. WHEN a customer accesses dashboard THEN the System SHALL display a map component showing all check-ins for customer's orders
2. WHEN check-ins are displayed on map THEN the System SHALL render markers at GPS coordinates with shipper avatar or icon
3. WHEN a customer clicks a map marker THEN the System SHALL display popup with check-in details (photos, timestamp, address, shipper name)
4. WHEN check-in popup is displayed THEN the System SHALL show delivery photos in a gallery format
5. WHEN a customer views map THEN the System SHALL center map on customer's location or most recent check-in
6. WHEN multiple check-ins exist THEN the System SHALL display timeline filter to show check-ins by date range
7. WHEN a customer clicks "View Thread" in popup THEN the System SHALL navigate to the delivery thread

### Requirement 6: Email Notifications for Check-in Events

**User Story:** As a customer, I want to receive email notifications when a shipper checks in, so that I am informed about delivery progress in real-time.

#### Acceptance Criteria

1. WHEN a check-in is created THEN the System SHALL send email notification to customer's registered email address
2. WHEN email is sent THEN the System SHALL include check-in timestamp, address, shipper name, and link to view on map
3. WHEN email is sent THEN the System SHALL include thumbnail of first delivery photo
4. WHEN email delivery fails THEN the System SHALL retry sending up to 3 times with exponential backoff
5. WHEN customer has email preferences THEN the System SHALL respect opt-out settings for delivery notifications

### Requirement 7: Check-in Data Storage and Retrieval

**User Story:** As a system, I want to store check-in data efficiently, so that it can be retrieved quickly for map display and reporting.

#### Acceptance Criteria

1. WHEN a check-in is created THEN the System SHALL store record with orderId, shipperId, timestamp, GPS coordinates, photos, address, and notes
2. WHEN check-in photos are uploaded THEN the System SHALL store images in cloud storage and save URLs in database
3. WHEN customer requests check-ins THEN the System SHALL query database by customerId and return results sorted by timestamp descending
4. WHEN check-ins are queried THEN the System SHALL include related order information and shipper details
5. WHEN check-in data is stored THEN the System SHALL create geospatial index on GPS coordinates for efficient map queries
6. WHEN check-ins are retrieved for map THEN the System SHALL return data within specified geographic bounds

### Requirement 8: Mobile-Optimized Check-in Interface

**User Story:** As a shipper, I want a mobile-friendly check-in interface, so that I can easily create check-ins while on the road.

#### Acceptance Criteria

1. WHEN a shipper accesses check-in interface on mobile THEN the System SHALL display responsive UI optimized for touch input
2. WHEN a shipper uses camera THEN the System SHALL provide native camera integration for photo capture
3. WHEN a shipper captures photo THEN the System SHALL automatically extract EXIF GPS data if available
4. WHEN a shipper is offline THEN the System SHALL queue check-in for submission when connection is restored
5. WHEN GPS is being acquired THEN the System SHALL display loading indicator with accuracy status
6. WHEN check-in form is displayed THEN the System SHALL pre-fill order information from assigned deliveries

### Requirement 9: Check-in History and Timeline

**User Story:** As a shipper, I want to view my check-in history, so that I can track my delivery performance and review past deliveries.

#### Acceptance Criteria

1. WHEN a shipper accesses history page THEN the System SHALL display list of all check-ins created by that shipper
2. WHEN check-in history is displayed THEN the System SHALL show thumbnail, timestamp, address, and order number for each check-in
3. WHEN a shipper filters history THEN the System SHALL support filtering by date range and order status
4. WHEN a shipper views check-in details THEN the System SHALL display full photos, GPS coordinates, and thread link
5. WHEN check-in history is loaded THEN the System SHALL paginate results with 20 items per page

### Requirement 10: Order Status Integration

**User Story:** As a system, I want check-ins to update order status automatically, so that order tracking reflects delivery progress.

#### Acceptance Criteria

1. WHEN a check-in is created for an order THEN the System SHALL update order status to "delivered"
2. WHEN order status is updated THEN the System SHALL record timestamp of status change
3. WHEN order has multiple recipients THEN the System SHALL track check-ins per recipient and update status accordingly
4. WHEN all recipients have check-ins THEN the System SHALL mark order as "completed"
5. IF check-in is created for wrong order THEN the System SHALL allow shipper to delete check-in and revert order status

### Requirement 11: Photo Upload and Storage

**User Story:** As a system, I want to handle photo uploads efficiently, so that delivery photos are stored securely and loaded quickly.

#### Acceptance Criteria

1. WHEN a shipper uploads photo THEN the System SHALL compress image to maximum 2MB while maintaining quality
2. WHEN photo is uploaded THEN the System SHALL generate thumbnail (300x300) for map markers and list views
3. WHEN photo is stored THEN the System SHALL use cloud storage (AWS S3 or equivalent) with CDN for fast delivery
4. WHEN photo URL is generated THEN the System SHALL create signed URL with 1-year expiration
5. WHEN photo contains EXIF data THEN the System SHALL strip sensitive metadata except GPS coordinates
6. WHEN multiple photos are uploaded THEN the System SHALL process uploads in parallel with progress indicator

### Requirement 12: Map Rendering Performance

**User Story:** As a customer, I want the check-in map to load quickly, so that I can view delivery locations without delay.

#### Acceptance Criteria

1. WHEN map is loaded THEN the System SHALL render within 2 seconds on standard broadband connection
2. WHEN map has many markers THEN the System SHALL implement marker clustering for zoom levels below 12
3. WHEN map is panned or zoomed THEN the System SHALL load markers within viewport bounds only
4. WHEN marker is clicked THEN the System SHALL load popup data asynchronously without blocking UI
5. WHEN map tiles are loaded THEN the System SHALL cache tiles using Goong.io tile caching strategy

### Requirement 13: Security and Privacy

**User Story:** As a system administrator, I want check-in data to be secure, so that customer and shipper information is protected.

#### Acceptance Criteria

1. WHEN check-in data is transmitted THEN the System SHALL use HTTPS encryption for all API calls
2. WHEN photos are stored THEN the System SHALL restrict access to authenticated users only
3. WHEN GPS coordinates are stored THEN the System SHALL not expose exact coordinates to unauthorized users
4. WHEN shipper accesses check-ins THEN the System SHALL verify shipper is assigned to the order
5. WHEN customer accesses check-ins THEN the System SHALL verify customer owns the order
6. WHEN check-in is deleted THEN the System SHALL soft-delete record and maintain audit trail

### Requirement 14: Error Handling and Resilience

**User Story:** As a shipper, I want the system to handle errors gracefully, so that I can complete check-ins even with poor connectivity.

#### Acceptance Criteria

1. WHEN network connection is lost during upload THEN the System SHALL save check-in draft locally and retry when online
2. WHEN GPS acquisition fails THEN the System SHALL display clear error message with retry option
3. WHEN photo upload fails THEN the System SHALL allow shipper to retry individual photos without re-submitting form
4. WHEN Goong.io API is unavailable THEN the System SHALL proceed with check-in using coordinates only
5. WHEN server error occurs THEN the System SHALL log error details and display user-friendly message to shipper
