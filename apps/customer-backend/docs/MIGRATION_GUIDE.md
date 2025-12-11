# Migration Guide: OrganizationProfile → Organization + Member

## 📋 Overview

Hướng dẫn migrate từ model cũ (OrganizationProfile) sang kiến trúc mới (Organization + OrganizationMember).

---

## 🎯 Goals

1. Tách biệt User (Identity) và Organization (Workspace)
2. Support multi-organization membership
3. Flexible role-based permissions
4. Maintain backward compatibility

---

## 📊 Changes Summary

### Before (Old Model)

```javascript
User {
  email: "nguyenvanphuc@gmail.com",
  organizationProfileId: ObjectId  // ❌ 1-to-1 relationship
}

OrganizationProfile {
  user: ObjectId,                  // ❌ Single owner
  businessName: "Printz Global",
  contactEmail: "ceo@printz.vn",
  teamMembers: [                   // ❌ Embedded array
    { userId, role, joinedAt }
  ]
}
```

### After (New Model)

```javascript
User {
  email: "nguyenvanphuc@gmail.com"
  // ✅ No organizationProfileId
}

Organization {
  businessName: "Printz Global",
  contactEmail: "ceo@printz.vn",   // ✅ Work email
  // ✅ No user field
}

OrganizationMember {
  userId: ObjectId,                // ✅ Separate relationship
  organizationId: ObjectId,
  role: "owner" | "admin" | "member" | "viewer",
  permissions: { ... }
}
```

---

## 🔄 Migration Steps

### Step 1: Backup Database

```bash
# Backup MongoDB
mongodump --uri="mongodb://..." --out=./backup-$(date +%Y%m%d)

# Or use MongoDB Atlas backup
```

### Step 2: Run Migration Script

```bash
cd apps/customer-backend

# Dry run (check what will be migrated)
node scripts/migrate-to-member-model.js --dry-run

# Actual migration
node scripts/migrate-to-member-model.js
```

### Step 3: Verify Migration

```bash
# Check counts
mongo
> use your_database
> db.organizations.count()
> db.organizationmembers.count()
> db.organizationprofiles.count()  // Should match organizations count
```

### Step 4: Test API Endpoints

```bash
# Test member endpoints
curl -X GET http://localhost:5000/api/organizations/my-organizations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test membership check
curl -X GET http://localhost:5000/api/organizations/:orgId/members \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Update Frontend

```typescript
// Before
const org = user.organizationProfileId;

// After
const memberships = await api.get("/organizations/my-organizations");
const currentOrg = memberships[0].organizationId;
```

### Step 6: Deploy

```bash
# Deploy backend with new models
git add .
git commit -m "feat: migrate to Organization + Member model"
git push origin main

# Deploy will trigger automatically via CI/CD
```

---

## 📝 Migration Script Details

### What the script does:

1. **Create Organization** from OrganizationProfile

   - Copy all fields
   - Generate slug from businessName
   - Keep same `_id` for backward compatibility

2. **Create Owner Membership**

   - Link User (from `user` field) to Organization
   - Set role = "owner"
   - Full permissions

3. **Create Team Memberships**

   - Convert `teamMembers` array to OrganizationMember documents
   - Preserve roles and joinedAt dates

4. **Handle Pending Invites**

   - Convert `pendingInvites` to OrganizationMember with status="invited"
   - Generate invite tokens

5. **Update Stats**
   - Calculate totalMembers

### What the script does NOT do:

- ❌ Delete OrganizationProfile (kept for backup)
- ❌ Update User.organizationProfileId (deprecated field)
- ❌ Modify existing orders/data

---

## 🔍 Verification Checklist

After migration, verify:

- [ ] All organizations migrated
- [ ] All owners have membership
- [ ] All team members have membership
- [ ] Pending invites converted
- [ ] Stats updated correctly
- [ ] API endpoints working
- [ ] Frontend can fetch organizations
- [ ] Permissions working correctly

---

## 🚨 Rollback Plan

If migration fails:

### Option 1: Restore from Backup

```bash
# Restore MongoDB
mongorestore --uri="mongodb://..." ./backup-YYYYMMDD
```

### Option 2: Manual Cleanup

```bash
mongo
> use your_database

# Delete new collections
> db.organizations.drop()
> db.organizationmembers.drop()

# OrganizationProfile is still intact
```

---

## 🐛 Common Issues

### Issue 1: Owner user not found

**Symptom**: Migration skips some organizations

**Solution**:

```javascript
// Check if user exists
const user = await User.findById(orgProfile.user);
if (!user) {
  console.log("User not found, skipping...");
}
```

### Issue 2: Duplicate memberships

**Symptom**: Error "E11000 duplicate key error"

**Solution**:

```javascript
// Check if membership already exists
const existing = await OrganizationMember.findOne({
  userId,
  organizationId,
});
if (existing) {
  console.log("Membership already exists, skipping...");
}
```

### Issue 3: Invite tokens collision

**Symptom**: Error creating invitations

**Solution**:

```javascript
// Generate unique token
const inviteToken = crypto.randomBytes(32).toString("hex");
```

---

## 📊 Migration Statistics

Expected results:

```
Organizations: 100
├── Migrated: 98
├── Skipped: 2 (already migrated)
└── Errors: 0

OrganizationMembers: 150
├── Owners: 98
├── Admins: 20
├── Members: 25
└── Invited: 7
```

---

## 🔐 Security Considerations

### Before Migration

- Backup database
- Test on staging first
- Notify users about maintenance

### During Migration

- Run during low-traffic hours
- Monitor error logs
- Keep old data for rollback

### After Migration

- Verify permissions working
- Test all critical flows
- Monitor for issues

---

## 📚 API Changes

### Deprecated Endpoints

```javascript
// ❌ OLD (deprecated)
GET /api/organizations/profile
→ Use: GET /api/organizations/my-organizations

// ❌ OLD (deprecated)
POST /api/organizations/team/invite
→ Use: POST /api/organizations/:orgId/members/invite
```

### New Endpoints

```javascript
// ✅ NEW
GET    /api/organizations/my-organizations
GET    /api/organizations/:orgId/members
POST   /api/organizations/:orgId/members/invite
POST   /api/organizations/invitations/:token/accept
PUT    /api/organizations/:orgId/members/:userId/role
DELETE /api/organizations/:orgId/members/:userId
POST   /api/organizations/:orgId/leave
POST   /api/organizations/:orgId/transfer-ownership
```

---

## 🎯 Post-Migration Tasks

### Immediate (Day 1)

- [ ] Verify all organizations migrated
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Check performance metrics

### Short-term (Week 1)

- [ ] Update frontend to use new APIs
- [ ] Add organization switcher UI
- [ ] Update documentation
- [ ] Train support team

### Long-term (Month 1)

- [ ] Remove deprecated endpoints
- [ ] Archive OrganizationProfile collection
- [ ] Remove User.organizationProfileId field
- [ ] Optimize queries with new indexes

---

## 📞 Support

If you encounter issues:

1. Check error logs: `apps/customer-backend/logs/`
2. Review migration output
3. Check database state
4. Contact dev team

---

## ✅ Success Criteria

Migration is successful when:

1. ✅ All organizations have corresponding Organization documents
2. ✅ All users have OrganizationMember documents
3. ✅ API endpoints return correct data
4. ✅ Frontend can display organizations
5. ✅ Permissions work correctly
6. ✅ No data loss
7. ✅ Performance is acceptable

---

## 🚀 Next Steps

After successful migration:

1. **Phase 1**: Run in production
2. **Phase 2**: Update frontend
3. **Phase 3**: Add new features (org switcher, advanced permissions)
4. **Phase 4**: Cleanup old code
5. **Phase 5**: Archive old models

---

## 📖 References

- [Architecture Documentation](./USER_ORG_MEMBER_ARCHITECTURE.md)
- [SOLID Principles](../.kiro/steering/solid-principles.md)
- [Architecture Standards](../.kiro/steering/architecture-standards.md)
