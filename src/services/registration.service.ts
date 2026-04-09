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
    const challange = await redis.get(`challenge_${payload.email}`);

    if (!challange) {
      throw new Error("Challange not found");
    }

    logger.info({ challange }, "Challange from redis");

    const response: RegistrationResponseJSON = {
      clientExtensionResults: {},
      id: payload.id,
      rawId: payload.rawId,
      type: "public-key",
      response: {
        clientDataJSON: payload.clientDataJSON,
        attestationObject: payload.attestationObject,
      },
    };

    const verification = await verifyRegistrationResponse({
      expectedChallenge: challange,
      expectedOrigin: rp.origin,
      response: response,
    });
  } catch (error) {
    logger.error({ error }, "Error verify registration options");
    throw error;
  }
};
