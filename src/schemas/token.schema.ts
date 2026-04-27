import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const generateTokenSchema = z.object({
  email: emailSchemaWithPreprocessing,
  username: z.string().min(1, "Username is required"),
});

export type GenerateTokenPayload = z.infer<typeof generateTokenSchema>;

export const rotateTokenSchema = z.object({
  refresh_token: z.string().refine((value) => typeof value === "string", { message: "Refresh token must be a string" }),
}).transform((data) => ({
  refreshToken: data.refresh_token,
}));

export type RotateTokenPayload = z.infer<typeof rotateTokenSchema>;
