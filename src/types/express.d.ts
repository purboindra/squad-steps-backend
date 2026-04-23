import { JwtPayload } from "jose";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
      access_token?: string;
    }
  }
}
