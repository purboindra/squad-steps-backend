import z from "zod";
import { emailSchemaWithPreprocessing } from "./helper.schema";

export const loginOptionSchema = z.object({
  email: emailSchemaWithPreprocessing,
});

export type LoginOptionPayload = z.infer<typeof loginOptionSchema>;
