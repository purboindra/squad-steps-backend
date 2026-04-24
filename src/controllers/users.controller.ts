import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import type { CreatePasskeyPayload, CreateUserPayload } from "../schemas/user.schema";
import * as passkeysService from "../services/passkeys.service";
import * as userService from "../services/users.service";
import { errorToAppError } from "../utils/appError";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = req.body;

    const email = String(body.email);

    const username = email.split("@")[0];

    const passkey = await passkeysService.verifyRegisterOptions(body);

    const passkeyPayload: CreatePasskeyPayload = {
      counter: passkey.credential.counter,
      credentialID: passkey.credential.id,
      deviceName: "Primary Device",
      publicKey: passkey.credential.publicKey,
      transports: passkey.credential.transports ?? [],
    };

    const createUserPayload: CreateUserPayload = {
      email: email,
      username: username ?? "",
      passkeys: [passkeyPayload],
      currentSteps: 0,
      groups: [],
    };

    const result = await userService.registerUser(createUserPayload);

    logger.info({ result }, "Result from register user controller");

    res.status(201).json({
      message: "User registered successfully",
      data: result,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error while register user controller");
    next(errorToAppError(error));
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const result = await userService.deleteUser(id);

    logger.info({ result }, "Result from delete user controller");

    res.status(200).json({
      message: "User deleted successfully",
      data: null,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error while delete user controller");
    next(errorToAppError(error));
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.getAllUsers();

    logger.info({ result }, "Result from get all users controller");

    res.status(200).json({
      message: "Users fetched successfully",
      data: result,
      success: true,
    });
  } catch (error) {
    logger.error({ error }, "Error while get all users controller");
    next(errorToAppError(error));
  }
};
