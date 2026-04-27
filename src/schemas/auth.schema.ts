import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const loginOptionSchema = z.object({
  email: emailSchemaWithPreprocessing,
});

export type LoginOptionPayload = z.infer<typeof loginOptionSchema>;

export const responseAuthOptions = z.object({
  clientDataJSON: z.string().min(1, "clientDataJSON is required"),
  authenticatorData: z.string().min(1, "authenticatorData is required"),
  signature: z.string().min(1, "signature is required"),
  userHandle: z.string().min(1, "userHandle is required"),
});

export type ResponseAuthOptions = z.infer<typeof responseAuthOptions>;

export const verifyAuthOptionsSchema = z.object({
  rawId: z.string().min(1, "rawId is required"),
  authenticatorAttachment: z.string().min(1, "authenticatorAttachment is required"),
  type: z.string().min(1, "type is required"),
  id: z.string().min(1, "id is required"),
  response: responseAuthOptions,
  clientExtensionResults: z.record(z.string(), z.any()).optional().default({}),
});

export type VerifyAuthOptionsPayload = z.infer<typeof verifyAuthOptionsSchema>;

export const verifyResponseAuthOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
  options: verifyAuthOptionsSchema,
});

export type VerifyResponseAuthOptionsPayload = z.infer<typeof verifyResponseAuthOptionsSchema>;
