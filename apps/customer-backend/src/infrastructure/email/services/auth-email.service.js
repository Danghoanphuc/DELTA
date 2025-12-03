// Authentication email service
import { ResendEmailProvider } from "../providers/resend.provider.js";
import { EMAIL_CONFIG } from "../config/email.config.js";
import { createVerificationTemplate } from "../templates/verification.template.js";
import { createPasswordResetTemplate } from "../templates/password-reset.template.js";

export class AuthEmailService {
  constructor() {
    this.provider = new ResendEmailProvider();
  }

  async sendVerificationEmail(email, token) {
    const verificationLink = `${EMAIL_CONFIG.clientUrl}/verify-email?token=${token}`;
    console.log(`📧 [AUTH] Sending verification to ${email}`);

    const html = createVerificationTemplate({
      email,
      verificationLink,
      token,
    });

    return this.provider.send({
      to: email,
      subject: `[PrintZ] Action Required: Verify Identity`,
      html,
    });
  }

  async sendPasswordResetEmail(email, token) {
    const resetLink = `${EMAIL_CONFIG.clientUrl}/reset-password?token=${token}`;
    console.log(`📧 [AUTH] Sending reset password to ${email}`);

    const html = createPasswordResetTemplate({
      email,
      resetLink,
    });

    return this.provider.send({
      to: email,
      subject: `[PrintZ] Security Alert: Reset Password`,
      html,
    });
  }
}
