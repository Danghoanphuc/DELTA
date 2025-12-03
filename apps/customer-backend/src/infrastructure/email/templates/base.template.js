// Base email template wrapper
import { EMAIL_STYLES } from "../styles/email.styles.js";

export const createBaseTemplate = ({ brand, content, footer }) => {
  return `
    <!DOCTYPE html>
    <html>
    <body style="${EMAIL_STYLES.body}">
      <div style="${EMAIL_STYLES.container}">
        <div style="${EMAIL_STYLES.header}">
          <div style="${EMAIL_STYLES.brand}">${brand}</div>
        </div>
        <div style="${EMAIL_STYLES.content}">
          ${content}
        </div>
        <div style="${EMAIL_STYLES.footer}">
          ${footer}
        </div>
      </div>
    </body>
    </html>
  `;
};
