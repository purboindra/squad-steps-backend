import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorAssertionResponseJSON,
  type AuthenticatorTransportFuture,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
  type WebAuthnCredential,
} from "@simplewebauthn/server";
import { rp } from "../config/rp";
import redis from "../lib/redis";
import { generateTokens } from "../lib/token";
import { logger } from "../logger";
import type { VerifyAuthOptionsPayload } from "../schemas/auth.schema";
import type { VerifyRegisterOptionsPayload } from "../schemas/user.schema";
import { AppError } from "../utils/appError";
import * as usersService from "./users.service";

export const generateRegisterOptions = async (email: string) => {
  const displayName = email.split("@")[0];

  const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
    rpName: rp.name,
    rpID: rp.id,
    userName: email,
    userDisplayName: displayName,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      authenticatorAttachment: "platform",
      userVerification: "preferred",
    },
    timeout: 60000,
    excludeCredentials: [],
  });

  logger.info({ rp }, "RP IS");

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
      expectedOrigin: rp.origin,
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

export const verifyAuthResponse = async (email: string, payload: VerifyAuthOptionsPayload) => {
  try {
    const challenge = await redis.get(`login_challenge_${email}`);

    if (!challenge) {
      throw new AppError("Challenge not found", 404);
    }

    const user = await usersService.getUserByEmail(email);

    if (!user) throw new AppError("User not found", 404);

    const passkey = user.passkeys.find((p) => p.credentialID === payload.id);

    if (!passkey) throw new AppError("Passkey not recognized", 401);

    const credential: WebAuthnCredential = {
      counter: passkey.counter,
      id: passkey.credentialID,
      publicKey: new Uint8Array(passkey.publicKey.buffer),
      transports: passkey.transports as AuthenticatorTransportFuture[],
    };

    const response: AuthenticationResponseJSON = {
      clientExtensionResults: payload.clientExtensionResults,
      id: payload.id,
      rawId: payload.rawId,
      type: "public-key" as const,
      response: {
        clientDataJSON: payload.response.clientDataJSON,
        signature: payload.response.signature,
        authenticatorData: payload.response.authenticatorData,
      } as AuthenticatorAssertionResponseJSON,
    };

    const verification = await verifyAuthenticationResponse({
      credential: credential,
      expectedChallenge: challenge,
      expectedOrigin: rp.origin,
      expectedRPID: rp.id,
      response: response,
    });

    logger.info({ verification }, "Verification result");

    if (verification.verified) {
      await redis.del(`login_challenge_${email}`);

      const { newCounter } = verification.authenticationInfo;

      await usersService.updatePasskeyCounter(email, payload.id, newCounter);

      const tokens = await generateTokens({ email: user.email, username: user.username });

      logger.info({ tokens }, "Tokens generated");

      await usersService.saveRefreshToken(email, tokens.refreshToken);

      return {
        authenticationInfo: verification.authenticationInfo,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      };
    }

    throw new AppError("Authentication verification failed", 400);
  } catch (error) {
    logger.error({ error }, "Error verify auth options");
    throw error;
  }
};
