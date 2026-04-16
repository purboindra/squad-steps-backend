import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type PublicKeyCredentialCreationOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { rp } from "../config/rp";
import redis from "../lib/redis";
import { logger } from "../logger";
import type { VerifyRegisterOptionsPayload } from "../schemas/registerOptions.schema";
import { AppError } from "../utils/appError";

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
      expectedOrigin: [rp.origin, "android:apk-key-hash:FzpqiGKEgbNlWn_7Z0_PI4eV3F5ipUieKwRskGBLqaM"],
      response: response,
    });

    const isVerified = verification.verified;
    const registrationInfo = verification.registrationInfo;

    const isValidRegistration = isVerified && registrationInfo !== undefined;

    if (isValidRegistration) {
      return verification;
    }

    throw new AppError("Registration verification failed", 400);
  } catch (error) {
    logger.error({ error }, "Error verify registration options");
    throw error;
  }
};
