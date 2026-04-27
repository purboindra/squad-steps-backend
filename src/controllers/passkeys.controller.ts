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

export const generateAuthOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const response = await service.generateAuthOptions(email);

    res.status(201).json({
      message: "Options generated successfully",
      data: response,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error generate auth options");
    next(errorToAppError(error));
  }
};

export const getPasskeyOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const response = await service.getPasskeyOptions(email);

    res.status(200).json({
      message: "Options fetched successfully",
      data: response,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error get passkey options");
    next(errorToAppError(error));
  }
};

export const verifyAuthResponse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, options } = req.body;

    const response = await service.verifyAuthResponse(email, options);

    const { accessToken, refreshToken } = response;

    const data = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    logger.info({ data }, "Data to be sent to client");

    res.status(201).json({
      message: "Login successfully",
      data: data,
      success: true,
    });
  } catch (error) {
    next(errorToAppError(error));
  }
};
