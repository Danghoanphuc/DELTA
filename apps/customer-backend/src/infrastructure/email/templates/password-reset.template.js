// Password reset template
import { EMAIL_STYLES } from "../styles/email.styles.js";
import { createBaseTemplate } from "./base.template.js";

export const createPasswordResetTemplate = ({ email, resetLink }) => {
  const content = `
    <div style="${EMAIL_STYLES.alert}">
      <div style="${EMAIL_STYLES.label}; color: #be123c;">CRITICAL ACTION</div>
      <strong style="font-size: 16px;">YÊU CẦU ĐẶT LẠI MẬT KHẨU</strong>
    </div>
    
    <p style="${EMAIL_STYLES.text}; margin-top: 24px;">Chúng tôi nhận được yêu cầu cấp lại mã truy cập (Password) cho tài khoản <strong>${email}</strong>.</p>
    <p style="${EMAIL_STYLES.text}">Nếu là bạn, hãy nhấn nút dưới đây để thiết lập mật khẩu mới:</p>
    
    <div style="${EMAIL_STYLES.buttonWrapper}">
      <a href="${resetLink}" style="${EMAIL_STYLES.button}">THIẾT LẬP MẬT KHẨU MỚI →</a>
    </div>

    <div style="${EMAIL_STYLES.box}">
       <span style="${EMAIL_STYLES.label}">EXPIRATION</span>
       <p style="margin: 0; font-family: monospace;">60 MINUTES</p>
    </div>
  `;

  const footer = `
    SECURE PROTOCOL ENFORCED<br>
    © ${new Date().getFullYear()} PRINTZ CORPORATE.
  `;

  return createBaseTemplate({
    brand: "PRINTZ // SECURITY",
    content,
    footer,
  });
};
