import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const createPasskeySchema = z.object({
  credentialID: z.string().min(1, "Credential ID is required"),
  publicKey: z.any(),
  counter: z.number().default(0),
  deviceName: z.string().default("Primary Device"),
  transports: z.array(z.string().min(1, "Transport is required")),
  createdAt: z
    .date()
    .default(() => new Date())
    .optional(),
});

export type CreatePasskeyPayload = z.infer<typeof createPasskeySchema>;

export const createUserSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  username: z.string().min(1, "Username is required"),
  profilePicture: z.string().optional(),
  currentSteps: z.number().default(0),
  passkeys: z.array(createPasskeySchema).min(1, "At least one passkey is required"),
  groups: z.array(z.string()).default([]),
  createdAt: z
    .date()
    .default(() => new Date())
    .optional(),
  updatedAt: z
    .date()
    .default(() => new Date())
    .optional(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

export const verifyRegisterOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
  id: z.string(),
  rawId: z.string(),
  clientDataJSON: z.string(),
  attestationObject: z.string(),
  type: z.string(),
  transports: z.array(z.string()),
  clientExtensionResults: z.record(z.string(), z.any()).optional().default({}),
});

export type VerifyRegisterOptionsPayload = z.infer<typeof verifyRegisterOptionsSchema>;
