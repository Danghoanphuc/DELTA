// src/modules/recipients/recipient.service.js
// ✅ Recipient Service - Business logic layer

import { RecipientRepository } from "./recipient.repository.js";
import {
  NotFoundException,
  ConflictException,
  ValidationException,
} from "../../shared/exceptions/index.js";
import { Logger } from "../../shared/utils/index.js";
import { parse } from "csv-parse/sync";

export class RecipientService {
  constructor() {
    this.recipientRepository = new RecipientRepository();
  }

  /**
   * Create a single recipient
   */
  async createRecipient(organizationId, data) {
    Logger.debug(
      `[RecipientSvc] Creating recipient for org: ${organizationId}`
    );

    // Check for duplicate email
    const existing = await this.recipientRepository.findByOrgAndEmail(
      organizationId,
      data.email
    );
    if (existing) {
      throw new ConflictException("Email này đã tồn tại trong danh sách");
    }

    const recipient = await this.recipientRepository.create({
      organization: organizationId,
      ...data,
      importSource: "manual",
    });

    Logger.success(`[RecipientSvc] Created recipient: ${recipient._id}`);
    return recipient;
  }

  /**
   * Import recipients from CSV
   */
  async importFromCSV(organizationId, csvContent, options = {}) {
    Logger.debug(`[RecipientSvc] Importing CSV for org: ${organizationId}`);

    const { skipDuplicates = true, tags = [] } = options;

    // Parse CSV
    let records;
    try {
      records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (error) {
      throw new ValidationException("File CSV không hợp lệ: " + error.message);
    }

    if (records.length === 0) {
      throw new ValidationException("File CSV không có dữ liệu");
    }

    // Validate required columns
    const requiredColumns = ["firstName", "lastName", "email"];
    const firstRecord = records[0];
    const missingColumns = requiredColumns.filter(
      (col) => !(col in firstRecord) && !(col.toLowerCase() in firstRecord)
    );

    if (missingColumns.length > 0) {
      throw new ValidationException(
        `Thiếu cột bắt buộc: ${missingColumns.join(", ")}`
      );
    }

    const importBatchId = `import_${Date.now()}`;
    const results = {
      total: records.length,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    const recipientsToCreate = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // +2 because header is row 1

      try {
        // Normalize column names (case-insensitive)
        const normalizedRow = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[key.toLowerCase()] = row[key];
        });

        const email = (normalizedRow.email || "").toLowerCase().trim();
        if (!email || !email.includes("@")) {
          results.errors.push({ row: rowNum, error: "Email không hợp lệ" });
          continue;
        }

        // Check duplicate
        if (skipDuplicates) {
          const existing = await this.recipientRepository.findByOrgAndEmail(
            organizationId,
            email
          );
          if (existing) {
            results.skipped++;
            continue;
          }
        }

        const recipient = {
          organization: organizationId,
          firstName: normalizedRow.firstname || normalizedRow.first_name || "",
          lastName: normalizedRow.lastname || normalizedRow.last_name || "",
          email,
          phone: normalizedRow.phone || normalizedRow.phonenumber || "",
          address: {
            street: normalizedRow.street || normalizedRow.address || "",
            ward: normalizedRow.ward || "",
            district: normalizedRow.district || "",
            city: normalizedRow.city || "",
            postalCode:
              normalizedRow.postalcode || normalizedRow.postal_code || "",
          },
          customFields: {
            department: normalizedRow.department || "",
            jobTitle: normalizedRow.jobtitle || normalizedRow.job_title || "",
            employeeId:
              normalizedRow.employeeid || normalizedRow.employee_id || "",
            shirtSize: this._normalizeShirtSize(
              normalizedRow.shirtsize || normalizedRow.shirt_size
            ),
            notes: normalizedRow.notes || "",
          },
          tags: [...tags],
          importSource: "csv",
          importBatchId,
        };

        recipientsToCreate.push(recipient);
      } catch (error) {
        results.errors.push({ row: rowNum, error: error.message });
      }
    }

    // Bulk insert
    if (recipientsToCreate.length > 0) {
      try {
        await this.recipientRepository.createMany(recipientsToCreate);
        results.imported = recipientsToCreate.length;
      } catch (error) {
        Logger.error("[RecipientSvc] Bulk insert error:", error);
        // Handle duplicate key errors
        if (error.code === 11000) {
          results.errors.push({ error: "Một số email bị trùng lặp" });
        } else {
          throw error;
        }
      }
    }

    Logger.success(
      `[RecipientSvc] CSV import complete: ${results.imported} imported, ${results.skipped} skipped`
    );

    return results;
  }

  /**
   * Get recipients list with filters
   */
  async getRecipients(organizationId, options = {}) {
    return await this.recipientRepository.findByOrganization(
      organizationId,
      options
    );
  }

  /**
   * Get single recipient
   */
  async getRecipient(organizationId, recipientId) {
    const recipient = await this.recipientRepository.findById(recipientId);

    if (!recipient) {
      throw new NotFoundException("Recipient", recipientId);
    }

    // Verify ownership
    if (recipient.organization.toString() !== organizationId.toString()) {
      throw new NotFoundException("Recipient", recipientId);
    }

    return recipient;
  }

  /**
   * Update recipient
   */
  async updateRecipient(organizationId, recipientId, data) {
    const recipient = await this.getRecipient(organizationId, recipientId);

    // If email is being changed, check for duplicates
    if (data.email && data.email !== recipient.email) {
      const existing = await this.recipientRepository.findByOrgAndEmail(
        organizationId,
        data.email
      );
      if (existing) {
        throw new ConflictException("Email này đã tồn tại trong danh sách");
      }
    }

    const updated = await this.recipientRepository.update(recipientId, data);
    Logger.success(`[RecipientSvc] Updated recipient: ${recipientId}`);
    return updated;
  }

  /**
   * Archive recipient (soft delete)
   */
  async archiveRecipient(organizationId, recipientId) {
    await this.getRecipient(organizationId, recipientId); // Verify ownership
    const archived = await this.recipientRepository.archive(recipientId);
    Logger.success(`[RecipientSvc] Archived recipient: ${recipientId}`);
    return archived;
  }

  /**
   * Delete recipient permanently
   */
  async deleteRecipient(organizationId, recipientId) {
    await this.getRecipient(organizationId, recipientId); // Verify ownership
    await this.recipientRepository.delete(recipientId);
    Logger.success(`[RecipientSvc] Deleted recipient: ${recipientId}`);
    return { success: true };
  }

  /**
   * Bulk archive recipients
   */
  async bulkArchive(organizationId, recipientIds) {
    // Verify all recipients belong to organization
    for (const id of recipientIds) {
      await this.getRecipient(organizationId, id);
    }

    await this.recipientRepository.bulkArchive(recipientIds);
    Logger.success(
      `[RecipientSvc] Bulk archived ${recipientIds.length} recipients`
    );
    return { archived: recipientIds.length };
  }

  /**
   * Add tags to recipients
   */
  async addTags(organizationId, recipientIds, tags) {
    for (const id of recipientIds) {
      await this.getRecipient(organizationId, id);
    }

    await this.recipientRepository.bulkUpdate(recipientIds, {
      $addToSet: { tags: { $each: tags } },
    });

    return { updated: recipientIds.length };
  }

  /**
   * Get filter options (tags, departments)
   */
  async getFilterOptions(organizationId) {
    const [tags, departments, totalCount] = await Promise.all([
      this.recipientRepository.getUniqueTags(organizationId),
      this.recipientRepository.getUniqueDepartments(organizationId),
      this.recipientRepository.countByOrganization(organizationId),
    ]);

    return { tags, departments, totalCount };
  }

  /**
   * Generate CSV template
   */
  getCSVTemplate() {
    const headers = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "street",
      "ward",
      "district",
      "city",
      "postalCode",
      "department",
      "jobTitle",
      "employeeId",
      "shirtSize",
      "notes",
    ];

    const sampleRow = [
      "Nguyễn",
      "Văn A",
      "nguyenvana@company.com",
      "0901234567",
      "123 Nguyễn Huệ",
      "Phường Bến Nghé",
      "Quận 1",
      "TP.HCM",
      "700000",
      "Marketing",
      "Manager",
      "EMP001",
      "L",
      "Ghi chú",
    ];

    return `${headers.join(",")}\n${sampleRow.join(",")}`;
  }

  // === PRIVATE HELPERS ===

  _normalizeShirtSize(size) {
    if (!size) return null;
    const normalized = size.toUpperCase().trim();
    const validSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    return validSizes.includes(normalized) ? normalized : null;
  }
}
