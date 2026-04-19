import type { NextFunction, Request, Response } from "express";
import * as z from "zod";
import { logger } from "../logger";
import { AppError } from "../utils/appError";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const appErr = err instanceof AppError ? err : new AppError("Internal server error", 500);

  logger.error(
    { error: appErr, url: req.url, method: req.method, body: req.body, path: req.path },
    "Error caught ing errorHandler middleware",
  );

  if (req.method === "POST") {
    const body = req.body;
    logger.debug({ body });
  }

  if (err instanceof z.ZodError) {
    const { fieldErrors, formErrors } = z.flattenError(err);

    logger.error({ fieldErrors, formErrors }, "Error from zod");

    res.status(422).json({
      message: "Invalid input",
      data: null,
      details: fieldErrors,
    });
    return;
  }

  logger.error({ appErr }, "Error caught ing errorHandler middleware");

  res.status(appErr.statusCode).json({
    message: appErr.message,
    data: null,
    ...(appErr.meta ? { details: appErr.meta } : {}),
  });
}
