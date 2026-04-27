import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import * as authService from "../services/auth.service";
import { errorToAppError } from "../utils/appError";

export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.generateToken(req.body);

    logger.info({ result }, "Result from generate token controller");

    res.status(200).json({
      message: "Token generated successfully",
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      },
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error while generate token controller");
    next(errorToAppError(error));
  }
};

export const rotateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.rotateToken(req.body.refreshToken);

    res.status(201).json({
      message: "Token rotated successfully",
      data: {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
      },
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error while rotate token controller");
    next(errorToAppError(error));
  }
};
