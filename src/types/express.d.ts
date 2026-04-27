import { JwtPayload } from "jose";

declare module "jose" {
  interface JwtPayload {
    exp?: number;
    email?: string;
    username?: string;
  }
}

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
      access_token?: string;
    }
  }
}
