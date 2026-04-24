import { z } from "zod";

export const emailSchemaWithPreprocessing = z
  .preprocess((val) => (typeof val === "string" ? val.trim() : val), z.email())
  .pipe(z.string().min(1, "Email cannot be empty"));

export const idSchema = z.object({
  id: z.string().min(1, "ID not valid"),
});
