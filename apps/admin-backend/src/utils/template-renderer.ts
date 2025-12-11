/**
 * Template Renderer Utility
 *
 * Simple template rendering utility for HTML templates
 * Supports basic variable substitution and conditional rendering
 */

export interface TemplateData {
  [key: string]: any;
}

/**
 * Render HTML template with data
 * Supports:
 * - {{variable}} - Simple variable substitution
 * - {{#if condition}}...{{/if}} - Conditional rendering
 * - {{#each array}}...{{/each}} - Array iteration
 */
export function renderTemplate(template: string, data: TemplateData): string {
  let rendered = template;

  // Handle {{#if condition}}...{{/if}} blocks
  rendered = rendered.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (match, condition, content) => {
      return data[condition] ? content : "";
    }
  );

  // Handle {{#each array}}...{{/each}} blocks
  rendered = rendered.replace(
    /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
    (match, arrayName, itemTemplate) => {
      const array = data[arrayName];
      if (!Array.isArray(array)) return "";

      return array
        .map((item) => {
          let itemRendered = itemTemplate;

          // Replace {{this.property}} with item values
          itemRendered = itemRendered.replace(
            /\{\{this\.(\w+(?:\.\w+)*)\}\}/g,
            (match, path) => {
              const value = getNestedValue(item, path);
              return value !== undefined ? String(value) : "";
            }
          );

          return itemRendered;
        })
        .join("");
    }
  );

  // Handle simple {{variable}} substitution
  rendered = rendered.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    return data[variable] !== undefined ? String(data[variable]) : "";
  });

  return rendered;
}

/**
 * Get nested value from object using dot notation
 * e.g., getNestedValue(obj, 'user.name.first')
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Format number as Vietnamese currency
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("vi-VN");
}

/**
 * Format date as Vietnamese date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("vi-VN");
}
