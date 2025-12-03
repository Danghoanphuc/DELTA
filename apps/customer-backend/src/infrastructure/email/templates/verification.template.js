// Email verification template
import { EMAIL_STYLES } from "../styles/email.styles.js";
import { createBaseTemplate } from "./base.template.js";

export const createVerificationTemplate = ({
  email,
  verificationLink,
  token,
}) => {
  const content = `
    <div style="${EMAIL_STYLES.label}">SYSTEM NOTIFICATION</div>
    <h1 style="${EMAIL_STYLES.heading}">XÁC THỰC DANH TÍNH</h1>
    
    <p style="${EMAIL_STYLES.text}">Hệ thống nhận được yêu cầu đăng ký cho tài khoản:</p>
    <div style="font-family: monospace; font-size: 16px; font-weight: bold; margin-bottom: 24px; padding: 12px; background: #f5f5f5; display: inline-block;">
      ${email}
    </div>
    
    <p style="${EMAIL_STYLES.text}">Để kích hoạt Workspace, vui lòng xác nhận quyền sở hữu email này.</p>
    
    <div style="${EMAIL_STYLES.buttonWrapper}">
      <a href="${verificationLink}" style="${EMAIL_STYLES.button}">KÍCH HOẠT TÀI KHOẢN →</a>
    </div>

    <div style="${EMAIL_STYLES.box}">
      <span style="${EMAIL_STYLES.label}">MANUAL LINK</span>
      <p style="font-family: monospace; font-size: 11px; word-break: break-all; margin: 0; color: #525252;">${verificationLink}</p>
    </div>

    <p style="${EMAIL_STYLES.text}; font-size: 12px; color: #737373;">Link có hiệu lực trong 24 giờ. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua.</p>
  `;

  const footer = `
    TIMESTAMP: ${new Date().toISOString()}<br>
    REF_ID: ${token.substring(0, 8).toUpperCase()}<br>
    © ${new Date().getFullYear()} PRINTZ CORPORATE.
  `;

  return createBaseTemplate({
    brand: "PRINTZ // AUTH",
    content,
    footer,
  });
};
