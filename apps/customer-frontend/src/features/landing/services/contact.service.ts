// apps/customer-frontend/src/features/landing/services/contact.service.ts
import axios from "axios";

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  message: string;
  latitude?: number;
  longitude?: number;
}

// Create a separate axios instance without auth interceptors for public endpoints
const publicApi = axios.create({
  baseURL: "/api",
  withCredentials: false, // No need for credentials on public endpoint
  timeout: 10000,
});

class ContactService {
  async submitContactRequest(data: ContactFormData) {
    const res = await publicApi.post("/contact-requests", data);
    return res.data;
  }
}

export const contactService = new ContactService();
