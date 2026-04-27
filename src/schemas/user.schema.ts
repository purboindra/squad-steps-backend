import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const createPasskeySchema = z.object({
  credential_id: z.string().min(1, "Credential ID is required"),
  public_key: z.any(),
  counter: z.number().default(0),
  device_name: z.string().default("Primary Device"),
  transports: z.array(z.string().min(1, "Transport is required")),
  created_at: z
    .date()
    .default(() => new Date())
    .optional(),
});

export type CreatePasskeyPayload = z.infer<typeof createPasskeySchema>;

export const createUserSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  username: z.string().min(1, "Username is required"),
  profile_picture: z.string().optional(),
  current_steps: z.number().default(0),
  passkeys: z.array(createPasskeySchema).min(1, "At least one passkey is required"),
  groups: z.array(z.string()).default([]),
  created_at: z
    .date()
    .default(() => new Date())
    .optional(),
  updated_at: z
    .date()
    .default(() => new Date())
    .optional(),
});

export type CreateUserPayload = z.infer<typeof createUserSchema>;

export const verifyRegisterOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
  id: z.string(),
  raw_id: z.string(),
  client_data_json: z.string(),
  attestation_object: z.string(),
  type: z.string(),
  transports: z.array(z.string()),
  client_extension_results: z.record(z.string(), z.any()).optional().default({}),
});

export type VerifyRegisterOptionsPayload = z.infer<typeof verifyRegisterOptionsSchema>;
