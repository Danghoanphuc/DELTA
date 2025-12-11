// scripts/migrate-to-member-model.js
// ✅ Migration script: Chuyển từ OrganizationProfile sang Organization + OrganizationMember

import mongoose from "mongoose";
import { config } from "../src/config/env.config.js";
import { User } from "../src/shared/models/user.model.js";
import { OrganizationProfile } from "../src/modules/organizations/organization.model.js";
import { Organization } from "../src/modules/organizations/organization-refactored.model.js";
import {
  OrganizationMember,
  MEMBER_ROLES,
  MEMBER_STATUS,
} from "../src/modules/organizations/organization-member.model.js";

/**
 * Migration Plan:
 *
 * 1. Tạo Organization mới từ OrganizationProfile
 * 2. Tạo OrganizationMember cho owner (user field)
 * 3. Tạo OrganizationMember cho teamMembers
 * 4. Update User.organizationProfileId -> không cần nữa (dùng OrganizationMember)
 * 5. Backup OrganizationProfile (không xóa ngay)
 */

async function migrateToMemberModel() {
  try {
    console.log("🚀 Starting migration to Member model...\n");

    // Connect to database
    await mongoose.connect(config.database.uri);
    console.log("✅ Connected to database\n");

    // Get all organization profiles
    const orgProfiles = await OrganizationProfile.find({});
    console.log(`📊 Found ${orgProfiles.length} organization profiles\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const orgProfile of orgProfiles) {
      try {
        console.log(
          `\n📦 Processing: ${orgProfile.businessName} (${orgProfile._id})`
        );

        // 1. Check if already migrated
        const existingOrg = await Organization.findOne({
          _id: orgProfile._id,
        });

        if (existingOrg) {
          console.log(`⏭️  Already migrated, skipping...`);
          continue;
        }

        // 2. Create new Organization
        const newOrg = new Organization({
          _id: orgProfile._id, // Keep same ID
          businessName: orgProfile.businessName,
          description: orgProfile.description || "",
          industry: orgProfile.industry,

          // Contact info (work email - NOT login email)
          contactEmail: orgProfile.contactEmail || orgProfile.user?.email,
          contactPhone: orgProfile.contactPhone,
          website: orgProfile.website,

          // Tax & Legal
          taxCode: orgProfile.taxCode,

          // Branding
          logoUrl: orgProfile.logoUrl,
          coverImage: orgProfile.coverImage,
          vectorUrl: orgProfile.vectorUrl,
          brandGuidelineUrl: orgProfile.brandGuidelineUrl,

          // Address
          billingAddress: orgProfile.billingAddress,

          // Verification
          verificationStatus: orgProfile.verificationStatus,
          verificationDocs: orgProfile.verificationDocs,
          isVerified: orgProfile.isVerified,

          // Status
          isActive: orgProfile.isActive,

          // Tier & Financial
          tier: orgProfile.tier,
          credits: orgProfile.credits || 0,
          creditLimit: orgProfile.creditLimit || 0,
          paymentTerms: orgProfile.paymentTerms,

          // Stripe
          stripeCustomerId: orgProfile.stripeCustomerId,

          // Inventory
          inventoryId: orgProfile.inventoryId,

          // Usage Intent
          usageIntent: orgProfile.usageIntent,

          // Onboarding
          onboardingCompleted: orgProfile.onboardingCompleted,
          onboardingStep: orgProfile.onboardingStep,

          // Stats
          stats: {
            totalOrders: orgProfile.totalOrders || 0,
            totalSpent: orgProfile.totalSpent || 0,
            totalMembers: 1 + (orgProfile.teamMembers?.length || 0),
          },

          // Timestamps
          createdAt: orgProfile.createdAt,
          updatedAt: orgProfile.updatedAt,
        });

        await newOrg.save();
        console.log(`✅ Created Organization: ${newOrg._id}`);

        // 3. Create OrganizationMember for owner
        const ownerUser = await User.findById(orgProfile.user);
        if (!ownerUser) {
          console.log(`⚠️  Owner user not found: ${orgProfile.user}`);
          errors.push({
            org: orgProfile.businessName,
            error: "Owner user not found",
          });
          errorCount++;
          continue;
        }

        const ownerMember = new OrganizationMember({
          userId: ownerUser._id,
          organizationId: newOrg._id,
          role: MEMBER_ROLES.OWNER,
          status: MEMBER_STATUS.ACTIVE,
          joinedAt: orgProfile.createdAt || new Date(),
          permissions: {
            canManageTeam: true,
            canManageOrders: true,
            canManageInventory: true,
            canManageBilling: true,
            canViewAnalytics: true,
          },
        });

        await ownerMember.save();
        console.log(`✅ Created Owner membership: ${ownerUser.email}`);

        // 4. Create OrganizationMember for team members
        if (orgProfile.teamMembers && orgProfile.teamMembers.length > 0) {
          for (const teamMember of orgProfile.teamMembers) {
            try {
              const memberUser = await User.findById(teamMember.userId);
              if (!memberUser) {
                console.log(
                  `⚠️  Team member user not found: ${teamMember.userId}`
                );
                continue;
              }

              const member = new OrganizationMember({
                userId: memberUser._id,
                organizationId: newOrg._id,
                role: teamMember.role || MEMBER_ROLES.MEMBER,
                status: MEMBER_STATUS.ACTIVE,
                joinedAt: teamMember.joinedAt || new Date(),
                permissions: {
                  canManageTeam: teamMember.role === MEMBER_ROLES.ADMIN,
                  canManageOrders: true,
                  canManageInventory: teamMember.role === MEMBER_ROLES.ADMIN,
                  canManageBilling: teamMember.role === MEMBER_ROLES.ADMIN,
                  canViewAnalytics: true,
                },
              });

              await member.save();
              console.log(
                `✅ Created Team membership: ${memberUser.email} (${member.role})`
              );
            } catch (err) {
              console.log(`❌ Error creating team member: ${err.message}`);
            }
          }
        }

        // 5. Handle pending invites
        if (orgProfile.pendingInvites && orgProfile.pendingInvites.length > 0) {
          for (const invite of orgProfile.pendingInvites) {
            if (invite.status === "pending") {
              try {
                const inviteToken = require("crypto")
                  .randomBytes(32)
                  .toString("hex");
                const inviteExpiresAt = new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                );

                const invitation = new OrganizationMember({
                  organizationId: newOrg._id,
                  role: MEMBER_ROLES.MEMBER,
                  status: MEMBER_STATUS.INVITED,
                  invitedBy: ownerUser._id,
                  invitedAt: invite.invitedAt || new Date(),
                  inviteToken,
                  inviteExpiresAt,
                });

                await invitation.save();
                console.log(`✅ Created Invitation: ${invite.email}`);
              } catch (err) {
                console.log(`❌ Error creating invitation: ${err.message}`);
              }
            }
          }
        }

        successCount++;
        console.log(`✅ Successfully migrated: ${orgProfile.businessName}`);
      } catch (error) {
        console.error(
          `❌ Error migrating ${orgProfile.businessName}:`,
          error.message
        );
        errors.push({
          org: orgProfile.businessName,
          error: error.message,
        });
        errorCount++;
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 MIGRATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    if (errors.length > 0) {
      console.log("\n❌ Errors:");
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.org}: ${err.error}`);
      });
    }

    console.log("\n✅ Migration completed!");
    console.log("\n⚠️  IMPORTANT: OrganizationProfile collection NOT deleted.");
    console.log("   Please verify the migration before removing old data.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from database");
  }
}

// Run migration
migrateToMemberModel()
  .then(() => {
    console.log("\n🎉 Migration script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration script failed:", error);
    process.exit(1);
  });
