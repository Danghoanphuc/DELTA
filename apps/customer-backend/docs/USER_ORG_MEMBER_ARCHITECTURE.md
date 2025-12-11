# User - Organization - Member Architecture

## 📋 Tổng quan

Kiến trúc mới tách biệt rõ ràng giữa **Identity (User)** và **Workspace (Organization)**, với **Membership** làm cầu nối.

### Nguyên tắc vàng

1. **User (Identity)**: Là duy nhất, đại diện cho cá nhân

   - Login bằng Google (Gmail cá nhân), LinkedIn, hoặc Email/Pass
   - Đây là "chìa khóa" để vào hệ thống

2. **Organization (Workspace)**: Là thực thể doanh nghiệp

   - Đây là "ngôi nhà" - workspace của công ty
   - Có thể có nhiều members

3. **OrganizationMember (Relationship)**: Liên kết User ↔ Organization
   - Một User có thể thuộc về N Organizations
   - Mỗi membership có role riêng (Owner, Admin, Member, Viewer)

---

## 🏗️ Database Schema

### 1. User Model (Identity)

```javascript
{
  _id: ObjectId,
  email: String,              // Login email (Gmail cá nhân)
  displayName: String,
  avatarUrl: String,

  // Authentication
  hashedPassword: String,
  authMethod: "local" | "google",
  googleId: String,

  // Status
  isVerified: Boolean,
  isActive: Boolean,
  isAdmin: Boolean,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Lưu ý**:

- User KHÔNG có `organizationProfileId` nữa
- User có thể thuộc nhiều organizations thông qua OrganizationMember

### 2. Organization Model (Workspace)

```javascript
{
  _id: ObjectId,
  businessName: String,
  slug: String,               // URL-friendly slug
  description: String,
  industry: String,

  // Contact Info (Work Email - KHÔNG phải login email)
  contactEmail: String,       // ceo@printz.vn (billing email)
  contactPhone: String,
  website: String,

  // Tax & Legal
  taxCode: String,
  legalName: String,
  legalRepresentative: {
    name: String,
    position: String,
    idNumber: String
  },

  // Branding
  logoUrl: String,
  coverImage: String,
  vectorUrl: String,
  brandGuidelineUrl: String,
  brandColors: {
    primary: String,
    secondary: String
  },

  // Addresses
  billingAddress: {
    street: String,
    ward: String,
    district: String,
    city: String,
    country: String,
    postalCode: String,
    location: {
      type: "Point",
      coordinates: [Number, Number]
    }
  },
  shippingAddress: { /* same structure */ },

  // Verification
  verificationStatus: "unverified" | "pending_review" | "approved" | "rejected",
  verificationDocs: {
    gpkdUrl: String,
    cccdUrl: String,
    otherDocs: [String]
  },
  isVerified: Boolean,
  verifiedAt: Date,
  verifiedBy: ObjectId,

  // Status
  isActive: Boolean,

  // Tier & Subscription
  tier: "starter" | "business" | "enterprise",
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,

  // Financial
  credits: Number,
  creditLimit: Number,
  paymentTerms: "prepaid" | "net15" | "net30" | "net60",
  stripeCustomerId: String,

  // Inventory
  inventoryId: ObjectId,

  // Usage Intent
  usageIntent: "employee_onboarding" | "partner_gifts" | "merchandise" | "events" | "marketing" | "other",

  // Onboarding
  onboardingCompleted: Boolean,
  onboardingStep: Number,

  // Stats
  stats: {
    totalOrders: Number,
    totalSpent: Number,
    totalMembers: Number,
    totalRecipients: Number
  },

  // Settings
  settings: {
    requireApproval: Boolean,
    autoApproveAmount: Number,
    allowMemberInvite: Boolean,
    notificationEmail: String
  },

  // Metadata
  metadata: Map,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### 3. OrganizationMember Model (Relationship)

```javascript
{
  _id: ObjectId,

  // Core Relationship
  userId: ObjectId,           // ref: User
  organizationId: ObjectId,   // ref: Organization

  // Role & Permissions
  role: "owner" | "admin" | "member" | "viewer",

  // Status
  status: "active" | "inactive" | "invited",

  // Invitation Info (if status = invited)
  invitedBy: ObjectId,
  invitedAt: Date,
  inviteToken: String,
  inviteExpiresAt: Date,

  // Acceptance Info
  joinedAt: Date,

  // Custom Permissions (fine-grained control)
  permissions: {
    canManageTeam: Boolean,
    canManageOrders: Boolean,
    canManageInventory: Boolean,
    canManageBilling: Boolean,
    canViewAnalytics: Boolean
  },

  // Metadata
  lastAccessedAt: Date,

  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ userId: 1, organizationId: 1 }` - unique composite
- `{ organizationId: 1, role: 1 }`
- `{ inviteToken: 1 }` - sparse

---

## 🔄 Luồng hoạt động

### 1. User Registration & Organization Creation

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Authentication (Identity)                           │
├─────────────────────────────────────────────────────────────┤
│ User login bằng Google (nguyenvanphuc@gmail.com)           │
│ → Tạo User: { email: "nguyenvanphuc@gmail.com" }          │
│ → Lúc này họ là "Free User" hoặc "Guest"                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Wizard - Create Organization (Workspace)            │
├─────────────────────────────────────────────────────────────┤
│ Form hỏi:                                                    │
│ - Tên công ty: "Printz Global"                             │
│ - Work Email: "ceo@printz.vn" (billing email)              │
│ - Quy mô, Industry, Logo, etc.                             │
│                                                              │
│ → Tạo Organization: {                                       │
│     businessName: "Printz Global",                          │
│     contactEmail: "ceo@printz.vn"  ← Work email            │
│   }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Create Membership (Link User ↔ Organization)        │
├─────────────────────────────────────────────────────────────┤
│ → Tạo OrganizationMember: {                                │
│     userId: user._id,                                       │
│     organizationId: org._id,                                │
│     role: "owner"                                           │
│   }                                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Dashboard                                            │
├─────────────────────────────────────────────────────────────┤
│ User vào Dashboard với context của Organization             │
│ - Mọi thông báo đơn hàng → ceo@printz.vn                   │
│ - User vẫn login bằng nguyenvanphuc@gmail.com              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Invite Team Members

```
Owner/Admin → Invite member (email: member@printz.vn)
                            ↓
            Tạo OrganizationMember: {
              organizationId: org._id,
              role: "member",
              status: "invited",
              inviteToken: "abc123...",
              inviteExpiresAt: Date + 7 days
            }
                            ↓
            Send email với invite link
                            ↓
Member click link → Accept invitation
                            ↓
            Update OrganizationMember: {
              userId: member._id,
              status: "active",
              joinedAt: now
            }
```

### 3. Multi-Organization Support

```
User có thể thuộc nhiều Organizations:

OrganizationMember:
- { userId: user1, organizationId: org1, role: "owner" }
- { userId: user1, organizationId: org2, role: "member" }
- { userId: user1, organizationId: org3, role: "admin" }

→ User có thể switch context giữa các organizations
```

---

## 🔐 Authorization Flow

### Middleware Chain

```javascript
// Check if user is authenticated
protect → req.user = User

// Check if user is member of organization
requireOrgMembership → req.member = OrganizationMember
                    → req.organizationId = Organization._id

// Check if user has specific role
requireOrgRole([OWNER, ADMIN]) → Check req.member.role

// Check custom permission
requirePermission('canManageTeam') → Check req.member.permissions
```

### Example: Update Order

```javascript
router.put(
  "/organizations/:organizationId/orders/:orderId",
  protect, // Must be logged in
  requireOrgMembership, // Must be member
  requirePermission("canManageOrders"), // Must have permission
  controller.updateOrder
);
```

---

## 📊 API Endpoints

### Member Management

```
GET    /api/organizations/my-organizations
       → Get all organizations user belongs to

GET    /api/organizations/:orgId/members
       → Get all members of organization

POST   /api/organizations/:orgId/members/invite
       → Invite new member (Admin/Owner only)

POST   /api/organizations/invitations/:token/accept
       → Accept invitation

PUT    /api/organizations/:orgId/members/:userId/role
       → Update member role (Admin/Owner only)

DELETE /api/organizations/:orgId/members/:userId
       → Remove member (Admin/Owner only)

POST   /api/organizations/:orgId/leave
       → Leave organization

POST   /api/organizations/:orgId/transfer-ownership
       → Transfer ownership (Owner only)

GET    /api/organizations/:orgId/members/stats
       → Get member statistics
```

---

## 🔄 Migration Strategy

### Phase 1: Preparation

1. ✅ Create new models (Organization, OrganizationMember)
2. ✅ Create repositories, services, controllers
3. ✅ Create middleware for membership checks
4. ✅ Create migration script

### Phase 2: Migration

1. Run migration script: `node scripts/migrate-to-member-model.js`
2. Verify data integrity
3. Test API endpoints

### Phase 3: Cleanup

1. Update all routes to use new middleware
2. Remove old `organizationProfileId` references
3. Archive old OrganizationProfile model

---

## 🎯 Benefits

### 1. Clear Separation of Concerns

- User = Identity (login credentials)
- Organization = Workspace (business entity)
- Member = Relationship (role & permissions)

### 2. Multi-Organization Support

- User có thể thuộc nhiều organizations
- Mỗi membership có role riêng

### 3. Flexible Permissions

- Role-based: Owner, Admin, Member, Viewer
- Custom permissions: Fine-grained control

### 4. Scalability

- Dễ dàng thêm features: Team management, Invitations, etc.
- Support enterprise use cases

### 5. Better Security

- Clear authorization boundaries
- Audit trail (who did what in which org)

---

## 📝 Code Examples

### Check if user is member

```javascript
const isMember = await OrganizationMember.isMember(userId, organizationId);
```

### Get user's role

```javascript
const role = await OrganizationMember.getUserRole(userId, organizationId);
```

### Get all members

```javascript
const members = await OrganizationMember.findByOrganization(organizationId);
```

### Get user's organizations

```javascript
const orgs = await OrganizationMember.findByUser(userId);
```

---

## 🚀 Next Steps

1. **Frontend Integration**

   - Update auth flow to handle memberships
   - Add organization switcher
   - Update team management UI

2. **Email Notifications**

   - Send invitation emails
   - Send notification to contactEmail (not login email)

3. **Advanced Features**
   - Role templates
   - Custom permission sets
   - Audit logs

---

## 📚 References

- [SOLID Principles](.kiro/steering/solid-principles.md)
- [Architecture Standards](.kiro/steering/architecture-standards.md)
- [Error Handling Guide](.kiro/steering/error-handling-guide.md)
