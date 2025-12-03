// Resend email provider
import { Resend } from "resend";
import { config } from "../../../config/env.config.js";
import { EMAIL_CONFIG } from "../config/email.config.js";

const resend = new Resend(config.apiKeys.resend);

export class ResendEmailProvider {
  async send({ to, subject, html }) {
    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_CONFIG.fromEmail,
        to,
        subject,
        html,
      });

      if (error) throw error;

      console.log(`✅ [EMAIL] Sent successfully: ${data?.id}`);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ [EMAIL] Failed to send:`, error);
      throw error;
    }
  }
}
