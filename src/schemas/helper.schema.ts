import { z } from "zod";

export const emailSchemaWithPreprocessing = z
  .preprocess((val) => (typeof val === "string" ? val.trim() : val), z.email())
  .pipe(z.string().min(1, "Email cannot be empty"));
