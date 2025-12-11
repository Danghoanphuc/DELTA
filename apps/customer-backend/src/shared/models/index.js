// apps/customer-backend/src/shared/models/index.js
// Central export for all models

// Original models
export { Conversation } from "./conversation.model.js";
export { Message } from "./message.model.js";

// Threading models
export {
  Thread,
  THREAD_STATUS,
  THREAD_PRIORITY,
  PERMISSION_LEVEL,
} from "./thread.model.js";
export { ThreadedMessage } from "./threaded-message.model.js";
export { ThreadUnread } from "./thread-unread.model.js";
export {
  ThreadTemplate,
  TEMPLATE_CATEGORY,
  CONTEXT_TYPE,
} from "./thread-template.model.js";
