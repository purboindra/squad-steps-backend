import { z } from "zod";

const emailSchemaWithPreprocessing = z
  .preprocess((val) => (typeof val === "string" ? val.trim() : val), z.email())
  .pipe(z.string().min(1, "Email cannot be empty"));

export const registerOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
});

export type RegisterOptionsSchema = z.infer<typeof registerOptionsSchema>;

// 26.581.889
