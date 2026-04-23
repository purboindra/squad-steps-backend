import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/appError";
import * as jose from "jose";
import { logger } from "../logger";

export const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      throw new AppError("Authorization header missing", 401);
    }

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw new AppError("Token missing", 401);
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload, protectedHeader } = await jose.jwtVerify(token, secret);

    logger.info({ payload }, "Payload from authenticate middleware");
    logger.info({ protectedHeader }, "Protected header from authenticate middleware");

    req.user = payload;
    req.access_token = token;

    next();
  } catch (error) {
    const debugAuthMiddleware = {
      user: req.user,
      access_token: req.access_token,
      url: req.url,
      method: req.method,
      originalUrl: req.originalUrl,
      body: req.body,
      headers: req.headers,
    };

    logger.error({ debugAuthMiddleware }, "Debug info from authenticate middleware");

    let message = "Internal server error";
    let statusCode = 500;

    if (error instanceof AppError) {
      message = error.message;
      statusCode = error instanceof AppError ? error.statusCode : 500;
    } else if (error instanceof jose.errors.JWTExpired) {
      message = "Token expired";
      statusCode = 401;
    } else {
      message = "Internal server error";
    }

    res.status(statusCode).send({
      message,
      data: null,
    });

    next("router");
  }
};
