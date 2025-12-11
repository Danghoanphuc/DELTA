# Implementation Plan - Delivery Check-in System

## Overview

This implementation plan breaks down the Delivery Check-in System into incremental, manageable tasks. Each task builds on previous ones, ensuring continuous integration and testability.

---

## Tasks

- [x] 1. Set up project structure and core models

  - Create delivery-checkin module structure following layered architecture
  - Define DeliveryCheckin model with geospatial indexing
  - Extend User model with shipper role and shipperProfile fields
  - Set up database indexes for performance
  - _Requirements: 1.1, 7.1, 7.5_

- [x] 1.1 Write property test for shipper role assignment

  - **Property 1: Shipper Role Assignment**
  - **Validates: Requirements 1.1**

- [x] 2. Implement DeliveryCheckinRepository

  - Create repository class with CRUD operations
  - Implement findByOrder(), findByShipper(), findByCustomer()
  - Implement findWithinBounds() for geospatial queries
  - Implement soft delete functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.6, 13.6_

- [x] 2.1 Write property test for geospatial bounds query

  - **Property 26: Geospatial Bounds Query**
  - **Validates: Requirements 7.6**

- [x] 2.2 Write property test for soft delete with audit trail

  - **Property 49: Soft Delete with Audit Trail**
  - **Validates: Requirements 13.6**

- [x] 3. Implement GoongGeocodingService

  - Set up Goong.io API client with authentication
  - Implement reverseGeocode() method
  - Implement validateCoordinates() with accuracy threshold
  - Implement formatAddress() for Vietnamese addresses
  - Add error handling for API failures
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 3.1 Write property test for GPS accuracy validation

  - **Property 15: GPS Accuracy Validation**
  - **Validates: Requirements 4.3**

- [x] 4. Implement PhotoUploadService

  - Set up cloud storage client (AWS S3 or Cloudinary)
  - Implement uploadPhoto() with compression
  - Implement compressImage() using sharp library (max 2MB)
  - Implement generateThumbnail() (300x300)
  - Implement EXIF data extraction and stripping
  - Generate signed URLs with 1-year expiration
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 4.1 Write property test for photo compression

  - **Property 38: Photo Compression**
  - **Validates: Requirements 11.1**

- [ ]\* 4.2 Write property test for thumbnail generation

  - **Property 39: Thumbnail Generation**
  - **Validates: Requirements 11.2**

- [ ]\* 4.3 Write property test for EXIF metadata stripping

  - **Property 41: EXIF Metadata Stripping**
  - **Validates: Requirements 11.5**

- [x] 5. Implement ThreadIntegrationService

  - Create service to integrate with existing ThreadService
  - Implement createDeliveryThread() method
  - Implement formatThreadMessage() with required format
  - Implement attachPhotosToThread() method
  - Add customer and shipper as thread participants
  - Embed GPS coordinates in thread metadata
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5.1 Write property test for thread message format

  - **Property 10: Thread Message Format**
  - **Validates: Requirements 3.2**

- [x] 5.2 Write property test for thread participants

  - **Property 13: Thread Participants**
  - **Validates: Requirements 3.6**

- [x] 6. Implement EmailNotificationService

  - Set up email service client (SendGrid or equivalent)
  - Create email template for check-in notifications
  - Implement sendCheckinNotification() method
  - Implement retry logic with exponential backoff (max 3 retries)
  - Implement email opt-out checking
  - Include photo thumbnail in email
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.1 Write property test for email retry logic

  - **Property 21: Email Retry Logic**
  - **Validates: Requirements 6.4**

- [x] 6.2 Write property test for email opt-out respect

- [x] 6.2 Write property test for email opt-out respect

  - **Property 22: Email Opt-out Respect**
  - **Validates: Requirements 6.5**

-

- [x] 7. Implement DeliveryCheckinService - Core Logic

  - Create service class with repository injection
  - Implement createCheckin() method with full workflow:
    - Validate shipper has access to order
    - Validate GPS coordinates
    - Call GoongGeocodingService for address
    - Call PhotoUploadService for photos
    - Create check-in record
    - Call ThreadIntegrationService
    - Update order status
    - Call EmailNotificationService
  - Implement error handling for each step
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 7.1 Write property test for check-in data completeness

  - **Property 6: Check-in Data Completeness**
  - **Validates: Requirements 2.3, 7.1**

- [x] 7.2 Write property test for thread creation on check-in

  - **Property 9: Thread Creation on Check-in**
  - **Validates: Requirements 3.1, 3.5**

-
-

- [x] 7.3 Write property test for email notification trigger

  - **Property 18: Email Notification Trigger**
  - **Validates: Requirements 6.1**

- [x] 8. Implement DeliveryCheckinService - Query Methods

  - Implement getCheckin() with authorization checks
  - Implement getCheckinsByOrder() with filtering
  - Implement getCheckinsByShipper() with pagination
  - Implement getCheckinsByCustomer() with date range filtering
  - Implement deleteCheckin() with status reversion
  - _Requirements: 7.3, 7.4, 9.1, 9.2, 9.3, 9.5, 10.5, 13.4, 13.5_

- [x] 8.1 Write property test for shipper order filtering

  - **Property 4: Shipper Order Filtering**
  - **Validates: Requirements 1.4**

- [x] 8.2 Write property test for customer check-in filtering

  - **Property 16: Customer Check-in Filtering**
  - **Validates: Requirements 5.1**

- [x] 8.3 Write property test for date range filtering

  - **Property 17: Date Range Filtering**
  - **Validates: Requirements 5.6**

- [x] 8.4 Write property test for customer query sorting

  - **Property 24: Customer Query Sorting**
  - **Validates: Requirements 7.3**

- [x] 8.5 Write property test for history pagination

  - **Property 32: History Pagination**
  - **Validates: Requirements 9.5**

- [x] 9. Implement Order Status Integration

  - Add logic to update order status to "delivered" on check-in
  - Record timestamp of status change
  - Implement multi-recipient tracking logic
  - Implement order completion logic (all recipients checked-in)
  - Implement status reversion on check-in deletion
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 9.1 Write property test for order status update

  - **Property 33: Order Status Update on Check-in**
  - **Validates: Requirements 10.1**

- [x] 9.2 Write property test for order completion logic

  - **Property 36: Order Completion Logic**
  - **Validates: Requirements 10.4**

- [x] 9.3 Write property test for check-in deletion reverts status

  - **Property 37: Check-in Deletion Reverts Status**
  - **Validates: Requirements 10.5**

- [ ] 10. Checkpoint - Ensure all backend tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement API Controllers and Routes

  - Create DeliveryCheckinController with HTTP handlers
  - Implement POST /api/delivery-checkins (with multipart file upload)
  - Implement GET /api/delivery-checkins
  - Implement GET /api/delivery-checkins/:id
  - Implement DELETE /api/delivery-checkins/:id
  - Implement GET /api/delivery-checkins/order/:orderId
  - Implement GET /api/delivery-checkins/shipper/:shipperId
  - Implement GET /api/delivery-checkins/customer/:customerId
  - Implement GET /api/delivery-checkins/map/bounds
  - Add authentication middleware
  - Add authorization middleware for shipper/customer roles
  - _Requirements: All API-related requirements_

- [x] 11.1 Write integration tests for API endpoints

  - Test POST with file upload
  - Test GET with filtering and pagination
  - Test DELETE with authorization
  - Test geospatial bounds query

- [x] 12. Implement Shipper Authentication and Authorization

  - Add shipper role to authentication middleware
  - Implement shipper-specific authorization checks
  - Implement order assignment verification
  - Add authorization boundaries for non-shipper features
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 13.4_

- [x] 12.1 Write property test for shipper authorization boundaries

  - **Property 3: Shipper Authorization Boundaries**
  - **Validates: Requirements 1.3**

- [ ]\* 12.2 Write property test for shipper order assignment verification

  - **Property 47: Shipper Order Assignment Verification**
  - **Validates: Requirements 13.4**

-

- [x] 13. Implement Security and Privacy Controls

  - Implement photo access control for authenticated users only
  - Implement GPS coordinate privacy for unauthorized users
  - Implement customer order ownership verification
  - Add HTTPS enforcement in production
  - _Requirements: 13.1, 13.2, 13.3, 13.5_

- [ ]\* 13.1 Write property test for photo access control

  - **Property 45: Photo Access Control**
  - **Validates: Requirements 13.2**

- [ ]\* 13.2 Write property test for customer order ownership verification

  - **Property 48: Customer Order Ownership Verification**
  - **Validates: Requirements 13.5**

- [x] 14. Implement Frontend - Shipper Mobile Check-in Form

  - Create CheckinForm component with camera integration
  - Implement GPS capture with accuracy indicator
  - Implement photo preview and management (multiple photos)
  - Implement notes input field
  - Implement form validation
  - Implement submit with loading state
  - Add error handling and user feedback
  - _Requirements: 2.1, 2.2, 2.3, 2.5, 8.1, 8.2, 8.5, 8.6_

- [ ]\* 14.1 Write unit tests for CheckinForm component

  - Test camera integration
  - Test GPS capture
  - Test form validation
  - Test submit flow

- [x] 15. Implement Frontend - Offline Support

  - Implement offline detection
  - Implement local storage queue for check-ins
  - Implement auto-sync when connection restored
  - Implement EXIF GPS extraction from photos
  - Add sync status indicator
  - _Requirements: 8.3, 8.4, 14.1_

- [ ]\* 15.1 Write property test for offline queue

  - **Property 28: Offline Queue**
  - **Validates: Requirements 8.4, 14.1**

- [ ]\* 15.2 Write property test for EXIF GPS extraction

  - **Property 27: EXIF GPS Extraction**
  - **Validates: Requirements 8.3**

- [x] 16. Implement Frontend - Shipper Check-in History

  - Create CheckinHistory component
  - Implement list view with thumbnails
  - Implement date range filter
  - Implement order status filter
  - Implement pagination (20 items per page)
  - Implement check-in detail view
  - Implement delete functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]\* 16.1 Write unit tests for CheckinHistory component

  - Test filtering
  - Test pagination
  - Test delete flow

- [x] 17. Implement Frontend - Customer Dashboard Map View

  - Create DeliveryMapView component with Goong.io integration
  - Implement map initialization with user location
  - Implement marker rendering for check-ins
  - Implement marker clustering for zoom < 12
  - Implement viewport bounds loading
  - Implement timeline date range filter
  - _Requirements: 5.1, 5.2, 5.5, 5.6, 12.2, 12.3_

- [ ]\* 17.1 Write property test for marker clustering

  - **Property 43: Marker Clustering**
  - **Validates: Requirements 12.2**

- [ ]\* 17.2 Write property test for viewport bounds loading

  - **Property 44: Viewport Bounds Loading**
  - **Validates: Requirements 12.3**

- [x] 18. Implement Frontend - Check-in Popup Component

  - Create CheckinPopup component
  - Display shipper info with avatar
  - Display photo gallery with lightbox
  - Display address and timestamp
  - Display notes if available
  - Add "View Thread" button with navigation
  - _Requirements: 5.3, 5.4, 5.7_

- [ ]\* 18.1 Write unit tests for CheckinPopup component

  - Test data display
  - Test photo gallery
  - Test thread navigation

- [x] 19. Implement Frontend Services and Hooks

  - Create DeliveryCheckinService for API calls
  - Create useDeliveryCheckins hook for customer
  - Create useShipperCheckins hook for shipper
  - Create useCheckinForm hook for form state
  - Create useOfflineQueue hook for offline support
  - Implement error handling and toast notifications
  - _Requirements: All frontend-related requirements_

- [ ]\* 19.1 Write unit tests for hooks

  - Test useDeliveryCheckins
  - Test useShipperCheckins
  - Test useCheckinForm
  - Test useOfflineQueue

- [x] 20. Checkpoint - Ensure all frontend tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 21. Integration Testing - End-to-End Flows

  - Write E2E test for shipper check-in flow
  - Write E2E test for customer map view flow
  - Write E2E test for offline sync flow
  - Write E2E test for multi-recipient order flow
  - Write E2E test for email notification flow
  - _Requirements: All requirements_

- [x] 21.1 Run all E2E tests

  - Verify shipper flow
  - Verify customer flow
  - Verify offline flow
  - Verify multi-recipient flow

- [x] 22. Performance Optimization

  - Optimize photo compression and upload
  - Implement parallel photo processing
  - Optimize geospatial queries with proper indexes
  - Implement map tile caching
  - Optimize API response times
  - _Requirements: 11.6, 12.1, 12.5_

- [ ]\* 22.1 Write property test for parallel photo processing

  - **Property 42: Parallel Photo Processing**
  - **Validates: Requirements 11.6**

- [ ] 23. Documentation and Deployment

  - Write API documentation
  - Write user guide for shippers
  - Write user guide for customers
  - Set up environment variables for production
  - Configure cloud storage and CDN
  - Configure Goong.io API keys
  - Configure email service
  - Deploy to staging environment
  - Perform smoke tests
  - Deploy to production

- [ ] 24. Final Checkpoint - Production Verification

  - Ensure all tests pass, ask the user if questions arise.
  - Verify all features work in production
  - Monitor error logs
  - Monitor email delivery
  - Monitor API performance
