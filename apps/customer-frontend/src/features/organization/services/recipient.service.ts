// src/features/organization/services/recipient.service.ts
// ✅ SOLID: Single Responsibility - API calls only

import api from "@/shared/lib/axios";

export interface Recipient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    ward?: string;
    district?: string;
    city?: string;
  };
  customFields?: {
    department?: string;
    jobTitle?: string;
    shirtSize?: string;
  };
  tags: string[];
  status: string;
  totalGiftsSent: number;
}

export interface FilterOptions {
  tags: string[];
  departments: string[];
  totalCount: number;
}

export interface RecipientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  shirtSize?: string;
}

export interface PaginationData {
  page: number;
  total: number;
  totalPages: number;
}

class RecipientService {
  async getRecipients(page = 1, search = "", limit = 50) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.append("search", search);
    const res = await api.get(`/recipients?${params}`);
    return {
      recipients: res.data?.data?.recipients || [],
      pagination: res.data?.data?.pagination || {
        page: 1,
        total: 0,
        totalPages: 1,
      },
    };
  }

  async getFilterOptions(): Promise<FilterOptions> {
    const res = await api.get("/recipients/filters");
    return res.data?.data;
  }

  async createRecipient(data: RecipientFormData) {
    return api.post("/recipients", {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      customFields: {
        department: data.department,
        jobTitle: data.jobTitle,
        shirtSize: data.shirtSize,
      },
    });
  }

  async deleteRecipient(id: string) {
    return api.delete(`/recipients/${id}`);
  }

  async bulkArchive(ids: string[]) {
    return api.post("/recipients/bulk-archive", { ids });
  }

  async importCSV(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/recipients/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data;
  }

  async downloadTemplate() {
    const res = await api.get("/recipients/template", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "recipients_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}

export const recipientService = new RecipientService();
