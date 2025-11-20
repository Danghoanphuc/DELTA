/**
 * No-op toast implementation
 * Replaces sonner toast to disable all toast notifications globally
 */

const noop = () => {};

export const toast = {
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
  loading: noop,
  promise: noop,
  custom: noop,
  message: noop,
  dismiss: noop,
};

export default toast;

