import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const loginOptionSchema = z.object({
  email: emailSchemaWithPreprocessing,
});

export type LoginOptionPayload = z.infer<typeof loginOptionSchema>;

export const responseAuthOptions = z.object({
  client_data_json: z.string().min(1, "clientDataJSON is required"),
  authenticator_data: z.string().min(1, "authenticatorData is required"),
  signature: z.string().min(1, "signature is required"),
  user_handle: z.string().min(1, "userHandle is required"),
});

export type ResponseAuthOptions = z.infer<typeof responseAuthOptions>;

export const verifyAuthOptionsSchema = z.object({
  raw_id: z.string().min(1, "rawId is required"),
  authenticator_attachment: z.string().min(1, "authenticatorAttachment is required"),
  type: z.string().min(1, "type is required"),
  id: z.string().min(1, "id is required"),
  response: responseAuthOptions,
  client_extension_results: z.record(z.string(), z.any()).optional().default({}),
});

export type VerifyAuthOptionsPayload = z.infer<typeof verifyAuthOptionsSchema>;

export const verifyResponseAuthOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
  options: verifyAuthOptionsSchema,
});

export type VerifyResponseAuthOptionsPayload = z.infer<typeof verifyResponseAuthOptionsSchema>;
