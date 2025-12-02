// packages/types/src/mongoose.types.ts
import { Types as MongooseTypes } from "mongoose";

// Re-export the ObjectId type from Mongoose to ensure type consistency
export namespace Types {
  export type ObjectId = MongooseTypes.ObjectId;
}