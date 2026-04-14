import { z } from "zod";

const emailSchemaWithPreprocessing = z
  .preprocess((val) => (typeof val === "string" ? val.trim() : val), z.email())
  .pipe(z.string().min(1, "Email cannot be empty"));

export const registerOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
});

export type RegisterOptionsSchema = z.infer<typeof registerOptionsSchema>;

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
