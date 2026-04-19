import { z } from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const registerOptionsSchema = z.object({
  email: emailSchemaWithPreprocessing,
});

export type RegisterOptionsSchema = z.infer<typeof registerOptionsSchema>;
