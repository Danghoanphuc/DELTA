// apps/customer-backend/src/modules/contact-requests/contact-request.repository.js
import { ContactRequest } from "./contact-request.model.js";

export class ContactRequestRepository {
  async create(data) {
    const request = new ContactRequest(data);
    return await request.save();
  }

  async findById(id) {
    return await ContactRequest.findById(id).lean();
  }

  async find(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = -1,
    } = options;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      ContactRequest.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactRequest.countDocuments(filter),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id, status, additionalData = {}) {
    return await ContactRequest.findByIdAndUpdate(
      id,
      { status, ...additionalData },
      { new: true }
    );
  }

  async count(filter = {}) {
    return await ContactRequest.countDocuments(filter);
  }
}
