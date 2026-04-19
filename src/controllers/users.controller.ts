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
