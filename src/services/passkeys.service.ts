import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { rp } from "../config/rp";
import redis from "../lib/redis";
import { logger } from "../logger";
import type { VerifyRegisterOptionsPayload } from "../schemas/user.schema";
import { AppError } from "../utils/appError";
import * as usersService from "./users.service";

export const generateRegisterOptions = async (email: string) => {
  const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
    rpName: rp.name,
    rpID: rp.id,
    userName: email,
    userDisplayName: email,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      authenticatorAttachment: "platform",
      userVerification: "preferred",
    },
    timeout: 60000,
    excludeCredentials: [],
  });

  logger.info({ options }, "Response options");

  await redis.set(`challenge_${email}`, options.challenge, { EX: 60 * 5 });

  return options;
};

export const verifyRegisterOptions = async (payload: VerifyRegisterOptionsPayload) => {
  try {
    logger.info({ payload }, "Payload from verifyRegisterOptions");
    const challange = await redis.get(`challenge_${payload.email}`);

    if (!challange) {
      throw new AppError("Challange not found", 404);
    }

    const response: RegistrationResponseJSON = {
      clientExtensionResults: payload.clientExtensionResults,
      id: payload.id,
      rawId: payload.rawId,
      type: "public-key" as const,
      response: {
        clientDataJSON: payload.clientDataJSON,
        attestationObject: payload.attestationObject,
        transports: payload.transports as any,
      },
    };

    const verification = await verifyRegistrationResponse({
      expectedChallenge: challange,
      expectedOrigin: [
        rp.origin,
        "https://squad-steps-backend.netlify.app",
        "https://ba445f89--squad-steps-backend.netlify.live",
        "android:apk-key-hash:FzpqimKEgbNlWn_7Z0_PI4eV3F5ipUieKwRskGBLqaM",
      ],
      expectedRPID: rp.id,
      response: response,
    });

    logger.info({ verification }, "Verification result");

    const isVerified = verification.verified;
    const registrationInfo = verification.registrationInfo;

    const isValidRegistration = isVerified && registrationInfo !== undefined;

    if (isValidRegistration) {
      /// Delete challenge after use
      await redis.del(`challenge_${payload.email}`);
      return registrationInfo;
    }

    throw new AppError("Registration verification failed", 400);
  } catch (error) {
    logger.error({ error }, "Error verify registration options");
    throw error;
  }
};

export const generateAuthOptions = async (email: string) => {
  try {
    const user = await usersService.getUserByEmail(email);

    if (!user) throw new AppError("User not found", 404);

    const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
      rpID: rp.id,
      userVerification: "preferred",
      allowCredentials: user.passkeys.map((passkey: any) => ({
        id: passkey.credentialID,
        transports: passkey.transports as any,
      })),
    });

    logger.info({ options }, "Response options");

    await redis.set(`login_challenge_${email}`, options.challenge, { EX: 60 * 5 });

    return options;
  } catch (error) {
    logger.error({ error }, "Error generate auth options");
    throw error;
  }
};

export const getPasskeyOptions = async (email: string) => {
  try {
    const user = await usersService.getUserByEmail(email);

    if (!user) {
      const options = await generateRegisterOptions(email);
      return {
        type: "REGISTER",
        options,
      };
    }

    const options = await generateAuthOptions(email);
    return {
      type: "LOGIN",
      options,
    };
  } catch (error) {
    logger.error({ error }, "Error passkeys options");
    throw error;
  }
};
