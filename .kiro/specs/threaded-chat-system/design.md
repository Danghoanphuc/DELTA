# Design Document - Threaded Chat System (Event-Based Conversations)

## Overview

Thiết kế hệ thống chat đa luồng (threaded chat) cho phép các bên liên quan thảo luận trong ngữ cảnh của sự kiện cụ thể (đơn hàng, thiết kế, sản phẩm). Mô hình này tương tự Facebook comments với:

1. **Event-Centric**: Mỗi sự kiện (ORDER, DESIGN, PRODUCT) có nhiều threads
2. **Nested Replies**: Tin nhắn có thể reply lồng nhau (max 3 levels)
3. **Smart Participants**: Tự động thêm stakeholders liên quan
4. **Real-time**: WebSocket cho notifications và typing indicators
5. **Mobile-First**: UI tối ưu cho cả desktop và mobile

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │  Thread List │  Thread View │  Reply UI    │ Mentions │ │
│  │  Component   │  Component   │  Component   │ System   │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  WebSocket Layer                             │
│         (Real-time notifications, typing, presence)         │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  API Gateway Layer                           │
│         (Authentication, Rate Limiting, Routing)            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│  │   Thread     │   Message    │  Participant │  Notif   │ │
│  │   Service    │   Service    │   Service    │ Service  │ │
│  └──────────────┴──────────────┴──────────────┴──────────┘ │
└────────────────────┬────────────────────────────────────────┘
```

                     │

┌────────────────────▼────────────────────────────────────────┐
│ Data Access Layer │
│ ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│ │ Thread │ Message │ Participant │ Event │ │
│ │ Repository │ Repository │ Repository │ Repo │ │
│ └──────────────┴──────────────┴──────────────┴──────────┘ │
└────────────────────┬────────────────────────────────────────┘
│
┌────────────────────▼────────────────────────────────────────┐
│ Database Layer │
│ ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│ │ MongoDB │ Redis │ S3/CDN │ Socket │ │
│ │ (Primary) │ (Cache) │ (Files) │ (RT) │ │
│ └──────────────┴──────────────┴──────────────┴──────────┘ │
└─────────────────────────────────────────────────────────────┘

````

### Key Services

1. **Thread Service**: Quản lý threads (CRUD, status, permissions)
2. **Message Service**: Quản lý messages và replies (nested structure)
3. **Participant Service**: Quản lý participants và mentions
4. **Notification Service**: Gửi notifications (in-app, email, push)
5. **Search Service**: Full-text search threads và messages
6. **Analytics Service**: Track metrics và insights

## Data Models

### 1. Enhanced Thread Model (extends Conversation)

**Improvements từ current Conversation model:**

```typescript
interface IThread extends Document {
  // ===== EXISTING FIELDS (from Conversation) =====
  type: "customer-bot" | "peer-to-peer" | "customer-printer" | "group";
  title: string;
  avatarUrl?: string;
  description?: string;

  context: {
    referenceId: string; // ORDER_ID, DESIGN_ID, PRODUCT_ID
    referenceType: "ORDER" | "DESIGN" | "PRODUCT" | "NONE";
    metadata: {
      orderNumber?: string;
      productName?: string;
      designTitle?: string;
      // ... other context data
    };
  };

  participants: {
    userId: ObjectId;
    role: "customer" | "printer" | "admin" | "member" | "moderator";
    isVisible: boolean;
    joinedAt: Date;
  }[];

  lastMessageAt: Date;
  isActive: boolean;
  creatorId: ObjectId;
````

// ===== NEW FIELDS FOR THREADING =====

// Thread Status
status: "active" | "resolved" | "archived";
resolvedAt?: Date;
resolvedBy?: ObjectId;
resolutionNotes?: string;

// Thread Priority & Pinning
isPinned: boolean;
pinnedAt?: Date;
pinnedBy?: ObjectId;
priority: "low" | "normal" | "high" | "urgent";

// Thread Statistics
stats: {
messageCount: number;
replyCount: number;
participantCount: number;
unreadCount: number; // Per user (stored in separate collection)
lastActivityAt: Date;
};

// Thread Permissions
permissions: {
canReply: "all" | "participants" | "moderators" | "admins";
canInvite: "all" | "participants" | "moderators" | "admins";
canPin: "moderators" | "admins";
canResolve: "creator" | "moderators" | "admins";
canArchive: "creator" | "moderators" | "admins";
};

// Thread Tags (for filtering)
tags: string[]; // ["bug", "feature-request", "question", "urgent"]

// Template Info (if created from template)
templateId?: ObjectId;
templateName?: string;

// Auto-archive settings
autoArchiveAfterDays?: number;

createdAt: Date;
updatedAt: Date;
}

````

### 2. Enhanced Message Model (with Threading)

**Improvements từ current Message model:**

```typescript
interface IMessage extends Document {
  // ===== EXISTING FIELDS =====
  conversationId: ObjectId; // Now refers to Thread
  sender: ObjectId;
  senderType: "User" | "Admin" | "System" | "AI" | "Guest";
  clientSideId?: string; // For optimistic updates
  type: "text" | "image" | "file" | "system" | "ai_response" | ...;
  content: any; // Mixed type
  metadata?: any;
  readBy: ObjectId[];
  deletedFor: ObjectId[];
  replyTo?: ObjectId; // Parent message

  // ===== NEW FIELDS FOR THREADING =====

  // Thread Hierarchy
  threadDepth: number; // 0 = root, 1 = first reply, 2 = nested reply, max 3
  threadPath: string; // "root_id/reply1_id/reply2_id" for efficient querying
  rootMessageId?: ObjectId; // Always points to root message

  // Reply Statistics
  replyCount: number; // Direct replies to this message
  totalReplyCount: number; // All nested replies

  // Mentions
  mentions: {
    userId: ObjectId;
    username: string;
    displayName: string;
  }[];

  // Reactions (optional - for future)
  reactions: {
    emoji: string;
    users: ObjectId[];
    count: number;
  }[];

  // Edit History
  isEdited: boolean;
  editedAt?: Date;
  editHistory: {
    content: any;
    editedAt: Date;
    editedBy: ObjectId;
  }[];

  // Attachments
  attachments: {
    type: "image" | "file" | "link";
    url: string;
    thumbnailUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    metadata?: any;
  }[];

  createdAt: Date;
  updatedAt: Date;
}
````

### 3. NEW: Thread Unread Tracking Model

```typescript
interface IThreadUnread extends Document {
  userId: ObjectId;
  threadId: ObjectId;
  unreadCount: number;
  lastReadMessageId?: ObjectId;
  lastReadAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Indexes
ThreadUnread.index({ userId: 1, threadId: 1 }, { unique: true });
ThreadUnread.index({ userId: 1, unreadCount: 1 });
```

### 4. NEW: Thread Template Model

```typescript
interface IThreadTemplate extends Document {
  name: string;
  description: string;
  category: "bug" | "feature-request" | "question" | "general";

  // Template content
  titleTemplate: string; // "Báo lỗi: {{issue_type}}"
  contentTemplate: string; // Markdown with placeholders

  // Auto-fill fields
  defaultTags: string[];
  defaultPriority: "low" | "normal" | "high" | "urgent";

  // Context restrictions
  applicableContexts: ("ORDER" | "DESIGN" | "PRODUCT")[];

  // Quick actions (for ORDER context)
  quickActions?: {
    label: string;
    action: string; // "cancel_order", "change_address", "report_issue"
    icon: string;
  }[];

  // Organization-specific or global
  organizationId?: ObjectId; // null = global template
  isActive: boolean;

  createdBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

## Components and Interfaces

### 1. Thread Service

**Responsibilities:**

- CRUD operations cho threads
- Status management (active, resolved, archived)
- Permission checking
- Auto-archive inactive threads

**Key Methods:**

```typescript
class ThreadService {
  // Thread Management
  async createThread(data: CreateThreadData): Promise<Thread>;
  async getThread(threadId: string, userId: string): Promise<Thread>;
  async getThreadsByEvent(
    eventId: string,
    eventType: string
  ): Promise<Thread[]>;
  async updateThread(threadId: string, data: UpdateThreadData): Promise<Thread>;
  async deleteThread(threadId: string, userId: string): Promise<void>;

  // Status Management
  async resolveThread(
    threadId: string,
    userId: string,
    notes?: string
  ): Promise<Thread>;
  async reopenThread(threadId: string, userId: string): Promise<Thread>;
  async archiveThread(threadId: string, userId: string): Promise<Thread>;
  async pinThread(threadId: string, userId: string): Promise<Thread>;
  async unpinThread(threadId: string, userId: string): Promise<Thread>;

  // Participant Management
  async addParticipant(
    threadId: string,
    userId: string,
    role: string
  ): Promise<Thread>;
  async removeParticipant(threadId: string, userId: string): Promise<Thread>;
  async leaveThread(threadId: string, userId: string): Promise<void>;

  // Auto-archive
  async autoArchiveInactiveThreads(): Promise<number>;

  // Permissions
  async checkThreadPermission(
    threadId: string,
    userId: string,
    action: string
  ): Promise<boolean>;
}
```

### 2. Message Service (Enhanced for Threading)

**Responsibilities:**

- Send messages với nested reply support
- Parse mentions và auto-add participants
- Handle attachments (upload to S3)
- Generate link previews
- Track read receipts

**Key Methods:**

```typescript
class MessageService {
  // Message Operations
  async sendMessage(data: SendMessageData): Promise<Message>;
  async sendReply(
    parentMessageId: string,
    data: SendMessageData
  ): Promise<Message>;
  async editMessage(messageId: string, content: any): Promise<Message>;
  async deleteMessage(messageId: string, userId: string): Promise<void>;

  // Threading
  async getReplies(messageId: string, depth?: number): Promise<Message[]>;
  async getThreadPath(messageId: string): Promise<Message[]>;
  async flattenDeepReplies(messageId: string): Promise<Message[]>;

  // Mentions
  async parseMentions(content: string): Promise<Mention[]>;
  async notifyMentionedUsers(
    messageId: string,
    mentions: Mention[]
  ): Promise<void>;

  // Attachments
  async uploadAttachment(file: File, threadId: string): Promise<Attachment>;
  async generateLinkPreview(url: string): Promise<LinkPreview>;

  // Read Tracking
  async markAsRead(messageId: string, userId: string): Promise<void>;
  async getUnreadCount(threadId: string, userId: string): Promise<number>;
}
```

### 3. Participant Service

**Responsibilities:**

- Manage thread participants
- Auto-add stakeholders based on event context
- Handle mentions và invitations
- Track participant activity

**Key Methods:**

```typescript
class ParticipantService {
  // Participant Management
  async addParticipants(
    threadId: string,
    userIds: string[],
    role?: string
  ): Promise<void>;
  async removeParticipant(threadId: string, userId: string): Promise<void>;
  async updateParticipantRole(
    threadId: string,
    userId: string,
    role: string
  ): Promise<void>;

  // Auto-add Stakeholders
  async getEventStakeholders(
    eventId: string,
    eventType: string
  ): Promise<User[]>;
  async autoAddStakeholders(
    threadId: string,
    eventId: string,
    eventType: string
  ): Promise<void>;

  // Mentions
  async handleMention(threadId: string, mentionedUserId: string): Promise<void>;
  async checkMentionPermission(
    threadId: string,
    mentionedUserId: string
  ): Promise<boolean>;

  // Activity Tracking
  async updateLastSeen(threadId: string, userId: string): Promise<void>;
  async getActiveParticipants(threadId: string): Promise<User[]>;
}
```

### 4. Notification Service (Enhanced for Threads)

**Responsibilities:**

- Send notifications cho thread events
- Handle mention notifications (high priority)
- Batch notifications để tránh spam
- Support multiple channels (in-app, email, push, Zalo OA)

**Key Methods:**

```typescript
class NotificationService {
  // Thread Notifications
  async notifyNewMessage(
    threadId: string,
    messageId: string,
    excludeUserId: string
  ): Promise<void>;
  async notifyMention(
    threadId: string,
    messageId: string,
    mentionedUserId: string
  ): Promise<void>;
  async notifyThreadResolved(
    threadId: string,
    resolvedBy: string
  ): Promise<void>;
  async notifyThreadArchived(threadId: string): Promise<void>;

  // Batch Notifications
  async batchNotifications(notifications: Notification[]): Promise<void>;

  // Multi-channel
  async sendInAppNotification(
    userId: string,
    notification: Notification
  ): Promise<void>;
  async sendEmailNotification(
    userId: string,
    notification: Notification
  ): Promise<void>;
  async sendPushNotification(
    userId: string,
    notification: Notification
  ): Promise<void>;
  async sendZaloNotification(
    userId: string,
    notification: Notification
  ): Promise<void>;
}
```

### 5. Search Service

**Responsibilities:**

- Full-text search threads và messages
- Filter threads by event, participant, status, tags
- Aggregate search results

**Key Methods:**

```typescript
class SearchService {
  // Search
  async searchThreads(query: string, filters: SearchFilters): Promise<Thread[]>;
  async searchMessages(query: string, threadId?: string): Promise<Message[]>;

  // Filters
  async filterThreadsByEvent(
    eventId: string,
    eventType: string
  ): Promise<Thread[]>;
  async filterThreadsByParticipant(userId: string): Promise<Thread[]>;
  async filterThreadsByStatus(status: string): Promise<Thread[]>;
  async filterThreadsByTags(tags: string[]): Promise<Thread[]>;
  async filterThreadsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Thread[]>;
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Thread Event Association

_For any_ thread, the referenceId and referenceType must correctly point to an existing event (ORDER, DESIGN, or PRODUCT)
**Validates: Requirements 1.3**

### Property 2: Stakeholder Auto-addition

_For any_ thread created from an event context, all stakeholders associated with that event must be automatically added as participants
**Validates: Requirements 1.2, 3.1**

### Property 3: Thread Sorting Consistency

_For any_ list of threads for an event, threads must be sorted by lastMessageAt in descending order, with pinned threads appearing first
**Validates: Requirements 1.5, 4.4**

### Property 4: Reply Nesting Depth Limit

_For any_ message reply, the threadDepth must not exceed 3 levels, and replies beyond depth 3 must be flattened to depth 3
**Validates: Requirements 2.5**

### Property 5: Reply Count Accuracy

_For any_ message, the replyCount must equal the number of direct replies, and totalReplyCount must equal all nested replies
**Validates: Requirements 2.3**

### Property 6: Mention Participant Addition

_For any_ message containing mentions, mentioned users with event access must be automatically added to thread participants
**Validates: Requirements 3.2**

### Property 7: Participant Permission Validation

_For any_ participant addition, the system must verify the user has access to the event before allowing them to join the thread
**Validates: Requirements 3.3, 9.2**

### Property 8: Thread Visibility After Leave

_For any_ participant who leaves a thread, the thread must be hidden from their list but message history must remain intact
**Validates: Requirements 3.4**

### Property 9: Removed Participant Access Denial

_For any_ participant removed from a thread, they must not be able to view or send messages in that thread
**Validates: Requirements 3.5**

### Property 10: Thread Status Transitions

_For any_ thread, valid status transitions are: active → resolved → archived, and resolved → active (reopen)
**Validates: Requirements 4.2, 4.3**

### Property 11: Auto-archive Inactive Threads

_For any_ thread with no activity for more than 7 days (configurable), the system must automatically archive it and notify participants
**Validates: Requirements 4.5**

### Property 12: Notification Exclusion

_For any_ new message in a thread, notifications must be sent to all participants except the sender
**Validates: Requirements 5.1**

### Property 13: Mention Notification Priority

_For any_ message containing mentions, mentioned users must receive high-priority notifications with highlight
**Validates: Requirements 5.2**

### Property 14: Read Receipt Tracking

_For any_ message read by a user, the readBy array must be updated and read receipts must be displayed
**Validates: Requirements 5.4**

### Property 15: Unread Count Accuracy

_For any_ thread, the unread count for a user must equal the number of messages sent after their lastReadMessageId
**Validates: Requirements 5.5**

### Property 16: Search Result Relevance

_For any_ search query, results must include threads and messages where the query matches title, content, or metadata
**Validates: Requirements 6.1**

### Property 17: Filter Correctness

_For any_ filter applied (event type, participant, status, date range), only threads matching the filter criteria must be returned
**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

### Property 18: File Upload Validation

_For any_ file upload, the system must validate file type (image, pdf, doc) and size (< 10MB) before accepting
**Validates: Requirements 7.1**

### Property 19: Attachment Storage Consistency

_For any_ uploaded file, it must be stored in S3 and a thumbnail must be generated for images
**Validates: Requirements 7.2**

### Property 20: Permission-based Thread Creation

_For any_ thread creation attempt, the system must verify the user has create_thread permission based on role and event ownership
**Validates: Requirements 9.1**

### Property 21: Private Thread Access Control

_For any_ thread with "private" setting, only participants and admins must be able to view it
**Validates: Requirements 9.3**

### Property 22: Read-only Thread Restrictions

_For any_ thread with "read-only" setting, only moderators and admins must be able to send messages
**Validates: Requirements 9.4**

### Property 23: Template Pre-fill Accuracy

_For any_ thread created from a template, the title and content must be pre-filled with the template structure
**Validates: Requirements 11.2**

### Property 24: Context-aware Quick Actions

_For any_ thread with ORDER context, quick actions specific to orders must be displayed
**Validates: Requirements 11.3**

### Property 25: Auto-thread Creation on Order

_For any_ new order created, a default thread must be automatically created with appropriate stakeholders
**Validates: Requirements 12.1**

### Property 26: Order Status Sync

_For any_ order status change, a system message must be posted to the associated thread
**Validates: Requirements 12.2**

### Property 27: Thread Resolution Metadata Sync

_For any_ thread marked as resolved, the associated order metadata must be updated with resolution notes
**Validates: Requirements 12.3**

### Property 28: Deep Link Navigation

_For any_ notification clicked, the user must be navigated to the specific thread in the app
**Validates: Requirements 12.4**

## Error Handling

### Validation Errors

```typescript
// Thread creation without event context
if (!data.context.referenceId || !data.context.referenceType) {
  throw new ValidationException(
    "Thread must be associated with an event (ORDER, DESIGN, or PRODUCT)"
  );
}

// Reply depth exceeds limit
if (parentMessage.threadDepth >= 3) {
  throw new ValidationException("Reply depth cannot exceed 3 levels");
}

// File upload validation
if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
  throw new ValidationException(`File type ${file.mimetype} is not allowed`);
}

if (file.size > MAX_FILE_SIZE) {
  throw new ValidationException(
    `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
  );
}
```

### Permission Errors

```typescript
// Thread access denied
if (!(await this.checkThreadPermission(threadId, userId, "view"))) {
  throw new ForbiddenException("You don't have permission to view this thread");
}

// Participant addition denied
if (!(await this.checkEventAccess(userId, eventId, eventType))) {
  throw new ForbiddenException("User doesn't have access to this event");
}

// Read-only thread
if (thread.permissions.canReply === "moderators" && !isModerator(userId)) {
  throw new ForbiddenException("Only moderators can reply in this thread");
}
```

### Business Logic Errors

```typescript
// Thread already resolved
if (thread.status === "resolved" && action === "resolve") {
  throw new ConflictException("Thread is already resolved");
}

// Cannot archive active thread
if (thread.status === "active" && action === "archive") {
  throw new ConflictException(
    "Cannot archive active thread. Resolve it first."
  );
}

// Participant already exists
if (thread.participants.some((p) => p.userId.toString() === userId)) {
  throw new ConflictException("User is already a participant in this thread");
}
```

## Testing Strategy

### Unit Tests

- Thread creation với different event contexts
- Reply nesting logic với depth limits
- Mention parsing và participant auto-addition
- Permission checking logic
- Status transition validation
- Unread count calculation

### Integration Tests

- Thread creation flow với stakeholder auto-addition
- Message sending với mentions và notifications
- File upload với S3 storage và thumbnail generation
- Search và filter functionality
- Real-time notifications via WebSocket
- Deep linking from notifications

### Property-Based Tests

**Property Testing Framework:** fast-check (JavaScript/TypeScript)

**Key Properties to Test:**

1. **Thread-Event Association**: Generate random events và threads, verify referenceId always points to valid event
2. **Reply Depth Limit**: Generate deeply nested replies, verify depth never exceeds 3
3. **Participant Auto-addition**: Generate events với stakeholders, verify all stakeholders added to thread
4. **Unread Count**: Generate messages và read events, verify unread count always accurate
5. **Permission Checks**: Generate users với different roles, verify permission logic correct
6. **Status Transitions**: Generate status change sequences, verify only valid transitions allowed
7. **Notification Exclusion**: Generate messages, verify sender never receives notification
8. **Search Relevance**: Generate threads với random content, verify search returns relevant results

**Example Property Test:**

```typescript
import fc from "fast-check";

describe("Thread Properties", () => {
  it("Property: Reply depth never exceeds 3 levels", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            parentId: fc.option(fc.uuid()),
            content: fc.string(),
          })
        ),
        (messages) => {
          const thread = buildThreadFromMessages(messages);
          const maxDepth = calculateMaxDepth(thread);
          return maxDepth <= 3;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property: Unread count equals messages after lastRead", () => {
    fc.assert(
      fc.property(
        fc.record({
          messages: fc.array(
            fc.record({
              id: fc.uuid(),
              timestamp: fc.date(),
            })
          ),
          lastReadMessageId: fc.option(fc.uuid()),
        }),
        ({ messages, lastReadMessageId }) => {
          const unreadCount = calculateUnreadCount(messages, lastReadMessageId);
          const expectedCount = messages.filter(
            (m) =>
              !lastReadMessageId ||
              m.timestamp > getMessageTimestamp(lastReadMessageId)
          ).length;
          return unreadCount === expectedCount;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

## Performance Considerations

### Database Indexes

```typescript
// Thread indexes
Thread.index({ "context.referenceId": 1, "context.referenceType": 1 });
Thread.index({ "participants.userId": 1, status: 1 });
Thread.index({ lastMessageAt: -1, isPinned: -1 });
Thread.index({ status: 1, "stats.lastActivityAt": 1 }); // For auto-archive

// Message indexes
Message.index({ conversationId: 1, createdAt: -1 });
Message.index({ replyTo: 1 }); // For loading replies
Message.index({ rootMessageId: 1 }); // For thread path
Message.index({ "mentions.userId": 1 }); // For mention queries
Message.index({ content: "text" }); // Full-text search

// Unread tracking indexes
ThreadUnread.index({ userId: 1, threadId: 1 }, { unique: true });
ThreadUnread.index({ userId: 1, unreadCount: 1 });
```

### Caching Strategy

```typescript
// Cache thread list per event (TTL: 5 minutes)
const cacheKey = `threads:event:${eventId}:${eventType}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache unread counts per user (TTL: 1 minute)
const unreadKey = `unread:user:${userId}`;

// Cache participant list per thread (TTL: 10 minutes)
const participantsKey = `participants:thread:${threadId}`;

// Invalidate cache on updates
await redis.del(`threads:event:${eventId}:${eventType}`);
await redis.del(`unread:user:${userId}`);
```

### Query Optimization

```typescript
// Use aggregation for complex queries
const threadsWithUnread = await Thread.aggregate([
  { $match: { "participants.userId": userId, status: "active" } },
  {
    $lookup: {
      from: "threadunreads",
      let: { threadId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$threadId", "$$threadId"] },
                { $eq: ["$userId", userId] },
              ],
            },
          },
        },
        { $project: { unreadCount: 1 } },
      ],
      as: "unread",
    },
  },
  { $sort: { isPinned: -1, lastMessageAt: -1 } },
  { $limit: 50 },
]);

// Use lean() for read-only queries
const threads = await Thread.find({ "context.referenceId": orderId })
  .select("title status lastMessageAt participants")
  .lean();

// Paginate replies
const replies = await Message.find({ replyTo: messageId })
  .sort({ createdAt: 1 })
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```

### Real-time Optimization

```typescript
// Use Socket.IO rooms for efficient broadcasting
socket.join(`thread:${threadId}`);

// Broadcast to thread participants only
io.to(`thread:${threadId}`).emit("new_message", message);

// Throttle typing indicators (max 1 per 3 seconds)
const typingThrottle = new Map();
socket.on("typing", (threadId) => {
  const lastTyping = typingThrottle.get(socket.id);
  if (!lastTyping || Date.now() - lastTyping > 3000) {
    io.to(`thread:${threadId}`).emit("user_typing", { userId, threadId });
    typingThrottle.set(socket.id, Date.now());
  }
});
```

## Security Considerations

### Access Control

```typescript
// Check thread access
async function checkThreadAccess(
  threadId: string,
  userId: string
): Promise<boolean> {
  const thread = await Thread.findById(threadId);
  if (!thread) return false;

  // Check if user is participant
  if (thread.participants.some((p) => p.userId.toString() === userId)) {
    return true;
  }

  // Check if user has admin/moderator role
  const user = await User.findById(userId);
  if (user.role === "admin" || user.role === "moderator") {
    return true;
  }

  // Check if user has access to event
  return await checkEventAccess(
    userId,
    thread.context.referenceId,
    thread.context.referenceType
  );
}

// Check event access
async function checkEventAccess(
  userId: string,
  eventId: string,
  eventType: string
): Promise<boolean> {
  switch (eventType) {
    case "ORDER":
      const order = await Order.findById(eventId);
      return (
        order &&
        (order.customerId.toString() === userId ||
          order.printerId.toString() === userId ||
          order.assignedAdmin?.toString() === userId)
      );
    case "DESIGN":
      const design = await Design.findById(eventId);
      return design && design.createdBy.toString() === userId;
    case "PRODUCT":
      return true; // Products are public
    default:
      return false;
  }
}
```

### Data Validation

```typescript
// Sanitize user input
function sanitizeThreadInput(data: CreateThreadData): CreateThreadData {
  return {
    ...data,
    title: sanitizeHtml(data.title),
    description: sanitizeHtml(data.description),
    context: {
      referenceId: data.context.referenceId,
      referenceType: data.context.referenceType,
      metadata: sanitizeObject(data.context.metadata),
    },
  };
}

// Validate file uploads
function validateFileUpload(file: File): void {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/pdf",
    "application/msword",
  ];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ValidationException("Invalid file type");
  }

  if (file.size > 10 * 1024 * 1024) {
    // 10MB
    throw new ValidationException("File size exceeds 10MB limit");
  }
}
```

## Deployment Considerations

### Database Migrations

```typescript
// Migration: Add threading fields to existing messages
db.messages.updateMany(
  { threadDepth: { $exists: false } },
  {
    $set: {
      threadDepth: 0,
      threadPath: "$_id",
      rootMessageId: null,
      replyCount: 0,
      totalReplyCount: 0,
      mentions: [],
      reactions: [],
      isEdited: false,
      editHistory: [],
      attachments: [],
    },
  }
);

// Migration: Add thread fields to existing conversations
db.conversations.updateMany(
  { status: { $exists: false } },
  {
    $set: {
      status: "active",
      isPinned: false,
      priority: "normal",
      stats: {
        messageCount: 0,
        replyCount: 0,
        participantCount: 0,
        unreadCount: 0,
        lastActivityAt: new Date(),
      },
      permissions: {
        canReply: "all",
        canInvite: "participants",
        canPin: "moderators",
        canResolve: "moderators",
        canArchive: "moderators",
      },
      tags: [],
    },
  }
);

// Migration: Create ThreadUnread collection
db.createCollection("threadunreads");
db.threadunreads.createIndex({ userId: 1, threadId: 1 }, { unique: true });
```

### Monitoring

```typescript
// Monitor thread creation rate
setInterval(async () => {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const threadCount = await Thread.countDocuments({
    createdAt: { $gte: last24h },
  });
  metrics.gauge("threads.created.24h", threadCount);
}, 3600000); // Every hour

// Monitor unread message backlog
setInterval(async () => {
  const unreadStats = await ThreadUnread.aggregate([
    { $group: { _id: null, totalUnread: { $sum: "$unreadCount" } } },
  ]);
  metrics.gauge("messages.unread.total", unreadStats[0]?.totalUnread || 0);
}, 300000); // Every 5 minutes

// Monitor auto-archive job
cron.schedule("0 2 * * *", async () => {
  // 2 AM daily
  const archivedCount = await threadService.autoArchiveInactiveThreads();
  Logger.info(
    `[ThreadService] Auto-archived ${archivedCount} inactive threads`
  );
  metrics.counter("threads.auto_archived", archivedCount);
});
```

## Summary

Thiết kế này cung cấp:

1. **Event-Centric Threading**: Threads gắn liền với sự kiện (ORDER, DESIGN, PRODUCT)
2. **Nested Replies**: Reply lồng nhau với depth limit để tránh quá phức tạp
3. **Smart Participants**: Tự động thêm stakeholders và handle mentions
4. **Real-time Experience**: WebSocket cho notifications, typing indicators, presence
5. **Rich Features**: Attachments, link previews, reactions, templates
6. **Robust Permissions**: Fine-grained access control based on roles và event ownership
7. **Scalable Architecture**: Caching, indexing, query optimization
8. **Mobile-First UI**: Responsive design với swipe actions và bottom sheets

Các improvements chính so với chat hiện tại:

- ✅ Thêm Thread model với status, permissions, stats
- ✅ Enhanced Message model với threading fields (threadDepth, threadPath, rootMessageId)
- ✅ ThreadUnread model cho efficient unread tracking
- ✅ ThreadTemplate model cho quick thread creation
- ✅ Nested reply UI với expand/collapse
- ✅ Mention system với auto-add participants
- ✅ Rich attachments và link previews
- ✅ Thread status management (active, resolved, archived)
- ✅ Auto-archive inactive threads
- ✅ Deep linking from notifications
- ✅ Integration hooks với existing systems (orders, designs)
