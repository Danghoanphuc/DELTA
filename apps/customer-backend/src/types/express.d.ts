
import { IUser } from "@printz/types";
import { Document } from "mongoose";

declare global {
  namespace Express {
    // By extending the global Express namespace, we can add our own
    // properties to the Request object.
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface User extends IUser, Document {}

    export interface Request {
      user?: User;
    }
  }
}
