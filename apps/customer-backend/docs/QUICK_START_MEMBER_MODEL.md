# Quick Start: User - Organization - Member Model

## 🚀 Bắt đầu nhanh

Hướng dẫn nhanh để sử dụng kiến trúc User - Organization - Member mới.

---

## 📦 Đã có sẵn

### Backend

✅ Models, Repositories, Services, Controllers, Routes  
✅ Middleware cho authorization  
✅ Migration script  
✅ Auto-create owner membership

### Frontend

✅ Services, Hooks, Components  
✅ TypeScript interfaces  
✅ Error handling

---

## 🎯 Luồng hoạt động cơ bản

### 1. User đăng ký và tạo Organization

```javascript
// Backend tự động xử lý
POST /api/organizations/register
{
  "businessName": "Printz Global",
  "contactEmail": "ceo@printz.vn",  // Work email
  "logoUrl": "...",
  "usageIntent": "employee_onboarding"
}

// Kết quả:
// 1. Tạo Organization
// 2. Tạo OrganizationMember với role="owner" (tự động)
// 3. User có thể vào Dashboard ngay
```

### 2. Mời thành viên

```javascript
// Frontend
const { inviteMember } = useOrganizationMembers(organizationId);

await inviteMember({
  email: "member@printz.vn",
  role: "member",
});

// Backend tạo invitation với token
// Gửi email (TODO)
```

### 3. Accept invitation

```javascript
// User click vào link trong email
GET /invite/:token

// Frontend call API
POST /api/organizations/invitations/:token/accept

// Backend:
// 1. Verify token
// 2. Create membership
// 3. Update stats
```

### 4. Quản lý members

```javascript
// Get members
const { members, stats } = useOrganizationMembers(organizationId);

// Update role
await updateMemberRole(userId, "admin");

// Remove member
await removeMember(userId);

// Transfer ownership
await transferOwnership(newOwnerId);
```

---

## 🔐 Authorization

### Middleware Usage

```javascript
// Require membership
router.get(
  "/organizations/:organizationId/orders",
  protect,
  requireOrgMembership,
  controller.getOrders
);

// Require specific role
router.post(
  "/organizations/:organizationId/members/invite",
  protect,
  requireAdminOrOwner,
  controller.inviteMember
);

// Require owner
router.post(
  "/organizations/:organizationId/transfer-ownership",
  protect,
  requireOwner,
  controller.transferOwnership
);

// Custom permission
router.put(
  "/organizations/:organizationId/settings",
  protect,
  requirePermission("canManageBilling"),
  controller.updateSettings
);
```

### In Service Layer

```javascript
// Check if user is member
const isMember = await memberRepository.isMember(userId, organizationId);

// Get user's role
const role = await memberRepository.getUserRole(userId, organizationId);

// Check if admin or owner
const isAdminOrOwner = await memberRepository.isAdminOrOwner(
  userId,
  organizationId
);
```

---

## 🎨 Frontend Usage

### 1. Display Members

```tsx
import { useOrganizationMembers } from "@/features/organization/hooks/useOrganizationMembers";
import { MemberList } from "@/features/organization/components/team/MemberList";

function TeamPage() {
  const { members, isLoading } = useOrganizationMembers(organizationId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <MemberList
      members={members}
      currentUserId={user._id}
      onUpdateRole={updateMemberRole}
      onRemove={removeMember}
      onTransferOwnership={transferOwnership}
    />
  );
}
```

### 2. Invite Member

```tsx
import { InviteMemberModal } from "@/features/organization/components/team/InviteMemberModal";

function TeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const { inviteMember } = useOrganizationMembers(organizationId);

  return (
    <>
      <Button onClick={() => setShowInvite(true)}>Mời thành viên</Button>

      <InviteMemberModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onInvite={inviteMember}
      />
    </>
  );
}
```

### 3. Organization Switcher

```tsx
import { useMyOrganizations } from "@/features/organization/hooks/useOrganizationMembers";

function OrganizationSwitcher() {
  const { organizations, isLoading } = useMyOrganizations();

  return (
    <Select>
      {organizations.map((org) => (
        <SelectItem key={org._id} value={org._id}>
          {org.businessName} ({org.role})
        </SelectItem>
      ))}
    </Select>
  );
}
```

---

## 🔄 Migration

### Trước khi migrate

```bash
# 1. Backup database
mongodump --uri="mongodb://..." --out=./backup-$(date +%Y%m%d)

# 2. Test trên staging
NODE_ENV=staging node scripts/migrate-to-member-model.js

# 3. Verify data
mongo
> db.organizations.count()
> db.organizationmembers.count()
```

### Chạy migration

```bash
cd apps/customer-backend

# Production migration
node scripts/migrate-to-member-model.js
```

### Sau migration

```bash
# 1. Verify API endpoints
curl http://localhost:8000/api/organizations/my-organizations \
  -H "Authorization: Bearer TOKEN"

# 2. Check logs
tail -f logs/app.log

# 3. Monitor errors
# Check Sentry dashboard
```

---

## 🧪 Testing

### Test API Endpoints

```bash
# Get my organizations
curl -X GET http://localhost:8000/api/organizations/my-organizations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get members
curl -X GET http://localhost:8000/api/organizations/:orgId/members \
  -H "Authorization: Bearer YOUR_TOKEN"

# Invite member
curl -X POST http://localhost:8000/api/organizations/:orgId/members/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"member@example.com","role":"member"}'

# Update role
curl -X PUT http://localhost:8000/api/organizations/:orgId/members/:userId/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

### Test Frontend

```typescript
// Test hook
const { members, inviteMember } = useOrganizationMembers(orgId);

// Test invite
await inviteMember({
  email: "test@example.com",
  role: "member",
});

// Test update role
await updateMemberRole(userId, "admin");
```

---

## 🐛 Troubleshooting

### Issue: "User not found"

**Solution**: Verify user exists in database

### Issue: "Already a member"

**Solution**: Check if membership already exists

### Issue: "Permission denied"

**Solution**: Verify user has correct role

### Issue: "Invitation expired"

**Solution**: Resend invitation (7-day expiry)

### Issue: "Cannot remove owner"

**Solution**: Transfer ownership first

---

## 📊 Database Queries

### Check memberships

```javascript
// Find all members of org
db.organizationmembers.find({ organizationId: ObjectId("...") });

// Find user's organizations
db.organizationmembers.find({ userId: ObjectId("...") });

// Check if user is member
db.organizationmembers.findOne({
  userId: ObjectId("..."),
  organizationId: ObjectId("..."),
  status: "active",
});
```

### Check stats

```javascript
// Count members
db.organizationmembers.countDocuments({
  organizationId: ObjectId("..."),
  status: "active",
});

// Group by role
db.organizationmembers.aggregate([
  { $match: { organizationId: ObjectId("..."), status: "active" } },
  { $group: { _id: "$role", count: { $sum: 1 } } },
]);
```

---

## 🎯 Best Practices

### 1. Always check membership

```javascript
// Before any organization operation
const isMember = await memberRepository.isMember(userId, orgId);
if (!isMember) {
  throw new ForbiddenException("Not a member");
}
```

### 2. Use middleware for routes

```javascript
// Don't check manually in controller
router.get("/orders", protect, requireOrgMembership, controller.getOrders);
```

### 3. Handle errors properly

```javascript
try {
  await inviteMember(data);
  toast.success("Invited!");
} catch (err) {
  toast.error(err.response?.data?.message || "Failed");
}
```

### 4. Update stats after changes

```javascript
// After adding/removing members
await Organization.findByIdAndUpdate(orgId, {
  $inc: { "stats.totalMembers": 1 },
});
```

---

## 📚 References

- [Architecture](./USER_ORG_MEMBER_ARCHITECTURE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Implementation](./USER_ORG_MEMBER_IMPLEMENTATION.md)
- [Integration Complete](./INTEGRATION_COMPLETE.md)

---

## ✅ Checklist

### Before Going Live

- [ ] Migration script tested on staging
- [ ] All API endpoints working
- [ ] Frontend components tested
- [ ] Error handling verified
- [ ] Permissions enforced
- [ ] Database backup created
- [ ] Rollback plan ready
- [ ] Team notified

### After Going Live

- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Verify user flows
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Update documentation

---

**Status**: Ready to use! 🚀
