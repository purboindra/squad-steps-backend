import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const generateTokenSchema = z.object({
  email: emailSchemaWithPreprocessing,
  username: z.string().min(1, "Username is required"),
});

export type GenerateTokenPayload = z.infer<typeof generateTokenSchema>;
