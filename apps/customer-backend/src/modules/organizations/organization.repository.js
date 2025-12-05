// src/modules/organizations/organization.repository.js
import { User } from "../../shared/models/user.model.js";
import { OrganizationProfile } from "./organization.model.js";

export class OrganizationRepository {
  /**
   * Find user by ID
   */
  async findUserById(userId) {
    return await User.findById(userId);
  }

  /**
   * Create new organization profile
   */
  async createProfile(profileData) {
    return await OrganizationProfile.create(profileData);
  }

  /**
   * Find organization profile by ID
   */
  async findProfileById(profileId) {
    return await OrganizationProfile.findById(profileId);
  }

  /**
   * Find organization profile by user ID
   */
  async findProfileByUserId(userId) {
    return await OrganizationProfile.findOne({ user: userId });
  }

  /**
   * Find organization profile by tax code
   */
  async findProfileByTaxCode(taxCode) {
    return await OrganizationProfile.findOne({ taxCode });
  }

  /**
   * Update user fields
   */
  async updateUser(userId, userFields) {
    if (Object.keys(userFields).length === 0) {
      return await User.findById(userId).select("-hashedPassword");
    }
    return await User.findByIdAndUpdate(
      userId,
      { $set: userFields },
      { new: true }
    ).select("-hashedPassword");
  }

  /**
   * Update organization profile by user ID
   */
  async updateProfileByUserId(userId, profileFields) {
    if (Object.keys(profileFields).length === 0) {
      return await this.findProfileByUserId(userId);
    }
    return await OrganizationProfile.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true, runValidators: true }
    );
  }

  /**
   * Update organization profile by profile ID
   */
  async updateProfileById(profileId, profileFields) {
    if (Object.keys(profileFields).length === 0) {
      return await this.findProfileById(profileId);
    }
    return await OrganizationProfile.findByIdAndUpdate(
      profileId,
      { $set: profileFields },
      { new: true, runValidators: true }
    );
  }

  /**
   * Add credits to organization
   */
  async addCredits(profileId, amount) {
    return await OrganizationProfile.findByIdAndUpdate(
      profileId,
      { $inc: { credits: amount } },
      { new: true }
    );
  }

  /**
   * Deduct credits from organization
   */
  async deductCredits(profileId, amount) {
    return await OrganizationProfile.findByIdAndUpdate(
      profileId,
      { $inc: { credits: -amount } },
      { new: true }
    );
  }

  /**
   * Update organization stats after order
   */
  async updateOrderStats(profileId, orderAmount) {
    return await OrganizationProfile.findByIdAndUpdate(
      profileId,
      {
        $inc: {
          totalOrders: 1,
          totalSpent: orderAmount,
        },
      },
      { new: true }
    );
  }

  /**
   * Link inventory to organization
   */
  async linkInventory(profileId, inventoryId) {
    return await OrganizationProfile.findByIdAndUpdate(
      profileId,
      { $set: { inventoryId } },
      { new: true }
    );
  }
}
