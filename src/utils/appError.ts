import * as z from "zod";
import { logger } from "../logger";

export type AppErrorType = "BAD_REQUEST" | "NOT_FOUND" | "CONFLICT" | "INTERNAL" | "UNAVAILABLE";

interface AppErrorArgs {}

export class AppError extends Error {
  statusCode: number;
  publicMessage?: string;
  type?: AppErrorType;

  constructor(
    message: string,
    statusCode: number,
    public meta?: Record<string, unknown>,
    type?: AppErrorType,
    publicMessage?: string,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.type = type;
    this.publicMessage = publicMessage;
  }
}

export function errorToAppError(err: unknown, fallback = "Internal server error"): AppError {
  logger.error({ err }, "From errorToAppError");

  if (err instanceof AppError) return err;

  if (err instanceof z.ZodError) {
    throw err;
  }

  return new AppError(fallback, 500);
}
