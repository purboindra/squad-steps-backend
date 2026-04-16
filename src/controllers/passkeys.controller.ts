import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import * as service from "../services/passkeys.service";
import { errorToAppError } from "../utils/appError";

export const generateRegisterOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const options = await service.generateRegisterOptions(email);

    res.status(201).json({
      message: "Options generated successfully",
      data: options,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error generate options");
    next(errorToAppError(error));
  }
};

export const verifyRegisterOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug({ body: req.body }, "Body from verifyRegisterOptions");

    const options = await service.verifyRegisterOptions(req.body);

    logger.info({ options }, "Options verified successfully");

    res.status(200).json({
      message: "Options verified successfully",
      data: options,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error verify options");
    next(errorToAppError(error));
  }
};
