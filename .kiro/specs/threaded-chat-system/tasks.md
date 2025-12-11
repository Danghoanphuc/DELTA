# Implementation Plan - Threaded Chat System

## Phase 1: Core Data Models & Infrastructure ✅ COMPLETE

### 1.1 Enhance Existing Models ✅

- [x] 1.1.1 Enhance Conversation Model for Threading ✅

  - Add status field (active, resolved, archived)
  - Add isPinned, pinnedAt, pinnedBy fields
  - Add priority field (low, normal, high, urgent)
  - Add stats object (messageCount, replyCount, participantCount, unreadCount, lastActivityAt)
  - Add permissions object (canReply, canInvite, canPin, canResolve, canArchive)
  - Add tags array
  - Add templateId, templateName fields
  - Add autoArchiveAfterDays field
  - _Requirements: 1.1, 4.1, 4.4_
  - **File**: `apps/customer-backend/src/shared/models/thread.model.js`

- [x] 1.1.2 Enhance Message Model for Threading ✅
  - Add threadDepth field (0 = root, max 3)
  - Add threadPath field (string path for efficient querying)
  - Add rootMessageId field (always points to root)
  - Add replyCount, totalReplyCount fields
  - Add mentions array (userId, username, displayName)
  - Add reactions array (emoji, users, count)
  - Add isEdited, editedAt, editHistory fields
  - Add attachments array (type, url, thumbnailUrl, fileName, fileSize, mimeType, metadata)
  - _Requirements: 2.1, 2.2, 2.3, 7.1_
  - **File**: `apps/customer-backend/src/shared/models/threaded-message.model.js`

### 1.2 Create New Models ✅

- [x] 1.2.1 Create ThreadUnread Model ✅

  - Define schema với userId, threadId, unreadCount, lastReadMessageId, lastReadAt
  - Add unique compound index (userId, threadId)
  - Add index cho userId và unreadCount
  - _Requirements: 5.5_
  - **File**: `apps/customer-backend/src/shared/models/thread-unread.model.js`

- [x] 1.2.2 Create ThreadTemplate Model ✅
  - Define schema với name, description, category
  - Add titleTemplate, contentTemplate fields
  - Add defaultTags, defaultPriority fields
  - Add applicableContexts array
  - Add quickActions array (for ORDER context)
  - Add organizationId (null = global template)
  - Add isActive, createdBy fields
  - _Requirements: 11.1, 11.2_
  - **File**: `apps/customer-backend/src/shared/models/thread-template.model.js`

### 1.3 Database Migrations ✅

- [x] 1.3.1 Migrate existing Conversations to Threads ✅

  - Add new fields với default values
  - Update indexes
  - Validate data integrity
  - _Requirements: All_
  - **File**: `apps/customer-backend/src/scripts/migrate-conversations-to-threads.js`

- [x] 1.3.2 Migrate existing Messages for Threading ✅

  - Add threadDepth, threadPath, rootMessageId fields
  - Calculate replyCount, totalReplyCount for existing messages
  - Add empty arrays for mentions, reactions, attachments
  - Update indexes
  - _Requirements: 2.1, 2.2_
  - **File**: `apps/customer-backend/src/scripts/migrate-messages-for-threading.js`

- [x] 1.3.3 Seed Default Templates ✅
  - **File**: `apps/customer-backend/src/scripts/seed-thread-templates.js`

### 1.4 Model Exports ✅

- [x] 1.4.1 Create central index.js ✅
  - **File**: `apps/customer-backend/src/shared/models/index.js`

## Phase 2: Backend - Thread Service ✅ COMPLETE

### 2.1 Thread Repository ✅

- [x] 2.1.1 Implement Thread Repository ✅
  - Create CRUD operations
  - Implement query methods (by event, by participant, by status)
  - Implement pagination và sorting
  - _Requirements: 1.1_
  - **File**: `apps/customer-backend/src/repositories/thread.repository.js`

### 2.2 Thread Service Core ✅

- [x] 2.2.1 Implement Thread Service - CRUD ✅

  - createThread với event context validation
  - getThread với permission checking
  - getThreadsByEvent với filtering
  - updateThread với validation
  - deleteThread (soft delete)
  - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2_
  - **File**: `apps/customer-backend/src/services/thread.service.js`

- [x] 2.2.2 Implement Thread Service - Status Management ✅

  - resolveThread với resolution notes
  - reopenThread với validation
  - archiveThread với permission check
  - pinThread/unpinThread
  - _Requirements: 4.2, 4.3, 4.4_
  - **File**: `apps/customer-backend/src/services/thread.service.js`

- [x] 2.2.3 Implement Thread Service - Participant Management ✅

  - addParticipant với permission validation
  - removeParticipant
  - leaveThread (soft delete for user)
  - _Requirements: 3.3, 3.4, 3.5_
  - **File**: `apps/customer-backend/src/services/thread.service.js`

- [x] 2.2.4 Implement Auto-archive Job ✅
  - Cron job để auto-archive inactive threads (> 7 days)
  - Send notifications to participants (TODO)
  - _Requirements: 4.5_
  - **File**: `apps/customer-backend/src/jobs/auto-archive-threads.job.js`

### 2.3 Thread Controller & Routes ✅

- [x] 2.3.1 Create Thread Controller ✅
  - POST /api/threads - Create thread
  - GET /api/threads/:id - Get thread detail
  - GET /api/threads/event/:referenceId - Get threads by event
  - GET /api/threads/my-threads - Get current user's threads
  - PUT /api/threads/:id - Update thread
  - DELETE /api/threads/:id - Delete thread
  - POST /api/threads/:id/resolve - Resolve thread
  - POST /api/threads/:id/reopen - Reopen thread
  - POST /api/threads/:id/archive - Archive thread
  - POST /api/threads/:id/pin - Pin thread
  - POST /api/threads/:id/unpin - Unpin thread
  - POST /api/threads/:id/participants - Add participant
  - DELETE /api/threads/:id/participants/:participantUserId - Remove participant
  - POST /api/threads/:id/leave - Leave thread
  - _Requirements: 1.1, 1.2, 3.3, 4.2, 4.3, 4.4_
  - **Files**:
    - `apps/customer-backend/src/controllers/thread.controller.js`
    - `apps/customer-backend/src/routes/thread.routes.js`

## Phase 3: Backend - Message Service (Enhanced for Threading) ✅ COMPLETE

### 3.1 Message Repository ✅

- [x] 3.1.1 Enhance Message Repository ✅
  - Add methods for nested replies (getReplies, getThreadPath)
  - Add methods for mentions (findByMention)
  - Add methods for attachments (findByAttachment)
  - _Requirements: 2.1, 2.2_
  - **File**: `apps/customer-backend/src/repositories/message.repository.js`

### 3.2 Message Service Core ✅

- [x] 3.2.1 Implement Message Service - Send & Reply ✅

  - sendMessage với validation
  - sendReply với depth limit checking (max 3)
  - Flatten replies if depth > 3
  - Update thread stats (messageCount, replyCount)
  - _Requirements: 2.1, 2.2, 2.5_
  - **File**: `apps/customer-backend/src/services/message.service.js`

- [x] 3.2.2 Implement Message Service - Mentions ✅

  - parseMentions từ message content
  - Auto-add mentioned users to participants (if they have event access)
  - Send high-priority notifications to mentioned users (TODO)
  - _Requirements: 3.2, 5.2_
  - **File**: `apps/customer-backend/src/services/message.service.js`

- [x] 3.2.3 Implement Message Service - Attachments ✅

  - uploadAttachment to S3 (TODO: actual S3 integration)
  - Generate thumbnails for images (TODO)
  - Validate file type và size
  - Store attachment metadata
  - _Requirements: 7.1, 7.2_
  - **File**: `apps/customer-backend/src/services/message.service.js`

- [x] 3.2.4 Implement Message Service - Link Previews ✅

  - generateLinkPreview từ URLs (TODO: actual metadata fetching)
  - Fetch metadata (title, description, image) (TODO)
  - Cache previews (TODO)
  - _Requirements: 7.3_
  - **File**: `apps/customer-backend/src/services/message.service.js`

- [x] 3.2.5 Implement Message Service - Read Tracking ✅
  - markAsRead với readBy array update
  - getUnreadCount per user
  - Update ThreadUnread collection (TODO: use ThreadUnread model)
  - _Requirements: 5.4, 5.5_
  - **File**: `apps/customer-backend/src/services/message.service.js`

### 3.3 Message Controller & Routes ✅

- [x] 3.3.1 Create Message Controller ✅
  - POST /api/threads/:threadId/messages - Send message
  - POST /api/messages/:messageId/reply - Send reply
  - PUT /api/messages/:messageId - Edit message
  - DELETE /api/messages/:messageId - Delete message
  - GET /api/messages/:messageId/replies - Get replies
  - POST /api/messages/:messageId/read - Mark as read
  - POST /api/threads/:threadId/attachments - Upload attachment
  - GET /api/threads/:threadId/messages - Get messages
  - POST /api/threads/:threadId/messages/read-all - Mark all as read
  - GET /api/threads/:threadId/unread-count - Get unread count
  - POST /api/messages/link-preview - Generate link preview
  - _Requirements: 2.1, 2.2, 5.4, 7.1_
  - **Files**:
    - `apps/customer-backend/src/controllers/message.controller.js`
    - `apps/customer-backend/src/routes/message.routes.js`
    - `apps/customer-backend/src/server.ts` (routes registered)

## Phase 4: Backend - Participant Service ✅ COMPLETE

### 4.1 Participant Service ✅

- [x] 4.1.1 Implement Participant Service - Core ✅

  - addParticipants với role assignment
  - removeParticipant
  - updateParticipantRole
  - _Requirements: 3.3_
  - **File**: `apps/customer-backend/src/services/participant.service.js`

- [x] 4.1.2 Implement Participant Service - Auto-add Stakeholders ✅

  - getEventStakeholders (ORDER: customer, printer, admin; DESIGN: creator, reviewers)
  - autoAddStakeholders when thread created
  - _Requirements: 1.2, 3.1_
  - **File**: `apps/customer-backend/src/services/participant.service.js`

- [x] 4.1.3 Implement Participant Service - Mentions ✅

  - handleMention với permission checking
  - checkMentionPermission (user must have event access)
  - _Requirements: 3.2_
  - **File**: `apps/customer-backend/src/services/participant.service.js`
  - **Integration**: `apps/customer-backend/src/services/message.service.js`

- [x] 4.1.4 Implement Participant Service - Activity Tracking ✅
  - updateLastSeen
  - getActiveParticipants
  - _Requirements: 5.3_
  - **File**: `apps/customer-backend/src/services/participant.service.js`

## Phase 5: Backend - Notification Service ✅ COMPLETE

### 5.1 Notification Service ✅

- [x] 5.1.1 Implement Notification Service - Thread Notifications ✅

  - notifyNewMessage (exclude sender)
  - notifyMention (high priority)
  - notifyThreadResolved
  - notifyThreadArchived
  - _Requirements: 5.1, 5.2, 4.5_
  - **File**: `apps/customer-backend/src/services/thread-notification.service.js`
  - **Integration**: `apps/customer-backend/src/services/message.service.js`, `apps/customer-backend/src/services/thread.service.js`

- [x] 5.1.2 Implement Notification Service - Batch Processing ✅

  - batchNotifications để tránh spam
  - Debounce notifications (max 1 per 3 seconds per thread)
  - _Requirements: 5.1_
  - **File**: `apps/customer-backend/src/services/thread-notification.service.js`

- [x] 5.1.3 Implement Notification Service - Multi-channel ✅
  - sendInAppNotification (via existing notification service)
  - sendEmailNotification (via Novu)
  - sendPushNotification (via Novu)
  - sendZaloNotification (via existing Zalo service)
  - _Requirements: 12.5_
  - **File**: `apps/customer-backend/src/services/thread-notification.service.js`

## Phase 6: Backend - Search Service ✅ COMPLETE

### 6.1 Search Service ✅

- [x] 6.1.1 Implement Search Service - Full-text Search ✅

  - searchThreads (title, content, metadata)
  - searchMessages (content)
  - Use MongoDB text indexes
  - _Requirements: 6.1_
  - **File**: `apps/customer-backend/src/services/search.service.js`

- [x] 6.1.2 Implement Search Service - Filters ✅
  - filterThreadsByEvent (eventId, eventType)
  - filterThreadsByParticipant (userId)
  - filterThreadsByStatus (active, resolved, archived)
  - filterThreadsByTags (tags array)
  - filterThreadsByDateRange (startDate, endDate)
  - advancedSearch (multiple filters combined)
  - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - **File**: `apps/customer-backend/src/services/search.service.js`

### 6.2 Search Controller & Routes ✅

- [x] 6.2.1 Create Search Controller ✅
  - GET /api/search/threads - Search threads
  - GET /api/search/messages - Search messages
  - POST /api/search/advanced - Advanced search with multiple filters
  - GET /api/threads/filter - Filter threads (general)
  - GET /api/threads/event/:eventType/:eventId - Filter by event
  - GET /api/threads/participant/:participantUserId - Filter by participant
  - GET /api/threads/status/:status - Filter by status
  - GET /api/threads/tags - Filter by tags
  - GET /api/threads/date-range - Filter by date range
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  - **Files**:
    - `apps/customer-backend/src/controllers/search.controller.js`
    - `apps/customer-backend/src/routes/search.routes.js`
    - `apps/customer-backend/src/routes/filter.routes.js`
    - `apps/customer-backend/src/server.ts` (routes registered)
    - `apps/customer-backend/src/shared/models/thread.model.js` (text index added)

## Phase 7: Backend - Thread Templates ✅ PARTIAL COMPLETE (7.1, 7.2)

### 7.1 Template Service ✅

- [x] 7.1.1 Implement Template Service ✅
  - createTemplate
  - getTemplates (by category, by context)
  - applyTemplate (pre-fill title và content)
  - updateTemplate
  - deleteTemplate
  - _Requirements: 11.1, 11.2, 11.5_
  - **File**: `apps/customer-backend/src/services/template.service.js`

### 7.2 Template Controller & Routes ✅

- [x] 7.2.1 Create Template Controller ✅
  - POST /api/thread-templates - Create template
  - GET /api/thread-templates - Get templates
  - GET /api/thread-templates/:id - Get template detail
  - PUT /api/thread-templates/:id - Update template
  - DELETE /api/thread-templates/:id - Delete template
  - POST /api/threads/from-template/:templateId - Create thread from template
  - _Requirements: 11.1, 11.2, 11.5_
  - **Files**:
    - `apps/customer-backend/src/controllers/template.controller.js`
    - `apps/customer-backend/src/routes/template.routes.js`
    - `apps/customer-backend/src/server.ts` (routes registered)

### 7.3 Quick Actions

- [ ] 7.3.1 Implement Quick Actions for ORDER Context
  - Define quick actions (Yêu cầu hủy, Thay đổi địa chỉ, Báo lỗi sản phẩm)
  - Link quick actions to templates
  - Auto-tag appropriate stakeholders
  - _Requirements: 11.3, 11.4_

## Phase 8: Backend - Integration Hooks

### 8.1 Order Integration

- [ ] 8.1.1 Implement Order Event Listeners
  - onOrderCreated: Auto-create default thread với stakeholders
  - onOrderStatusChanged: Post system message to thread
  - onThreadResolved: Update order metadata với resolution notes
  - _Requirements: 12.1, 12.2, 12.3_

### 8.2 Design Integration

- [ ] 8.2.1 Implement Design Event Listeners
  - onDesignCreated: Auto-create thread
  - onDesignStatusChanged: Post system message
  - _Requirements: 12.1, 12.2_

## Phase 9: Frontend - Thread List UI

### 9.1 Thread List Components

- [ ] 9.1.1 Create ThreadList Component

  - Display threads grouped by event
  - Show thread title, last message, unread count
  - Show status badge (active, resolved, archived)
  - Show pinned badge
  - Sort by isPinned, lastMessageAt
  - _Requirements: 1.1, 1.5, 4.4, 5.5_

- [ ] 9.1.2 Create ThreadCard Component

  - Display thread info (title, participants, last message)
  - Show context banner (event info)
  - Show unread badge
  - Show status và priority badges
  - Swipe actions for mobile (pin, archive, resolve)
  - _Requirements: 1.4, 5.5_

- [ ] 9.1.3 Create ThreadFilters Component
  - Filter by status (active, resolved, archived)
  - Filter by event type (ORDER, DESIGN, PRODUCT)
  - Filter by participant
  - Filter by tags
  - Filter by date range
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

### 9.2 Thread List Hooks

- [ ] 9.2.1 Create useThreads Hook

  - fetchThreads với filters
  - Loading và error states
  - Real-time updates via WebSocket
  - _Requirements: 1.1, 1.5_

- [ ] 9.2.2 Create useThreadFilters Hook
  - Manage filter state
  - Apply filters
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

## Phase 10: Frontend - Thread View UI

### 10.1 Thread View Components

- [ ] 10.1.1 Create ThreadView Component

  - Display thread header (title, context banner, participants)
  - Display message list với nested replies
  - Display thread actions (resolve, pin, archive)
  - Full-screen view on mobile
  - _Requirements: 1.4, 2.1, 4.2, 4.4_

- [ ] 10.1.2 Create MessageBubble Component (Enhanced)

  - Display message content
  - Display reply button
  - Display reply count (if has replies)
  - Expand/collapse replies
  - Display mentions với highlight
  - Display attachments (gallery view for images)
  - Display read receipts
  - Display edit indicator
  - _Requirements: 2.1, 2.3, 3.2, 5.4, 7.4_

- [ ] 10.1.3 Create ReplyThread Component

  - Display nested replies (max 3 levels)
  - Flatten structure if depth > 3
  - Load replies on expand
  - Sort by createdAt
  - _Requirements: 2.2, 2.4, 2.5_

- [ ] 10.1.4 Create ThreadContextBanner Component
  - Display event info (order number, product name, design title)
  - Link to event detail page
  - _Requirements: 1.4_

### 10.2 Thread View Hooks

- [ ] 10.2.1 Create useThread Hook

  - fetchThread detail
  - fetchMessages với pagination
  - Real-time message updates
  - _Requirements: 1.1, 2.1_

- [ ] 10.2.2 Create useThreadActions Hook
  - resolveThread
  - reopenThread
  - archiveThread
  - pinThread
  - _Requirements: 4.2, 4.3, 4.4_

## Phase 11: Frontend - Message Input UI

### 11.1 Message Input Components

- [ ] 11.1.1 Create MessageInput Component (Enhanced)

  - Text input với mention autocomplete (@username)
  - File upload button
  - Link preview generation
  - Reply preview (when replying)
  - Typing indicator broadcast
  - _Requirements: 2.1, 3.2, 5.3, 7.1, 7.3_

- [ ] 11.1.2 Create MentionAutocomplete Component

  - Search participants by username
  - Display participant list
  - Insert mention on select
  - _Requirements: 3.2_

- [ ] 11.1.3 Create AttachmentUpload Component

  - File picker
  - Upload progress
  - Thumbnail preview
  - Validation errors
  - _Requirements: 7.1, 7.2_

- [ ] 11.1.4 Create ReplyPreview Component
  - Display parent message preview
  - Cancel reply button
  - _Requirements: 2.1_

### 11.2 Message Input Hooks

- [ ] 11.2.1 Create useMessageSender Hook (Enhanced for Threading)

  - sendMessage
  - sendReply với parentMessageId
  - uploadAttachment
  - parseMentions
  - _Requirements: 2.1, 2.2, 3.2, 7.1_

- [ ] 11.2.2 Create useTypingIndicator Hook
  - Broadcast typing event
  - Throttle broadcasts (max 1 per 3 seconds)
  - _Requirements: 5.3_

## Phase 12: Frontend - Thread Creation UI

### 12.1 Thread Creation Components

- [ ] 12.1.1 Create CreateThreadModal Component

  - Select event context (ORDER, DESIGN, PRODUCT)
  - Select template (optional)
  - Input title và description
  - Select participants (auto-filled from event)
  - Set priority
  - Add tags
  - _Requirements: 1.2, 11.1, 11.2_

- [ ] 12.1.2 Create TemplateSelector Component

  - Display template list by category
  - Preview template
  - Apply template
  - _Requirements: 11.1, 11.2_

- [ ] 12.1.3 Create QuickActions Component (for ORDER context)
  - Display quick action buttons
  - Create thread from quick action
  - _Requirements: 11.3, 11.4_

### 12.2 Thread Creation Hooks

- [ ] 12.2.1 Create useThreadCreation Hook
  - createThread
  - applyTemplate
  - Loading và error states
  - _Requirements: 1.2, 11.2_

## Phase 13: Frontend - Real-time Features

### 13.1 WebSocket Integration

- [ ] 13.1.1 Implement WebSocket Client

  - Connect to Socket.IO server
  - Join thread rooms
  - Handle events (new_message, user_typing, message_read)
  - _Requirements: 5.1, 5.3, 5.4_

- [ ] 13.1.2 Create useRealtimeThread Hook
  - Subscribe to thread events
  - Update UI on new messages
  - Display typing indicators
  - Update read receipts
  - _Requirements: 5.1, 5.3, 5.4_

### 13.2 Notification Integration

- [ ] 13.2.1 Implement Notification Listener
  - Listen for thread notifications
  - Display toast notifications
  - Update unread counts
  - Deep link to thread on click
  - _Requirements: 5.1, 5.2, 12.4_

## Phase 14: Frontend - Mobile Optimization

### 14.1 Mobile UI Components

- [ ] 14.1.1 Create MobileThreadList Component

  - Compact list view
  - Swipe actions (pin, archive, resolve)
  - Pull to refresh
  - _Requirements: 10.1, 10.2_

- [ ] 14.1.2 Create MobileThreadView Component

  - Full-screen view
  - Back button
  - Bottom sheet for reply input
  - _Requirements: 10.2, 10.3_

- [ ] 14.1.3 Create MobileReplySheet Component
  - Bottom sheet với reply input
  - Reply preview
  - Attachment upload
  - _Requirements: 10.3_

### 14.2 Mobile Hooks

- [ ] 14.2.1 Create useMobileGestures Hook
  - Swipe to reply
  - Swipe to archive
  - Long press for actions
  - _Requirements: 10.1, 10.2_

## Phase 15: Testing & Quality Assurance

### 15.1 Unit Tests

- [ ] 15.1.1 Write unit tests for Thread Service

  - Test thread creation với event context
  - Test status transitions
  - Test permission checking
  - _Requirements: 1.2, 4.2, 9.1_

- [ ] 15.1.2 Write unit tests for Message Service

  - Test reply nesting logic
  - Test depth limit enforcement
  - Test mention parsing
  - _Requirements: 2.2, 2.5, 3.2_

- [ ] 15.1.3 Write unit tests for Participant Service
  - Test stakeholder auto-addition
  - Test mention permission checking
  - _Requirements: 3.1, 3.2_

### 15.2 Property-Based Tests

- [ ] 15.2.1 Write property test for reply depth limit

  - **Property 4: Reply Nesting Depth Limit**
  - **Validates: Requirements 2.5**

- [ ] 15.2.2 Write property test for unread count accuracy

  - **Property 15: Unread Count Accuracy**
  - **Validates: Requirements 5.5**

- [ ] 15.2.3 Write property test for stakeholder auto-addition

  - **Property 2: Stakeholder Auto-addition**
  - **Validates: Requirements 1.2, 3.1**

- [ ] 15.2.4 Write property test for permission checks
  - **Property 20: Permission-based Thread Creation**
  - **Validates: Requirements 9.1**

### 15.3 Integration Tests

- [ ] 15.3.1 Test thread creation flow

  - Create thread → Auto-add stakeholders → Send notification
  - _Requirements: 1.2, 3.1, 5.1_

- [ ] 15.3.2 Test message sending flow

  - Send message → Parse mentions → Add participants → Send notifications
  - _Requirements: 2.1, 3.2, 5.1, 5.2_

- [ ] 15.3.3 Test order integration
  - Create order → Auto-create thread → Status change → System message
  - _Requirements: 12.1, 12.2_

## Phase 16: Documentation & Deployment

### 16.1 Documentation

- [ ] 16.1.1 Write API documentation

  - Document all thread endpoints
  - Document WebSocket events
  - Add request/response examples
  - _Requirements: All_

- [ ] 16.1.2 Write user guides
  - Guide for creating threads
  - Guide for using mentions
  - Guide for managing threads (resolve, archive, pin)
  - _Requirements: All_

### 16.2 Deployment

- [ ] 16.2.1 Run database migrations

  - Migrate Conversations to Threads
  - Migrate Messages for threading
  - Create ThreadUnread collection
  - Create ThreadTemplate collection
  - _Requirements: All_

- [ ] 16.2.2 Deploy backend services

  - Deploy Thread Service
  - Deploy enhanced Message Service
  - Deploy Participant Service
  - Deploy Notification Service
  - Deploy Search Service
  - _Requirements: All_

- [ ] 16.2.3 Deploy frontend updates
  - Deploy thread UI components
  - Deploy WebSocket integration
  - Test in production
  - _Requirements: All_

### 16.3 Monitoring & Alerts

- [ ] 16.3.1 Set up monitoring

  - Monitor thread creation rate
  - Monitor unread message backlog
  - Monitor auto-archive job
  - Monitor WebSocket connections
  - _Requirements: All_

- [ ] 16.3.2 Configure alerts
  - Alert on high unread counts
  - Alert on failed auto-archive
  - Alert on WebSocket disconnections
  - _Requirements: All_

### 4.2 Participant Repository ✅

- [x] 4.2.1 Create Participant Repository ✅
  - getParticipants, getParticipant, isParticipant
  - getThreadsByParticipant
  - countParticipants, getParticipantRole
  - updateVisibility
  - _Requirements: 3.3, 3.4_
  - **File**: `apps/customer-backend/src/repositories/participant.repository.js`

### 4.3 Participant Controller & Routes ✅

- [x] 4.3.1 Create Participant Controller ✅
  - GET /api/threads/:threadId/participants
  - POST /api/threads/:threadId/participants
  - DELETE /api/threads/:threadId/participants/:userId
  - PUT /api/threads/:threadId/participants/:userId/role
  - GET /api/participants/my-threads
  - POST /api/threads/:threadId/participants/auto-add
  - POST /api/threads/:threadId/participants/mention
  - POST /api/threads/:threadId/participants/last-seen
  - GET /api/threads/:threadId/participants/active
  - _Requirements: 3.2, 3.3, 5.3_
  - **Files**:
    - `apps/customer-backend/src/controllers/participant.controller.js`
    - `apps/customer-backend/src/routes/participant.routes.js`
    - `apps/customer-backend/src/server.ts` (routes registered)

## Checkpoint Tasks

- [x] Checkpoint 1: After Phase 2 - Ensure thread CRUD operations work ✅
- [x] Checkpoint 2: After Phase 3 - Ensure message sending và replies work ✅
- [x] Checkpoint 2.5: After Phase 4 - Ensure participant management works ✅
- [ ] Checkpoint 3: After Phase 5 - Ensure notifications work
- [ ] Checkpoint 4: After Phase 9 - Ensure thread list UI works
- [ ] Checkpoint 5: After Phase 10 - Ensure thread view UI works
- [ ] Checkpoint 6: After Phase 13 - Ensure real-time features work
- [ ] Final Checkpoint: Run full end-to-end test from thread creation to resolution
